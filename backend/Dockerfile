# 使用官方 Go 映像檔
FROM golang:1.21-bullseye as builder

# 安裝 nodejs 及 unzip
RUN apt-get update && apt-get install -y nodejs npm unzip wget

# 下載 PocketBase
WORKDIR /app
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.0/pocketbase_0.21.0_linux_amd64.zip \
    && unzip pocketbase_0.21.0_linux_amd64.zip \
    && mv pocketbase /usr/local/bin/pocketbase

# 複製專案檔案
COPY . /app

# 安裝 Go 依賴
RUN cd /app && go mod init backend && go get github.com/go-resty/resty/v2

# 安裝 Node.js 依賴（如有 package.json）
RUN if [ -f /app/mock-data/package.json ]; then cd /app/mock-data && npm install; fi

# 預設啟動 bash
CMD ["/bin/bash"] 