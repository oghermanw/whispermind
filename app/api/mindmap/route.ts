import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { MindMapData } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, summary, keyPoints, language } = await request.json()

    if (!text || !summary) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要內容' 
      }, { status: 400 })
    }

    // 根據語言選擇系統提示
    const getSystemPrompt = (lang: string) => {
      const prompts: { [key: string]: string } = {
        'zh': '你是一個專業的思維導圖生成助手。請根據提供的文本內容和摘要，生成一個結構化的思維導圖。思維導圖應該包含主要主題、子主題和相關概念，形成清晰的層次結構。',
        'en': 'You are a professional mind map generation assistant. Please generate a structured mind map based on the provided text content and summary. The mind map should include main topics, subtopics, and related concepts, forming a clear hierarchical structure.',
        'ja': 'あなたは専門的なマインドマップ生成アシスタントです。提供されたテキスト内容と要約に基づいて、構造化されたマインドマップを生成してください。マインドマップには主要トピック、サブトピック、関連概念が含まれ、明確な階層構造を形成する必要があります。',
        'ko': '당신은 전문적인 마인드맵 생성 어시스턴트입니다. 제공된 텍스트 내용과 요약을 바탕으로 구조화된 마인드맵을 생성해 주세요. 마인드맵에는 주요 주제, 하위 주제, 관련 개념이 포함되어 명확한 계층 구조를 형성해야 합니다.',
        'es': 'Eres un asistente profesional de generación de mapas mentales. Por favor, genera un mapa mental estructurado basado en el contenido de texto y resumen proporcionados. El mapa mental debe incluir temas principales, subtemas y conceptos relacionados, formando una estructura jerárquica clara.',
        'fr': 'Vous êtes un assistant professionnel de génération de cartes mentales. Veuillez générer une carte mentale structurée basée sur le contenu textuel et le résumé fournis. La carte mentale doit inclure les sujets principaux, les sous-sujets et les concepts connexes, formant une structure hiérarchique claire.',
        'de': 'Sie sind ein professioneller Assistent für die Erstellung von Mindmaps. Bitte erstellen Sie eine strukturierte Mindmap basierend auf dem bereitgestellten Textinhalt und der Zusammenfassung. Die Mindmap sollte Hauptthemen, Unterthemen und verwandte Konzepte enthalten und eine klare hierarchische Struktur bilden.',
        'it': 'Sei un assistente professionale per la generazione di mappe mentali. Per favore, genera una mappa mentale strutturata basata sul contenuto testuale e sul riassunto forniti. La mappa mentale dovrebbe includere argomenti principali, sottoargomenti e concetti correlati, formando una struttura gerarchica chiara.',
        'pt': 'Você é um assistente profissional de geração de mapas mentais. Por favor, gere um mapa mental estruturado baseado no conteúdo de texto e resumo fornecidos. O mapa mental deve incluir tópicos principais, subtópicos e conceitos relacionados, formando uma estrutura hierárquica clara.',
        'ru': 'Вы профессиональный помощник по созданию ментальных карт. Пожалуйста, создайте структурированную ментальную карту на основе предоставленного текстового содержания и резюме. Ментальная карта должна включать основные темы, подтемы и связанные концепции, образуя четкую иерархическую структуру.',
        'ar': 'أنت مساعد احترافي في إنشاء الخرائط الذهنية. يرجى إنشاء خريطة ذهنية منظمة بناءً على محتوى النص والملخص المقدمين. يجب أن تتضمن الخريطة الذهنية المواضيع الرئيسية والمواضيع الفرعية والمفاهيم ذات الصلة، مشكلة هيكلاً هرمياً واضحاً.',
        'hi': 'आप एक पेशेवर माइंड मैप जेनरेशन असिस्टेंट हैं। कृपया प्रदान की गई टेक्स्ट सामग्री और सारांश के आधार पर एक संरचित माइंड मैप तैयार करें। माइंड मैप में मुख्य विषय, उप-विषय और संबंधित अवधारणाएं शामिल होनी चाहिए, जो एक स्पष्ट पदानुक्रमित संरचना बनाती हैं।'
      }
      return prompts[lang] || prompts['en']
    }

    const systemPrompt = getSystemPrompt(language || 'en')

    // 使用 GPT-4 生成思維導圖結構
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `請根據以下內容生成思維導圖的 JSON 結構：

原文內容：
${text}

摘要：
${summary}

關鍵要點：
${keyPoints.join(', ')}

請返回一個 JSON 格式的思維導圖，包含以下結構：
{
  "nodes": [
    {
      "id": "unique_id",
      "label": "節點標籤",
      "level": 0,
      "parent": null
    }
  ],
  "links": [
    {
      "source": "source_id",
      "target": "target_id",
      "strength": 1
    }
  ]
}

要求：
1. 中心節點（level 0）應該是主要主題
2. 子節點（level 1, 2, 3...）應該是相關的子主題和概念
3. 每個節點都應該有唯一的 ID
4. 連線應該表示節點之間的關係
5. 節點標籤應該簡潔明瞭（不超過 20 個字符）
6. 總共生成 10-20 個節點`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('無法生成思維導圖')
    }

    // 嘗試解析 JSON 回應
    let mindmapData: MindMapData
    try {
      // 提取 JSON 部分
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const jsonStr = jsonMatch[0]
        mindmapData = JSON.parse(jsonStr)
      } else {
        throw new Error('無法找到有效的 JSON 格式')
      }
    } catch (parseError) {
      // 如果解析失敗，生成一個簡單的思維導圖
      console.warn('JSON 解析失敗，生成默認思維導圖:', parseError)
      mindmapData = generateDefaultMindMap(text, summary, keyPoints)
    }

    // 驗證和修復數據結構
    if (!mindmapData.nodes || !Array.isArray(mindmapData.nodes)) {
      mindmapData.nodes = []
    }
    if (!mindmapData.links || !Array.isArray(mindmapData.links)) {
      mindmapData.links = []
    }

    // 確保每個節點都有必要的屬性
    mindmapData.nodes = mindmapData.nodes.map((node, index) => ({
      id: node.id || `node_${index}`,
      label: node.label || `節點 ${index + 1}`,
      level: typeof node.level === 'number' ? node.level : 0,
      parent: node.parent || null
    }))

    // 確保每個連線都有必要的屬性
    mindmapData.links = mindmapData.links.map((link, index) => ({
      source: link.source || `node_${index}`,
      target: link.target || `node_${index + 1}`,
      strength: typeof link.strength === 'number' ? link.strength : 1
    }))

    mindmapData.language = language || 'unknown'

    return NextResponse.json(mindmapData)

  } catch (error) {
    console.error('思維導圖生成錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: '思維導圖生成失敗，請稍後重試' 
    }, { status: 500 })
  }
}

// 生成默認思維導圖的備用函數
function generateDefaultMindMap(text: string, summary: string, keyPoints: string[]): MindMapData {
  const nodes = [
    { id: 'main', label: '主要主題', level: 0, parent: null },
    { id: 'summary', label: '摘要', level: 1, parent: 'main' },
    { id: 'content', label: '內容', level: 1, parent: 'main' }
  ]

  const links = [
    { source: 'main', target: 'summary', strength: 1 },
    { source: 'main', target: 'content', strength: 1 }
  ]

  // 添加關鍵要點作為節點
  keyPoints.slice(0, 5).forEach((point, index) => {
    const nodeId = `key_${index}`
    nodes.push({
      id: nodeId,
      label: point.length > 20 ? point.substring(0, 20) + '...' : point,
      level: 2,
      parent: 'summary'
    })
    links.push({
      source: 'summary',
      target: nodeId,
      strength: 1
    })
  })

  return {
    nodes,
    links,
    language: 'unknown'
  }
}



