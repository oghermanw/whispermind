import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { TranscriptionData } from '@/types'

// Python Whisper 服務器配置
const WHISPER_SERVER_URL = process.env.WHISPER_SERVER_URL || 'http://localhost:8000'

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
    
    // 檢查文件大小 (本地模型可以處理更大的文件)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (fileStats.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: '文件大小超過 100MB 限制' 
      }, { status: 400 })
    }

    console.log(`🎵 開始轉錄文件: ${fileName} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`)

    // 調用 Python Whisper 服務
    console.log('🔄 正在調用本地 Whisper 服務...')
    const response = await fetch(`${WHISPER_SERVER_URL}/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_path: filePath
      })
    })

    if (!response.ok) {
      throw new Error(`Whisper 服務錯誤: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || '轉錄失敗')
    }

    console.log('✅ 轉錄完成')

    // 處理轉錄結果
    const transcriptionData: TranscriptionData = {
      text: result.text || '',
      language: result.language || 'unknown',
      confidence: result.confidence || 0.9,
      duration: result.duration || 0,
      segments: result.segments || []
    }

    return NextResponse.json(transcriptionData)

  } catch (error) {
    console.error('本地轉錄錯誤:', error)
    
    // 如果是模型加載錯誤，提供更友好的錯誤信息
    if (error instanceof Error && error.message.includes('model')) {
      return NextResponse.json({ 
        success: false, 
        message: '模型加載失敗，請檢查網絡連接或稍後重試',
        errorCode: 'MODEL_LOAD_FAILED'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: false, 
      message: `轉錄失敗: ${error instanceof Error ? error.message : '未知錯誤'}` 
    }, { status: 500 })
  }
}