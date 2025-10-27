import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET(request: NextRequest) {
  return await testWhisperAPI()
}

export async function POST(request: NextRequest) {
  return await testWhisperAPI()
}

async function testWhisperAPI() {
  try {
    console.log('🧪 測試 Whisper API...')
    
    // 檢查環境變量
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少 OpenAI API 密鑰',
        error: 'OPENAI_API_KEY 未設置'
      }, { status: 400 })
    }

    // 創建 OpenAI 客戶端
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    // 測試 API 連接
    try {
      // 嘗試列出模型來測試連接
      const models = await openai.models.list()
      console.log('✅ Whisper API 測試成功')
      
      return NextResponse.json({ 
        success: true, 
        message: 'Whisper API 可用',
        details: `找到 ${models.data.length} 個可用模型`
      })
    } catch (apiError: any) {
      console.log('❌ Whisper API 測試失敗:', apiError.message)
      
      if (apiError.code === 'unsupported_country_region_territory') {
        return NextResponse.json({ 
          success: false, 
          message: '您的地區不支援 OpenAI API',
          error: 'REGION_NOT_SUPPORTED'
        }, { status: 403 })
      }
      
      return NextResponse.json({ 
        success: false, 
        message: 'Whisper API 不可用',
        error: apiError.message
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Whisper API 測試錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: '測試失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

