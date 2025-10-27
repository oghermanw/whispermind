#!/bin/bash

# WhisperMind 本地 Whisper 服務啟動腳本

echo "🚀 啟動 WhisperMind 本地服務..."

# 檢查 Python 是否安裝
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 未安裝，請先安裝 Python 3.8+"
    exit 1
fi

# 檢查 pip 是否安裝
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 未安裝，請先安裝 pip"
    exit 1
fi

echo "✅ Python 環境檢查通過"

# 安裝 Python 依賴
echo "📦 安裝 Python 依賴..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Python 依賴安裝失敗"
    exit 1
fi

echo "✅ Python 依賴安裝完成"

# 啟動 Python Whisper 服務
echo "🎵 啟動 Whisper 服務器..."
python3 whisper-server.py &

# 等待服務器啟動
sleep 5

# 檢查服務器是否運行
if curl -s http://localhost:8000/transcribe > /dev/null 2>&1; then
    echo "✅ Whisper 服務器啟動成功"
else
    echo "⚠️  Whisper 服務器可能還在啟動中..."
fi

# 啟動 Next.js 應用
echo "🌐 啟動 Next.js 應用..."
npm run dev



