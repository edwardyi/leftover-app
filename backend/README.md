# Backend API 說明

## 登入與權限驗證

- 請先呼叫 `/api/login` 取得 JWT token。
- 登入帳號（管理者）：
  - email: `admin@example.com`
  - password: `123456`
- 登入成功後，所有受保護 API 請在 HTTP header 加上：
  - `Authorization: Bearer <token>`

## 需要帶 token 的 API

以下 API 皆需帶上 token 才能存取：

- `/api/products`（GET, POST, PUT, DELETE, ...）
- `/api/inventory`（GET, POST, PUT, DELETE, ...）
- `/api/users`（GET, POST, PUT, DELETE, ...）
- `/api/locations`（GET）

> 若未帶 token 或 token 無效，會回傳 401 Unauthorized。

## 公開 API

- `/api/login`：登入取得 token
- `/api/i18n`：多語系資料（可視需求是否加驗證）

## 測試

- TDD 測試會自動先登入取得 token，並於每個請求帶上。

## PocketBase 資料同步（Go 版）

### 0. 設定 PocketBase 管理員帳號密碼

1. 請複製 `.env.example` 為 `.env`，並填入你的 PocketBase 管理員帳號密碼：
   ```bash
   cp .env.example .env
   # 編輯 .env
   ```
   內容範例：
   ```
   PB_ADMIN_EMAIL=admin@example.com
   PB_ADMIN_PASSWORD=your_password_here
   ```

### 1. 安裝依賴

請先安裝 Go 套件：
```bash
go get github.com/go-resty/resty/v2
go get github.com/joho/godotenv
```

### 2. 使用方式

1. 確保 mock-data/products.json、inventory.json、users.json、locations.json 都在 backend/mock-data 目錄下。
2. 啟動 PocketBase 伺服器（預設 http://127.0.0.1:8090）。
3. 在 backend 目錄下執行：
   ```bash
   go run sync_to_pocketbase.go
   ```
   - 若要強制重建 collection 並重新匯入資料，可加上 refresh 參數：
   ```bash
   go run sync_to_pocketbase.go refresh=true
   ```

### 3. 功能說明

- 程式會自動讀取 mock json 檔案，檢查 PocketBase 是否已有對應 collection。
- 若 collection 不存在，會自動建立一個帶有 `_pb` 後綴的新 collection，欄位型別自動推斷。
- 會將所有資料自動匯入對應 collection。
- 欄位名稱與型別需與 json 結構一致。
- 若加上 refresh 參數，會先刪除 collection 再重建並匯入資料。

### 4. 注意事項

- users collection 若要支援登入，建議手動建立 auth collection。
- 匯入 users 時密碼請用明文，PocketBase 會自動 hash。
- 欄位型別推斷僅根據第一筆資料，建議資料結構要一致。
- 若遇到權限問題，請確認你有管理員權限或 API Token。

---

## Docker 與 docker-compose 使用說明

### 1. 建立與啟動服務

1. 在專案根目錄執行：
   ```bash
   docker-compose up --build
   ```
2. 這會啟動：
   - PocketBase（http://localhost:8090）
   - backend（Go/Node.js/轉換腳本環境）

### 2. 進入 backend 容器

```bash
docker-compose exec backend bash
```

### 3. 在容器內執行 Go/Node.js 腳本

```bash
go run sync_to_pocketbase.go
# 或
node mock-data/convert_to_pocketbase.js
```

### 4. 其他說明

- Dockerfile 會安裝 Go、Node.js、PocketBase 並複製專案檔案。
- docker-compose.yml 可依需求擴充前端服務。
- PocketBase 資料會存放於 backend/pb_data 目錄。

---

## 其他 API 與測試說明

如需更多範例請求或前端串接方式，請參考專案文件或聯絡開發者。 