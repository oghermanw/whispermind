import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'

export async function GET(request: NextRequest) {
  return await testLocalWhisper()
}

export async function POST(request: NextRequest) {
  return await testLocalWhisper()
}

async function testLocalWhisper() {
  try {
    console.log('🧪 測試本地 Whisper...')
    
    // 檢查 Python 環境
    const pythonPath = join(process.cwd(), 'whisper-env', 'bin', 'python')
    
    return new Promise((resolve) => {
      const childProcess = spawn(pythonPath, ['-c', 'import whisper; print("Whisper 可用")'], {
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
          console.log('✅ 本地 Whisper 測試成功')
          resolve(NextResponse.json({ 
            success: true, 
            message: '本地 Whisper 可用',
            details: stdout.trim()
          }))
        } else {
          console.log('❌ 本地 Whisper 測試失敗:', stderr)
          resolve(NextResponse.json({ 
            success: false, 
            message: '本地 Whisper 不可用',
            error: stderr.trim()
          }, { status: 500 }))
        }
      })

      childProcess.on('error', (error) => {
        console.log('❌ 本地 Whisper 測試錯誤:', error)
        resolve(NextResponse.json({ 
          success: false, 
          message: '本地 Whisper 測試失敗',
          error: error.message
        }, { status: 500 }))
      })
    })

  } catch (error) {
    console.error('本地 Whisper 測試錯誤:', error)
    return NextResponse.json({ 
      success: false, 
      message: '測試失敗',
      error: error instanceof Error ? error.message : '未知錯誤'
    }, { status: 500 })
  }
}

