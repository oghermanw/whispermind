import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { TranscriptionData } from '@/types'
import { spawn } from 'child_process'

// 全局變量存儲模型狀態
let isModelLoaded = false
let isModelLoading = false

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
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (fileStats.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: '文件大小超過 100MB 限制' 
      }, { status: 400 })
    }

    console.log(`🎵 開始轉錄文件: ${fileName} (${(fileStats.size / 1024 / 1024).toFixed(2)} MB)`)

    // 使用本地 Whisper 進行轉錄
    const transcriptionData = await transcribeWithLocalWhisper(filePath)

    return NextResponse.json(transcriptionData)

  } catch (error) {
    console.error('整合轉錄錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: `轉錄失敗: ${error instanceof Error ? error.message : '未知錯誤'}` 
    }, { status: 500 })
  }
}

async function transcribeWithLocalWhisper(filePath: string): Promise<TranscriptionData> {
  return new Promise((resolve, reject) => {
    console.log('🔄 使用本地 Whisper 進行轉錄...')
    
    // 激活虛擬環境並運行 Python 轉錄腳本
    const pythonPath = join(process.cwd(), 'whisper-env', 'bin', 'python')
    const scriptPath = join(process.cwd(), 'whisper-real.py')
    
    const childProcess = spawn(pythonPath, [scriptPath, filePath], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    childProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout)
          console.log('✅ 本地轉錄完成')
          resolve(result)
        } catch (parseError) {
          console.error('❌ 解析轉錄結果失敗:', parseError)
          console.error('原始輸出:', stdout)
          reject(new Error('解析轉錄結果失敗'))
        }
      } else {
        console.error('❌ Python 轉錄腳本失敗:', stderr)
        reject(new Error(`轉錄失敗: ${stderr}`))
      }
    })

    childProcess.on('error', (error) => {
      console.error('❌ 啟動轉錄進程失敗:', error)
      reject(error)
    })
  })
}

