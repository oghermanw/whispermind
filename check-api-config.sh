#!/bin/bash

echo "🔍 檢查 API 配置..."

# 檢查 .env.local 文件
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local 文件不存在"
    echo "📝 創建 .env.local 文件..."
    cat > .env.local << 'EOF'
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom OpenAI Base URL (for proxy or custom endpoint)
# OPENAI_BASE_URL=https://api.openai.com/v1

# Optional: Proxy Configuration (if needed)
# PROXY_URL=http://proxy:port

# Application Configuration
NODE_ENV=development
PORT=3009

# Whisper Configuration
WHISPER_MODEL=base
WHISPER_PYTHON_PATH=./whisper-env/bin/python
WHISPER_SCRIPT_PATH=./whisper-real.py
EOF
    echo "✅ .env.local 文件已創建"
else
    echo "✅ .env.local 文件存在"
fi

# 檢查 API Key 配置
if grep -q "OPENAI_API_KEY=your_openai_api_key_here" .env.local; then
    echo "⚠️  請在 .env.local 中設置您的 OpenAI API Key"
    echo "   將 'your_openai_api_key_here' 替換為您的實際 API Key"
else
    echo "✅ OpenAI API Key 已配置"
fi

# 檢查應用程式是否運行
if curl -s http://localhost:3009/api/health > /dev/null; then
    echo "✅ 應用程式正在運行"
    
    # 測試 API 端點
    echo "🧪 測試 API 端點..."
    
    echo "  - 測試本地 Whisper..."
    if curl -s http://localhost:3009/api/test-local-whisper | grep -q "success"; then
        echo "    ✅ 本地 Whisper 可用"
    else
        echo "    ❌ 本地 Whisper 不可用"
    fi
    
    echo "  - 測試 OpenAI API..."
    if curl -s http://localhost:3009/api/test-whisper-api | grep -q "success"; then
        echo "    ✅ OpenAI API 可用"
    else
        echo "    ❌ OpenAI API 不可用 (可能是地區限制或 API Key 問題)"
    fi
else
    echo "❌ 應用程式未運行"
    echo "   請運行: npm run dev"
fi

echo ""
echo "📚 更多信息請查看 API_CONFIG_GUIDE.md"
