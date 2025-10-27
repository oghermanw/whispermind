# 本地 Whisper Large V3 設置指南

## 🎯 概述

本指南將幫助您設置本地 Whisper Large V3 模型，以解決 OpenAI API 地區限制問題。

## 📋 系統要求

- **Node.js**: 18+ 
- **內存**: 至少 8GB RAM (推薦 16GB+)
- **磁盤空間**: 至少 3GB 可用空間
- **網絡**: 穩定的互聯網連接用於下載模型

## 🚀 快速設置

### 1. 下載模型

```bash
# 下載 Whisper Large V3 模型
npm run download-model
```

### 2. 啟動應用程式

```bash
# 開發模式
npm run dev

# 或生產模式
npm run build
npm start
```

## 🔧 詳細設置步驟

### 步驟 1: 安裝依賴

```bash
npm install
```

### 步驟 2: 下載模型

```bash
npm run download-model
```

這將：
- 下載 Whisper Large V3 模型 (約 3GB)
- 保存到本地緩存
- 測試模型功能

### 步驟 3: 驗證設置

訪問 http://localhost:3009 並上傳一個音頻文件測試。

## 📊 模型信息

- **模型名稱**: openai/whisper-large-v3
- **模型大小**: ~3GB
- **支持語言**: 99 種語言
- **精度**: 比 Whisper Large V2 提升 10-20%
- **架構**: 基於 Transformer 的序列到序列模型

## ⚡ 性能優化

### 內存優化

```javascript
// 在 transcribe-local/route.ts 中
const pipeline = await createPipeline(
  'automatic-speech-recognition',
  'openai/whisper-large-v3',
  {
    quantized: true, // 使用量化模型減少內存使用
  }
)
```

### GPU 加速 (可選)

如果您有 NVIDIA GPU，可以啟用 CUDA 加速：

```bash
# 安裝 CUDA 支持
npm install @tensorflow/tfjs-node-gpu
```

## 🛠️ 故障排除

### 常見問題

1. **模型下載失敗**
   ```bash
   # 清理緩存並重試
   rm -rf ~/.cache/huggingface
   npm run download-model
   ```

2. **內存不足**
   - 關閉其他應用程式
   - 使用量化模型
   - 增加系統虛擬內存

3. **轉錄速度慢**
   - 確保有足夠的 RAM
   - 考慮使用較小的模型 (whisper-base)
   - 使用 GPU 加速

### 日誌調試

```bash
# 查看詳細日誌
DEBUG=* npm run dev
```

## 🔄 模型更新

```bash
# 更新到最新版本
npm run download-model
```

## 📈 性能基準

| 硬件配置 | 轉錄速度 | 內存使用 |
|---------|---------|---------|
| CPU (8核) | ~2x 實時 | ~4GB |
| CPU (16核) | ~4x 實時 | ~4GB |
| GPU (RTX 3080) | ~10x 實時 | ~6GB |

## 🌐 網絡要求

- **下載速度**: 至少 10 Mbps
- **穩定性**: 需要穩定的連接
- **防火牆**: 允許 HTTPS 連接

## 💡 最佳實踐

1. **首次使用**: 建議先下載模型再啟動應用
2. **生產環境**: 考慮使用 Docker 容器化
3. **監控**: 監控內存和 CPU 使用率
4. **備份**: 定期備份模型緩存

## 🔒 安全考慮

- 模型文件存儲在本地，不會上傳到外部服務
- 音頻文件在處理後可以自動刪除
- 建議定期清理上傳目錄

## 📞 支持

如果遇到問題：

1. 檢查系統要求
2. 查看錯誤日誌
3. 嘗試重新下載模型
4. 聯繫技術支持

---

**注意**: 首次下載模型可能需要 10-30 分鐘，具體時間取決於網絡速度。請耐心等待。



