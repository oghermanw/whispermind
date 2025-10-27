import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { TranscriptionData, SummaryData } from '@/types'

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { transcription, summary } = await request.json()

    if (!transcription || !summary) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少轉錄或摘要數據' 
      }, { status: 400 })
    }

    console.log('🎯 生成 Markmap 思維導圖數據...')

    // 根據語言選擇系統提示
    const systemPrompt = transcription.language === 'zh' || transcription.language === 'chinese' 
      ? `你是一個專業的思維導圖設計師。請根據提供的轉錄文字和摘要，生成一個結構化的 Markdown 格式思維導圖。

要求：
1. 使用 Markdown 的列表格式（- 和子項目）
2. 層次結構清晰，最多 3-4 層
3. 包含主要主題、關鍵點和細節
4. 語言使用中文
5. 結構要邏輯清晰，便於理解

格式示例：
# 主要主題
- 一級主題
  - 二級主題
    - 三級細節
  - 另一個二級主題
- 另一個一級主題`

      : `You are a professional mind map designer. Please create a structured Markdown format mind map based on the provided transcription and summary.

Requirements:
1. Use Markdown list format (- and sub-items)
2. Clear hierarchical structure, maximum 3-4 levels
3. Include main topics, key points, and details
4. Use English language
5. Structure should be logical and easy to understand

Format example:
# Main Topic
- First Level Topic
  - Second Level Topic
    - Third Level Detail
  - Another Second Level Topic
- Another First Level Topic`

    const userPrompt = `轉錄文字：${transcription.text}

摘要：
${summary.summary}

關鍵點：
${summary.keyPoints.join(', ')}

請基於以上內容生成一個結構化的 Markdown 思維導圖。`

    try {
      const openai = getOpenAI()
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const markdownContent = completion.choices[0]?.message?.content || ''
      
      console.log('✅ Markmap 數據生成完成')
      
      return NextResponse.json({
        success: true,
        markdown: markdownContent,
        language: transcription.language
      })

    } catch (openaiError: any) {
      console.error('OpenAI API 錯誤:', openaiError)
      
      if (openaiError.code === 'unsupported_country_region_territory') {
        return NextResponse.json({ 
          success: false, 
          message: '您的地區不支援 OpenAI API。請使用 VPN 或代理服務器。',
          errorCode: 'REGION_NOT_SUPPORTED'
        }, { status: 403 })
      }
      
      throw openaiError
    }

  } catch (error) {
    console.error('Markmap 生成錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: '思維導圖生成失敗，請稍後重試' 
    }, { status: 500 })
  }
}

