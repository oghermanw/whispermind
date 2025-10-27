#!/bin/bash

echo "🔐 OpenAI API 密鑰安全檢查"
echo "=========================="

# 檢查是否有 API 密鑰
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY 環境變量未設置"
    echo "   請設置您的 OpenAI API 密鑰"
    exit 1
fi

# 檢查 API 密鑰格式
if [[ $OPENAI_API_KEY =~ ^sk-proj- ]]; then
    echo "✅ API 密鑰格式正確 (sk-proj-*)"
else
    echo "⚠️  API 密鑰格式可能不正確"
    echo "   預期格式: sk-proj-..."
fi

# 檢查 API 密鑰長度
key_length=${#OPENAI_API_KEY}
if [ $key_length -gt 50 ]; then
    echo "✅ API 密鑰長度適當 ($key_length 字符)"
else
    echo "⚠️  API 密鑰長度可能過短 ($key_length 字符)"
fi

# 檢查是否為佔位符
if [[ $OPENAI_API_KEY == *"your_openai_api_key_here"* ]]; then
    echo "❌ 檢測到佔位符 API 密鑰"
    echo "   請設置真實的 OpenAI API 密鑰"
    exit 1
fi

# 測試 API 連接
echo ""
echo "🧪 測試 API 連接..."
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    https://api.openai.com/v1/models)

if [ "$response" = "200" ]; then
    echo "✅ OpenAI API 連接成功"
else
    echo "❌ OpenAI API 連接失敗 (HTTP $response)"
    echo "   請檢查 API 密鑰是否有效"
fi

echo ""
echo "🔒 安全建議："
echo "1. 不要在代碼中硬編碼 API 密鑰"
echo "2. 使用環境變量存儲敏感信息"
echo "3. 定期輪換 API 密鑰"
echo "4. 監控 API 使用情況"
