# WhisperMind 端口配置

## 端口設置

WhisperMind 應用程式現在配置為使用端口 **3009**。

## 已更新的文件

### 1. 環境變數
- `.env.local` - 設置 `NEXT_PUBLIC_APP_URL=http://localhost:3009`

### 2. 包管理
- `package.json` - 更新開發和生產腳本使用端口 3009

### 3. Docker 配置
- `Dockerfile` - 暴露端口 3009
- `docker-compose.yml` - 映射端口 3009:3009

### 4. 測試腳本
- `test-api.js` - 所有 API 測試使用端口 3009
- `test-port.js` - 端口連接測試

### 5. 部署腳本
- `deploy.sh` - 更新訪問 URL 為端口 3009

### 6. 文檔
- `README.md` - 更新所有端口引用
- `USAGE.md` - 更新 API 示例和說明
- `PROJECT_SUMMARY.md` - 已包含正確端口信息

## 訪問地址

- **主應用程式**: http://localhost:3009
- **健康檢查**: http://localhost:3009/api/health
- **API 端點**: http://localhost:3009/api/*

## 啟動命令

```bash
# 開發模式
npm run dev

# 生產模式
npm run build
npm start

# Docker 模式
docker-compose up -d
```

## 端口測試

```bash
# 測試端口連接
node test-port.js

# 測試 API 端點
node test-api.js
```

## 注意事項

1. 確保端口 3009 沒有被其他應用程式佔用
2. 如果端口被佔用，可以修改 `package.json` 中的端口設置
3. Docker 容器會自動映射到主機的 3009 端口
4. 所有 API 調用都應該使用新的端口 3009

## 故障排除

如果遇到端口相關問題：

1. 檢查端口是否被佔用：
   ```bash
   lsof -i :3009
   ```

2. 停止現有服務：
   ```bash
   pkill -f "next dev"
   ```

3. 重新啟動服務：
   ```bash
   npm run dev
   ```

4. 檢查服務狀態：
   ```bash
   curl http://localhost:3009/api/health
   ```



