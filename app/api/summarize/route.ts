import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { SummaryData } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 本地摘要生成函數
function generateLocalSummary(text: string, language: string): SummaryData {
  const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 10)
  const words = text.split(/\s+/).filter(w => w.trim().length > 0)
  
  // 生成簡單摘要（取前3個句子）
  const summary = sentences.slice(0, 3).join('。') + (sentences.length > 3 ? '...' : '')
  
  // 生成關鍵點（取重要句子）
  const keyPoints = sentences.slice(0, 5).map(s => s.trim()).filter(s => s.length > 15)
  
  return {
    summary: summary || text.substring(0, 200) + '...',
    keyPoints: keyPoints.length > 0 ? keyPoints : ['無法提取關鍵要點'],
    language: language || 'unknown',
    wordCount: words.length
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    if (!text) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少轉錄文字' 
      }, { status: 400 })
    }

    // 檢查是否有 OpenAI API Key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      console.log('⚠️ OpenAI API Key 未配置，使用本地摘要生成')
      const localSummary = generateLocalSummary(text, language)
      return NextResponse.json(localSummary)
    }

    // 根據語言選擇系統提示
    const getSystemPrompt = (lang: string) => {
      const prompts: { [key: string]: string } = {
        'zh': '你是一個專業的摘要助手。請為以下中文語音轉錄內容生成一個簡潔的摘要，並提取關鍵要點。摘要應該包含主要內容和重要信息。',
        'en': 'You are a professional summarization assistant. Please generate a concise summary for the following English speech transcription and extract key points. The summary should include main content and important information.',
        'ja': 'あなたは専門的な要約アシスタントです。以下の日本語音声転写内容に対して簡潔な要約を生成し、キーポイントを抽出してください。要約には主要内容と重要な情報を含める必要があります。',
        'ko': '당신은 전문적인 요약 어시스턴트입니다. 다음 한국어 음성 전사 내용에 대해 간결한 요약을 생성하고 핵심 포인트를 추출해 주세요. 요약에는 주요 내용과 중요한 정보가 포함되어야 합니다.',
        'es': 'Eres un asistente profesional de resumen. Por favor, genera un resumen conciso para la siguiente transcripción de audio en español y extrae puntos clave. El resumen debe incluir el contenido principal y la información importante.',
        'fr': 'Vous êtes un assistant professionnel de résumé. Veuillez générer un résumé concis pour la transcription audio française suivante et extraire les points clés. Le résumé doit inclure le contenu principal et les informations importantes.',
        'de': 'Sie sind ein professioneller Zusammenfassungsassistent. Bitte erstellen Sie eine prägnante Zusammenfassung für die folgende deutsche Audiotranskription und extrahieren Sie Schlüsselpunkte. Die Zusammenfassung sollte Hauptinhalt und wichtige Informationen enthalten.',
        'it': 'Sei un assistente professionale per i riassunti. Per favore, genera un riassunto conciso per la seguente trascrizione audio italiana ed estrai i punti chiave. Il riassunto dovrebbe includere il contenuto principale e le informazioni importanti.',
        'pt': 'Você é um assistente profissional de resumo. Por favor, gere um resumo conciso para a seguinte transcrição de áudio em português e extraia pontos-chave. O resumo deve incluir o conteúdo principal e informações importantes.',
        'ru': 'Вы профессиональный помощник по составлению резюме. Пожалуйста, создайте краткое резюме для следующей русской аудиотранскрипции и извлеките ключевые моменты. Резюме должно включать основное содержание и важную информацию.',
        'ar': 'أنت مساعد احترافي في التلخيص. يرجى إنشاء ملخص موجز للنسخ الصوتي العربي التالي واستخراج النقاط الرئيسية. يجب أن يتضمن الملخص المحتوى الرئيسي والمعلومات المهمة.',
        'hi': 'आप एक पेशेवर सारांश सहायक हैं। कृपया निम्नलिखित हिंदी ऑडियो ट्रांसक्रिप्शन के लिए एक संक्षिप्त सारांश तैयार करें और मुख्य बिंदुओं को निकालें। सारांश में मुख्य सामग्री और महत्वपूर्ण जानकारी शामिल होनी चाहिए।'
      }
      return prompts[lang] || prompts['en']
    }

    const systemPrompt = getSystemPrompt(language || 'en')

    // 使用 GPT-4 生成摘要
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `請為以下內容生成摘要和關鍵要點：\n\n${text}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('無法生成摘要')
    }

    // 解析回應，分離摘要和關鍵要點
    const lines = response.split('\n').filter(line => line.trim())
    let summary = ''
    const keyPoints: string[] = []

    let currentSection = 'summary'
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine.includes('關鍵要點') || 
          trimmedLine.includes('Key Points') || 
          trimmedLine.includes('キーポイント') ||
          trimmedLine.includes('핵심 포인트') ||
          trimmedLine.includes('Puntos Clave') ||
          trimmedLine.includes('Points Clés') ||
          trimmedLine.includes('Schlüsselpunkte') ||
          trimmedLine.includes('Punti Chiave') ||
          trimmedLine.includes('Pontos-chave') ||
          trimmedLine.includes('Ключевые моменты') ||
          trimmedLine.includes('النقاط الرئيسية') ||
          trimmedLine.includes('मुख्य बिंदु')) {
        currentSection = 'keyPoints'
        continue
      }

      if (currentSection === 'summary') {
        if (trimmedLine && !trimmedLine.match(/^\d+\./)) {
          summary += trimmedLine + ' '
        }
      } else if (currentSection === 'keyPoints') {
        if (trimmedLine.match(/^\d+\./) || trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
          const point = trimmedLine.replace(/^\d+\.\s*/, '').replace(/^[•-]\s*/, '').trim()
          if (point) {
            keyPoints.push(point)
          }
        }
      }
    }

    // 如果沒有找到關鍵要點，嘗試從摘要中提取
    if (keyPoints.length === 0) {
      // 嘗試從原始回應中提取關鍵要點
      const keyPointsMatch = response.match(/關鍵要點[：:]\s*(.+?)(?:\n\n|\n$|$)/s)
      if (keyPointsMatch) {
        const keyPointsText = keyPointsMatch[1]
        const points = keyPointsText.split(/[1-9]\./).filter(p => p.trim().length > 0)
        keyPoints.push(...points.map(p => p.trim()).slice(0, 5))
      } else {
        // 如果還是沒有，從摘要中提取句子
        const sentences = summary.split(/[.!?。！？]/).filter(s => s.trim().length > 10)
        keyPoints.push(...sentences.slice(0, 5).map(s => s.trim()))
      }
    }

    // 計算字數
    const wordCount = text.split(/\s+/).length

    const summaryData: SummaryData = {
      summary: summary.trim() || response,
      keyPoints: keyPoints.length > 0 ? keyPoints : ['無法提取關鍵要點'],
      language: language || 'unknown',
      wordCount: wordCount
    }

    return NextResponse.json(summaryData)

  } catch (error) {
    console.error('摘要生成錯誤:', error)
    
    // 檢查是否是地區限制錯誤
    if (error instanceof Error && error.message.includes('Country, region, or territory not supported')) {
      console.log('⚠️ OpenAI API 地區限制，使用本地摘要生成')
      const { text, language } = await request.json()
      const localSummary = generateLocalSummary(text, language)
      return NextResponse.json(localSummary)
    }
    
    // 其他錯誤也嘗試本地摘要
    try {
      const { text, language } = await request.json()
      console.log('⚠️ OpenAI API 錯誤，使用本地摘要生成')
      const localSummary = generateLocalSummary(text, language)
      return NextResponse.json(localSummary)
    } catch (fallbackError) {
      console.error('本地摘要生成也失敗:', fallbackError)
      return NextResponse.json({ 
        success: false, 
        message: '摘要生成失敗，請稍後重試' 
      }, { status: 500 })
    }
  }
}