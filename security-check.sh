#!/bin/bash

echo "🔒 WhisperMind 安全檢查腳本"
echo "================================"

# 檢查環境變量文件
echo "1. 檢查環境變量文件..."
if [ -f ".env.local" ]; then
    echo "❌ 發現 .env.local 文件 - 這不應該被提交到 Git"
    echo "   請確保 .env.local 在 .gitignore 中"
else
    echo "✅ 沒有發現 .env.local 文件"
fi

if [ -f ".env" ]; then
    echo "❌ 發現 .env 文件 - 這不應該被提交到 Git"
else
    echo "✅ 沒有發現 .env 文件"
fi

# 檢查 .gitignore
echo ""
echo "2. 檢查 .gitignore 配置..."
if grep -q "\.env" .gitignore; then
    echo "✅ .env 文件已在 .gitignore 中"
else
    echo "❌ .env 文件未在 .gitignore 中"
fi

if grep -q "\.env\.local" .gitignore; then
    echo "✅ .env.local 文件已在 .gitignore 中"
else
    echo "❌ .env.local 文件未在 .gitignore 中"
fi

# 檢查敏感文件
echo ""
echo "3. 檢查敏感文件..."
sensitive_files=("*.key" "*.pem" "*.p12" "*.pfx" "whisper-env/" "uploads/")
for pattern in "${sensitive_files[@]}"; do
    if ls $pattern 2>/dev/null | grep -q .; then
        echo "⚠️  發現敏感文件/目錄: $pattern"
    else
        echo "✅ 未發現敏感文件: $pattern"
    fi
done

# 檢查 API 密鑰
echo ""
echo "4. 檢查 API 密鑰配置..."
if [ -f ".env.example" ]; then
    echo "✅ 發現 .env.example 文件"
    if grep -q "your_openai_api_key_here" .env.example; then
        echo "✅ API 密鑰使用佔位符"
    else
        echo "❌ API 密鑰可能包含真實值"
    fi
else
    echo "❌ 未發現 .env.example 文件"
fi

# 檢查 Git 狀態
echo ""
echo "5. 檢查 Git 狀態..."
if git status --porcelain | grep -q "\.env"; then
    echo "❌ 發現 .env 文件在 Git 暫存區中"
    echo "   請運行: git reset HEAD .env*"
else
    echo "✅ 沒有 .env 文件在 Git 暫存區中"
fi

# 檢查 Vercel 配置
echo ""
echo "6. 檢查 Vercel 配置..."
if [ -f "vercel.json" ]; then
    echo "✅ 發現 vercel.json 文件"
    if grep -q "@openai_api_key" vercel.json; then
        echo "✅ Vercel 配置使用環境變量引用"
    else
        echo "❌ Vercel 配置可能包含硬編碼密鑰"
    fi
else
    echo "❌ 未發現 vercel.json 文件"
fi

echo ""
echo "🔒 安全檢查完成！"
echo ""
echo "📋 部署到 Vercel 前的檢查清單："
echo "1. ✅ 確保所有 API 密鑰都在 Vercel 環境變量中設置"
echo "2. ✅ 確保 .env.local 文件不會被提交到 Git"
echo "3. ✅ 確保 vercel.json 使用環境變量引用"
echo "4. ✅ 測試應用程式在生產環境中的功能"
echo ""
echo "🚀 準備部署到: https://vercel.com/oghermanws-projects"
