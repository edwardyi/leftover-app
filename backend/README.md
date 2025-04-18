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

---

如需更多範例請求或前端串接方式，請參考專案文件或聯絡開發者。 