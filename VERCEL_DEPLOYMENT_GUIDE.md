# 🚀 WhisperMind Vercel 部署指南

## 📋 部署前準備

### 1. 環境變量配置
在 Vercel 儀表板中設置以下環境變量：

```bash
# 必需環境變量
OPENAI_API_KEY=sk-proj-your-actual-api-key-here

# 可選環境變量
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NODE_ENV=production
```

### 2. Vercel 環境變量設置步驟

1. 登錄 [Vercel Dashboard](https://vercel.com/oghermanws-projects)
2. 選擇您的項目
3. 進入 Settings → Environment Variables
4. 添加以下變量：
   - `OPENAI_API_KEY`: 您的 OpenAI API 密鑰
   - `NEXT_PUBLIC_APP_URL`: 您的應用 URL

### 3. 部署命令

```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登錄 Vercel
vercel login

# 部署到 Vercel
vercel

# 生產環境部署
vercel --prod
```

## 🔒 安全檢查清單

- [ ] ✅ `.env.local` 文件未提交到 Git
- [ ] ✅ API 密鑰在 Vercel 環境變量中設置
- [ ] ✅ `vercel.json` 使用環境變量引用
- [ ] ✅ 敏感文件在 `.gitignore` 中
- [ ] ✅ 測試應用程式功能

## 🎯 功能限制說明

### Vercel 部署限制：
1. **本地 Whisper**: 無法在 Vercel 上運行（需要 Python 環境）
2. **文件上傳**: 僅支持 Whisper API 模式
3. **執行時間**: API 路由最大 30 秒執行時間
4. **文件大小**: 最大 4.5MB 上傳限制

### 建議的生產環境配置：
- 使用 Whisper API 進行轉錄
- 配置適當的錯誤處理
- 設置文件大小限制
- 添加用戶認證（未來版本）

## 📞 支持

如有問題，請檢查：
1. Vercel 部署日誌
2. 環境變量配置
3. API 密鑰有效性
4. 網絡連接狀態

---
**部署 URL**: https://vercel.com/oghermanws-projects
