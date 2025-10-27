import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { TranscriptionData } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 語言檢測函數
async function detectLanguage(file: File): Promise<string> {
  try {
    // 使用 Whisper 進行語言檢測（不返回轉錄文本）
    const detection = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment']
    })
    
    return detection.language || 'unknown'
  } catch (error) {
    console.error('語言檢測失敗:', error)
    return 'unknown'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json()

    if (!fileId) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少文件 ID' 
      }, { status: 400 })
    }

    // 查找文件
    const uploadDir = join(process.cwd(), 'uploads')
    const files = await import('fs').then(fs => 
      fs.promises.readdir(uploadDir).catch(() => [])
    )
    
    const fileName = files.find(file => file.startsWith(fileId))
    if (!fileName) {
      return NextResponse.json({ 
        success: false, 
        message: '文件不存在' 
      }, { status: 404 })
    }

    const filePath = join(uploadDir, fileName)
    const fileStats = await stat(filePath)
    
    // 檢查文件大小
    const maxSize = 25 * 1024 * 1024 // Whisper API 限制 25MB
    if (fileStats.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: '文件大小超過 25MB 限制，請使用較小的文件' 
      }, { status: 400 })
    }

    // 讀取文件
    const fileBuffer = await readFile(filePath)
    const file = new File([new Uint8Array(fileBuffer)], fileName, { 
      type: 'audio/mpeg' // 默認類型
    })

    console.log(`🎵 開始使用 Whisper API 轉錄: ${fileName}`)

    // 使用 Whisper API 進行轉錄
    let transcription
    try {
      transcription = await openai.audio.transcriptions.create({
        file: file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        timestamp_granularities: ['segment']
      })
      
      console.log('✅ Whisper API 轉錄完成')
    } catch (openaiError: any) {
      console.error('OpenAI API 錯誤:', openaiError)
      
      // 檢查是否是地區限制錯誤
      if (openaiError.code === 'unsupported_country_region_territory') {
        return NextResponse.json({ 
          success: false, 
          message: '您的地區不支援 OpenAI API。請使用本地 Whisper 或聯繫管理員獲取替代方案。',
          errorCode: 'REGION_NOT_SUPPORTED'
        }, { status: 403 })
      }
      
      // 檢查語言格式錯誤
      if (openaiError.code === 'invalid_language_format') {
        return NextResponse.json({ 
          success: false, 
          message: '語言參數格式錯誤。請嘗試使用本地 Whisper。',
          errorCode: 'INVALID_LANGUAGE_FORMAT'
        }, { status: 400 })
      }
      
      // 其他 OpenAI 錯誤
      if (openaiError.status === 403) {
        return NextResponse.json({ 
          success: false, 
          message: 'OpenAI API 訪問被拒絕。請檢查 API 密鑰或聯繫管理員。',
          errorCode: 'API_ACCESS_DENIED'
        }, { status: 403 })
      }
      
      // 重新拋出其他錯誤
      throw openaiError
    }

    // 處理轉錄結果
    const transcriptionData: TranscriptionData = {
      text: transcription.text,
      language: transcription.language || 'unknown',
      confidence: 0.9, // Whisper 不直接提供信心度，使用默認值
      duration: transcription.duration || 0,
      segments: transcription.segments?.map(segment => ({
        start: segment.start,
        end: segment.end,
        text: segment.text,
        confidence: 0.9 // 默認信心度
      })) || []
    }

    return NextResponse.json(transcriptionData)

  } catch (error) {
    console.error('轉錄錯誤:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('file_size_exceeded')) {
        return NextResponse.json({ 
          success: false, 
          message: '文件大小超過限制' 
        }, { status: 400 })
      }
      if (error.message.includes('invalid_file_format')) {
        return NextResponse.json({ 
          success: false, 
          message: '不支持的文件格式' 
        }, { status: 400 })
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: '轉錄失敗，請稍後重試' 
    }, { status: 500 })
  }
}