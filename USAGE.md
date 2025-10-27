# WhisperMind 使用說明

## 快速開始

### 1. 啟動應用程式

```bash
# 安裝依賴
npm install

# 啟動開發服務器
npm run dev
```

應用程式將在 http://localhost:3009 上運行。

### 2. 設置環境變數

確保 `.env.local` 文件包含您的 OpenAI API 密鑰：

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3009
```

## 功能使用

### 上傳音頻文件

1. 點擊上傳區域或拖拽文件到上傳區域
2. 支援的音頻格式：
   - MP3, WAV, M4A, AAC, OGG, FLAC
   - MP4, AVI, MOV, MKV (視頻文件)
3. 最大文件大小：100MB
4. 可以同時上傳多個文件

### 語音轉文字

1. 上傳文件後，系統會自動開始轉錄
2. 支援多語言自動檢測
3. 顯示轉錄信心度和分段結果
4. 可以複製或下載轉錄文字

### 生成摘要

1. 轉錄完成後，系統會自動生成摘要
2. 使用 GPT-4 分析內容
3. 提取關鍵要點
4. 支援多語言摘要

### 創建思維導圖

1. 摘要生成後，系統會自動創建思維導圖
2. 可視化展示內容結構
3. 支援縮放和拖拽操作
4. 可以導出思維導圖

## API 使用

### 上傳文件

```bash
curl -X POST http://localhost:3009/api/upload \
  -F "file=@your_audio_file.mp3"
```

### 轉錄音頻

```bash
curl -X POST http://localhost:3009/api/transcribe \
  -H "Content-Type: application/json" \
  -d '{"fileId": "your_file_id"}'
```

### 生成摘要

```bash
curl -X POST http://localhost:3009/api/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "your_text", "language": "zh"}'
```

### 創建思維導圖

```bash
curl -X POST http://localhost:3009/api/mindmap \
  -H "Content-Type: application/json" \
  -d '{"text": "your_text", "summary": "your_summary", "keyPoints": ["point1", "point2"], "language": "zh"}'
```

## 故障排除

### 常見問題

1. **文件上傳失敗**
   - 檢查文件格式是否支援
   - 確認文件大小不超過 100MB
   - 檢查網絡連接

2. **轉錄失敗**
   - 確認 OpenAI API 密鑰正確
   - 檢查文件是否為有效的音頻格式
   - 確認文件大小不超過 25MB（Whisper API 限制）

3. **摘要生成失敗**
   - 確認 OpenAI API 密鑰正確
   - 檢查轉錄文字是否為空
   - 確認網絡連接正常

4. **思維導圖生成失敗**
   - 確認摘要生成成功
   - 檢查內容是否足夠生成思維導圖
   - 確認網絡連接正常

### 日誌查看

```bash
# 查看應用程式日誌
npm run dev

# 查看錯誤日誌
tail -f .next/server.log
```

## 性能優化

### 文件大小建議

- 音頻文件：建議 5-10MB 以獲得最佳性能
- 視頻文件：建議 10-20MB
- 避免上傳過大的文件

### 網絡優化

- 使用穩定的網絡連接
- 避免同時處理多個大文件
- 考慮使用 CDN 加速

## 安全注意事項

1. **API 密鑰安全**
   - 不要在代碼中硬編碼 API 密鑰
   - 使用環境變數存儲敏感信息
   - 定期輪換 API 密鑰

2. **文件安全**
   - 上傳的文件會存儲在本地
   - 定期清理上傳目錄
   - 考慮實現文件過期機制

3. **用戶數據**
   - 不存儲用戶的敏感信息
   - 實現適當的數據清理機制
   - 遵守相關隱私法規

## 部署建議

### 生產環境

1. 使用 HTTPS
2. 設置適當的 CORS 策略
3. 實現速率限制
4. 設置監控和日誌

### 擴展性

1. 使用 CDN 存儲文件
2. 實現隊列系統處理大文件
3. 考慮使用 Redis 緩存
4. 實現負載均衡

## 支援

如果您遇到問題或有建議，請：

1. 檢查本文檔的故障排除部分
2. 查看 GitHub Issues
3. 聯繫技術支援

## 更新日誌

### v1.0.0
- 初始版本發布
- 支援多語言語音轉文字
- 集成 GPT-4 摘要生成
- 實現思維導圖可視化
- 支援多文件上傳
