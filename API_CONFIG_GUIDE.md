# API 配置指南

## 🔑 OpenAI API 配置

### 1. 獲取 API Key
1. 訪問 [OpenAI Platform](https://platform.openai.com/)
2. 登入您的帳戶
3. 前往 "API Keys" 頁面
4. 點擊 "Create new secret key"
5. 複製生成的 API Key

### 2. 配置 .env.local 文件
在項目根目錄的 `.env.local` 文件中設置：

```bash
# 必需的 OpenAI API Key
OPENAI_API_KEY=sk-your-actual-api-key-here

# 可選：自定義 API 端點（如果需要代理）
# OPENAI_BASE_URL=https://api.openai.com/v1

# 可選：代理配置（如果遇到地區限制）
# PROXY_URL=http://proxy-server:port
```

### 3. 地區限制解決方案

如果您遇到 "Country, region, or territory not supported" 錯誤：

#### 方案 A: 使用代理
```bash
# 在 .env.local 中添加
PROXY_URL=http://your-proxy-server:port
```

#### 方案 B: 使用本地 Whisper（推薦）
應用程式已配置本地 Whisper 作為備選方案：
- 無需 API Key
- 完全離線運行
- 支持多種語言

### 4. 測試 API 連接

#### 測試 OpenAI API：
```bash
curl http://localhost:3009/api/test-whisper-api
```

#### 測試本地 Whisper：
```bash
curl http://localhost:3009/api/test-local-whisper
```

### 5. 常見問題

#### Q: API Key 無效
A: 檢查 `.env.local` 文件中的 `OPENAI_API_KEY` 是否正確設置

#### Q: 地區限制錯誤
A: 使用本地 Whisper 或配置代理服務器

#### Q: 摘要功能不工作
A: 摘要功能需要 OpenAI API，如果 API 不可用，請配置正確的 API Key 或使用代理

### 6. 安全注意事項

- 永遠不要將 `.env.local` 文件提交到版本控制
- 定期輪換 API Key
- 監控 API 使用量和費用

## 🎯 功能對應

| 功能 | 需要 API | 備選方案 |
|------|----------|----------|
| 轉錄 | OpenAI API 或 本地 Whisper | ✅ 本地 Whisper |
| 摘要 | OpenAI API | ❌ 無備選 |
| 思維導圖 | OpenAI API | ❌ 無備選 |

## 📞 支持

如果遇到問題，請檢查：
1. `.env.local` 文件是否存在且配置正確
2. API Key 是否有效
3. 網絡連接是否正常
4. 是否遇到地區限制
