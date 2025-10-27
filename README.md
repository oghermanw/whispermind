# WhisperMind - 語音轉文字與思維導圖生成器

WhisperMind 是一個基於 OpenAI Whisper Large V3 模型的語音轉文字 Web 應用程式，支援多語言語音識別、自動摘要生成和思維導圖創建。

## 功能特色

- 🎤 **多語言語音轉文字** - 支援多種音頻格式，自動檢測語言
- 📝 **智能摘要生成** - 使用 GPT-4 生成內容摘要和關鍵要點
- 🧠 **思維導圖創建** - 自動生成可視化的思維導圖
- 🌍 **多語言支援** - 支援中文、英文、日文、韓文等多種語言
- 📁 **多文件上傳** - 支援同時上傳多個音頻文件
- 💾 **結果導出** - 支援文字、摘要和思維導圖的導出功能

## 技術棧

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **後端**: Next.js API Routes
- **AI 服務**: OpenAI Whisper API, GPT-4
- **可視化**: D3.js
- **文件處理**: Multer, Formidable

## 安裝與運行

### 1. 克隆專案

```bash
git clone <repository-url>
cd WhisperMind
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設置環境變數

創建 `.env.local` 文件並添加以下內容：

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3009
```

### 4. 運行開發服務器

```bash
npm run dev
```

應用程式將在 http://localhost:3009 上運行。

## 使用說明

### 1. 上傳音頻文件
- 支援格式：MP3, WAV, M4A, AAC, OGG, FLAC, MP4, AVI, MOV, MKV
- 最大文件大小：100MB
- 支援拖拽上傳或點擊選擇文件

### 2. 語音轉文字
- 自動檢測音頻語言
- 生成分段轉錄結果
- 顯示轉錄信心度

### 3. 生成摘要
- 使用 GPT-4 分析轉錄內容
- 提取關鍵要點
- 支援多語言摘要

### 4. 創建思維導圖
- 基於轉錄內容和摘要生成
- 可視化展示內容結構
- 支援縮放和拖拽操作

## API 端點

### POST /api/upload
上傳音頻文件

**請求**: FormData with file
**回應**: 
```json
{
  "success": true,
  "message": "文件上傳成功",
  "fileId": "unique_file_id",
  "fileName": "filename.ext",
  "fileSize": 1024000,
  "fileType": "audio/mpeg"
}
```

### POST /api/transcribe
轉錄音頻文件

**請求**:
```json
{
  "fileId": "unique_file_id"
}
```

**回應**:
```json
{
  "text": "轉錄文字",
  "language": "zh",
  "confidence": 0.9,
  "duration": 120,
  "segments": [...]
}
```

### POST /api/summarize
生成內容摘要

**請求**:
```json
{
  "text": "轉錄文字",
  "language": "zh"
}
```

**回應**:
```json
{
  "summary": "摘要內容",
  "keyPoints": ["要點1", "要點2"],
  "language": "zh",
  "wordCount": 1000
}
```

### POST /api/mindmap
生成思維導圖

**請求**:
```json
{
  "text": "轉錄文字",
  "summary": "摘要內容",
  "keyPoints": ["要點1", "要點2"],
  "language": "zh"
}
```

**回應**:
```json
{
  "nodes": [...],
  "links": [...],
  "language": "zh"
}
```

## 部署

### Vercel 部署

1. 將代碼推送到 GitHub
2. 在 Vercel 中導入專案
3. 設置環境變數
4. 部署

### Docker 部署

```bash
# 構建鏡像
docker build -t whispermind .

# 運行容器
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key whispermind
```

## 限制與注意事項

- 免費試用限制：前 5 分鐘音頻免費
- 文件大小限制：100MB（上傳），25MB（Whisper API）
- 需要有效的 OpenAI API 密鑰
- 建議使用較短的音頻文件以獲得最佳效果

## 貢獻

歡迎提交 Issue 和 Pull Request 來改善這個專案。

## 許可證

MIT License

## 更新日誌

### v1.0.0
- 初始版本發布
- 支援多語言語音轉文字
- 集成 GPT-4 摘要生成
- 實現思維導圖可視化
- 支援多文件上傳
