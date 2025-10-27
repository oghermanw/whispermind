import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('收到上傳請求，Content-Type:', request.headers.get('content-type'))
    
    let data: FormData
    try {
      data = await request.formData()
    } catch (formDataError) {
      console.error('FormData 解析錯誤:', formDataError)
      return NextResponse.json({ 
        success: false, 
        message: '無法解析上傳數據' 
      }, { status: 400 })
    }
    
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ success: false, message: '沒有選擇文件' }, { status: 400 })
    }

    // 檢查文件大小 (100MB 限制)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        message: '文件大小超過 100MB 限制' 
      }, { status: 400 })
    }

    // 檢查文件類型
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/flac',
      'audio/x-m4a', 'audio/m4a', 'audio/x-aac', 'audio/x-wav',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo'
    ]
    
    // 也檢查文件擴展名作為備用
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'mp4', 'avi', 'mov', 'mkv']
    
    console.log('文件檢查信息:', { 
      fileName: file.name, 
      fileType: file.type, 
      fileExtension: fileExtension,
      size: file.size
    })
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      console.log('文件類型檢查失敗:', { 
        fileName: file.name, 
        fileType: file.type, 
        fileExtension: fileExtension 
      })
      return NextResponse.json({ 
        success: false, 
        message: `不支持的文件類型: ${file.type || 'unknown'}` 
      }, { status: 400 })
    }

    // 創建上傳目錄
    const uploadDir = join(process.cwd(), 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 生成唯一文件名
    const fileId = Math.random().toString(36).substr(2, 9)
    const fileName = `${fileId}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      message: '文件上傳成功',
      fileId: fileId,
      fileName: fileName,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    console.error('文件上傳錯誤:', error)
    console.error('錯誤堆棧:', error.stack)
    return NextResponse.json({ 
      success: false, 
      message: `文件上傳失敗: ${error.message}` 
    }, { status: 500 })
  }
}
