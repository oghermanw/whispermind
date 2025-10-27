#!/bin/bash

# WhisperMind 部署腳本

echo "🚀 開始部署 WhisperMind..."

# 檢查 Node.js 版本
echo "📋 檢查 Node.js 版本..."
node --version
npm --version

# 安裝依賴
echo "📦 安裝依賴..."
npm install

# 檢查環境變數
echo "🔍 檢查環境變數..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  警告: .env.local 文件不存在"
    echo "請創建 .env.local 文件並添加您的 OpenAI API 密鑰"
    echo "OPENAI_API_KEY=your_openai_api_key_here"
    echo "NEXT_PUBLIC_APP_URL=http://localhost:3009"
fi

# 創建上傳目錄
echo "📁 創建上傳目錄..."
mkdir -p uploads

# 檢查 TypeScript 編譯
echo "🔧 檢查 TypeScript 編譯..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ TypeScript 編譯檢查通過"
else
    echo "❌ TypeScript 編譯檢查失敗"
    exit 1
fi

# 構建應用程式
echo "🏗️  構建應用程式..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 應用程式構建成功"
else
    echo "❌ 應用程式構建失敗"
    exit 1
fi

# 啟動應用程式
echo "🎉 部署完成！"
echo "📱 應用程式已準備就緒"
echo "🌐 訪問 http://localhost:3009 開始使用"

# 可選：啟動生產服務器
read -p "是否現在啟動生產服務器？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 啟動生產服務器..."
    npm start
fi
