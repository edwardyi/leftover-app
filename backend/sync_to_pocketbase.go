package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/go-resty/resty/v2"
	"github.com/joho/godotenv"
)

const pbURL = "http://pocketbase:8090/api"

func main() {
	// 載入 .env
	godotenv.Load(".env")
	adminEmail := os.Getenv("PB_ADMIN_EMAIL")
	adminPassword := os.Getenv("PB_ADMIN_PASSWORD")
	if adminEmail == "" || adminPassword == "" {
		panic("請在 .env 設定 PB_ADMIN_EMAIL 與 PB_ADMIN_PASSWORD")
	}

	client := resty.New()

	// 登入 PocketBase 管理員
	loginRes, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(map[string]string{
			"identity": adminEmail,
			"password": adminPassword,
		}).
		Post(pbURL + "/admins/auth-with-password")
	if err != nil {
		panic("PocketBase 管理員登入失敗")
	}
	var loginData struct {
		Token string `json:"token"`
	}
	json.Unmarshal(loginRes.Body(), &loginData)
	if loginData.Token == "" {
		panic("PocketBase 管理員登入失敗，請檢查帳號密碼")
	}
	client.SetHeader("Authorization", "Bearer "+loginData.Token)

	refresh := false
	if len(os.Args) > 1 && os.Args[1] == "refresh=true" {
		refresh = true
	}

	files := []struct {
		File    string
		Key     string
		ColName string
	}{
		{"mock-data/products.json", "products", "products_pb"},
		{"mock-data/inventory.json", "inventory", "inventory_pb"},
		{"mock-data/users.json", "users", "users_pb"},
		{"mock-data/locations.json", "locations", "locations_pb"},
	}

	for _, f := range files {
		raw, err := ioutil.ReadFile(f.File)
		if err != nil {
			fmt.Printf("讀取 %s 失敗: %v\n", f.File, err)
			continue
		}
		var wrap map[string]json.RawMessage
		if err := json.Unmarshal(raw, &wrap); err != nil {
			fmt.Printf("解析 %s 失敗: %v\n", f.File, err)
			continue
		}
		var arr []map[string]interface{}
		if err := json.Unmarshal(wrap[f.Key], &arr); err != nil {
			fmt.Printf("解析 %s 失敗: %v\n", f.File, err)
			continue
		}

		colName := f.ColName
		if refresh && collectionExists(client, colName) {
			fmt.Printf("refresh 模式，刪除 collection %s\n", colName)
			deleteCollection(client, colName)
		}
		if !collectionExists(client, colName) {
			fmt.Printf("Collection %s 不存在，自動建立 %s\n", f.ColName, colName)
			createCollection(client, colName, arr)
		}

		for _, rec := range arr {
			// 將來源 id 欄位轉為 serial_id
			if idVal, ok := rec["id"]; ok {
				rec["serial_id"] = idVal
				delete(rec, "id")
			}
			serial, ok := rec["serial_id"]
			if !ok {
				fmt.Println("此資料無 serial_id，跳過匯入")
				// continue
			}
			// 檢查 serial_id 是否已存在
			filter := fmt.Sprintf("serial_id=%v", serial)
			checkResp, _ := client.R().
				SetQueryParam("filter", filter).
				Get(fmt.Sprintf("%s/collections/%s/records", pbURL, colName))
			var checkData struct {
				Items []interface{} `json:"items"`
			}
			json.Unmarshal(checkResp.Body(), &checkData)
			if len(checkData.Items) > 0 {
				fmt.Printf("serial_id=%v 已存在於 %s，跳過匯入\n", serial, colName)
				continue
			}
			resp, err := client.R().
				SetHeader("Content-Type", "application/json").
				SetBody(rec).
				Post(fmt.Sprintf("%s/collections/%s/records", pbURL, colName))
			fmt.Println("寫入資料回傳：", string(resp.Body()))
			if err != nil {
				fmt.Printf("匯入 %s 資料失敗: %v\n", colName, err)
			}
		}
		fmt.Printf("已同步 %s 到 %s\n", f.File, colName)
	}
}

func collectionExists(client *resty.Client, name string) bool {
	resp, err := client.R().Get(pbURL + "/collections")
	if err != nil {
		return false
	}
	var result struct {
		Items []struct {
			Name string `json:"name"`
		} `json:"items"`
	}
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		return false
	}
	for _, c := range result.Items {
		if c.Name == name {
			return true
		}
	}
	return false
}

func createCollection(client *resty.Client, name string, arr []map[string]interface{}) {
	if len(arr) == 0 {
		return
	}
	// 保留字
	reserved := map[string]bool{
		"id": true, "created": true, "updated": true, "collectionId": true, "collectionName": true, "expand": true,
	}
	fields := []map[string]interface{}{}
	serialType := "text"
	if idVal, ok := arr[0]["id"]; ok {
		switch idVal.(type) {
		case float64:
			serialType = "number"
		case bool:
			serialType = "bool"
		}
	}
	fields = append(fields, map[string]interface{}{
		"name":     "serial_id",
		"type":     serialType,
		"required": false,
	})
	for k, v := range arr[0] {
		if reserved[k] || k == "serial_id" {
			continue // 跳過保留字與 serial_id
		}
		ftype := "text"
		switch v.(type) {
		case float64:
			ftype = "number"
		case bool:
			ftype = "bool"
		}
		fields = append(fields, map[string]interface{}{
			"name":     k,
			"type":     ftype,
			"required": false,
		})
	}
	payload := map[string]interface{}{
		"name":   name,
		"type":   "base",
		"schema": fields,
	}
	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetBody(payload).
		Post(pbURL + "/collections")
	fmt.Println("建立 collection 回傳：", string(resp.Body()))
	if err != nil {
		fmt.Printf("建立 collection %s 失敗: %v\n", name, err)
	}
}

func deleteCollection(client *resty.Client, name string) {
	resp, err := client.R().
		Delete(fmt.Sprintf("%s/collections/%s", pbURL, name))
	fmt.Println("刪除 collection 回傳：", string(resp.Body()))
	if err != nil {
		fmt.Printf("刪除 collection %s 失敗: %v\n", name, err)
	}
} 