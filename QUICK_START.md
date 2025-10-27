# 🚀 WhisperMind 快速開始指南

## 解決地區限制問題

由於 OpenAI API 在您的地區不可用，我們提供了本地 Whisper Large V3 模型解決方案。

## 📋 系統要求

- **Python 3.8+** (必需)
- **Node.js 18+** (已安裝)
- **內存**: 至少 8GB RAM
- **磁盤空間**: 至少 3GB

## 🎯 一鍵啟動

```bash
# 運行自動設置腳本
./start-whisper.sh
```

這個腳本會：
1. ✅ 檢查 Python 環境
2. 📦 安裝 Python 依賴
3. 🎵 啟動 Whisper 服務器
4. 🌐 啟動 Web 應用

## 🔧 手動設置

如果自動腳本失敗，可以手動執行：

### 1. 安裝 Python 依賴

```bash
pip3 install -r requirements.txt
```

### 2. 啟動 Whisper 服務器

```bash
python3 whisper-server.py
```

### 3. 啟動 Web 應用

```bash
npm run dev
```

## 🌐 訪問應用

- **主應用**: http://localhost:3009
- **Whisper 服務**: http://localhost:8000

## 📊 功能特色

- ✅ **本地轉錄**: 使用 Whisper Large V3 模型
- ✅ **多語言支持**: 99 種語言自動檢測
- ✅ **高精度**: 比 Whisper Large V2 提升 10-20%
- ✅ **離線工作**: 不需要互聯網連接
- ✅ **隱私保護**: 音頻文件不會上傳到外部服務

## 🛠️ 故障排除

### 常見問題

1. **Python 未安裝**
   ```bash
   # macOS
   brew install python3
   
   # Ubuntu/Debian
   sudo apt install python3 python3-pip
   ```

2. **依賴安裝失敗**
   ```bash
   # 升級 pip
   pip3 install --upgrade pip
   
   # 重新安裝
   pip3 install -r requirements.txt
   ```

3. **內存不足**
   - 關閉其他應用程式
   - 重啟電腦
   - 考慮使用較小的模型

4. **端口被佔用**
   ```bash
   # 檢查端口使用
   lsof -i :8000
   lsof -i :3009
   
   # 終止進程
   kill -9 <PID>
   ```

## 📈 性能優化

### 首次使用
- 模型下載需要 10-30 分鐘
- 建議在良好網絡環境下進行

### 轉錄速度
- **CPU (8核)**: ~2x 實時速度
- **CPU (16核)**: ~4x 實時速度
- **GPU**: ~10x 實時速度

## 🔒 安全說明

- ✅ 所有處理都在本地進行
- ✅ 音頻文件不會上傳到外部服務
- ✅ 模型文件存儲在本地緩存
- ✅ 可以隨時刪除上傳的文件

## 📞 獲取幫助

如果遇到問題：

1. 檢查系統要求
2. 查看錯誤日誌
3. 嘗試重新啟動服務
4. 聯繫技術支持

---

**🎉 享受本地 Whisper 轉錄服務！**



