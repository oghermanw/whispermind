'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import { TranscriptionData } from '@/types'

interface FileUploadProps {
  onTranscriptionComplete: (data: TranscriptionData) => void
  onProcessingChange: (processing: boolean) => void
  onFileUpload?: (file: File) => void
  whisperOption?: 'local' | 'whisper'
}

interface UploadedFile {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: TranscriptionData
  error?: string
}

export default function FileUpload({ 
  onTranscriptionComplete, 
  onProcessingChange, 
  onFileUpload,
  whisperOption = 'local' 
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0
    }))
    setFiles(prev => [...prev, ...newFiles])
    
    // 通知父組件文件已上傳
    if (onFileUpload && acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0])
    }
  }, [onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
      'video/*': ['.mp4', '.avi', '.mov', '.mkv']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const uploadFile = async (file: UploadedFile) => {
    const formData = new FormData()
    formData.append('file', file.file)

    try {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'uploading', progress: 10 } : f
      ))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('上傳失敗')
      }

      const result = await response.json()
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing', progress: 50 } : f
      ))

        // 開始轉錄 - 根據選擇的選項使用不同的 API
        const transcribeEndpoint = whisperOption === 'local' 
          ? '/api/transcribe-integrated' 
          : '/api/transcribe'
        
        const transcribeResponse = await fetch(transcribeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fileId: result.fileId })
        })

      if (!transcribeResponse.ok) {
        const errorData = await transcribeResponse.json()
        throw new Error(errorData.message || '轉錄失敗')
      }

      const transcriptionData = await transcribeResponse.json()
      
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          result: transcriptionData 
        } : f
      ))

      onTranscriptionComplete(transcriptionData)
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : '未知錯誤'
        } : f
      ))
    }
  }

  const uploadAllFiles = async () => {
    setIsUploading(true)
    onProcessingChange(true)

    for (const file of files.filter(f => f.status === 'pending')) {
      await uploadFile(file)
    }

    setIsUploading(false)
    onProcessingChange(false)
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <X className="w-5 h-5 text-red-500" />
      case 'uploading':
      case 'processing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <File className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return '等待上傳'
      case 'uploading':
        return '上傳中...'
      case 'processing':
        return '處理中...'
      case 'completed':
        return '完成'
      case 'error':
        return '錯誤'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`upload-area ${isDragActive ? 'dragover' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          {isDragActive ? '放開文件以上傳' : '拖拽文件到這裡，或點擊選擇文件'}
        </p>
        <p className="text-sm text-gray-500">
          支援 MP3, WAV, M4A, AAC, OGG, FLAC, MP4, AVI, MOV, MKV 格式
        </p>
        <p className="text-xs text-gray-400 mt-2">
          最大文件大小：100MB
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              已選擇的文件 ({files.length})
            </h4>
            <button
              onClick={uploadAllFiles}
              disabled={isUploading || files.every(f => f.status !== 'pending')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? '上傳中...' : '開始上傳'}
            </button>
          </div>

          <div className="space-y-2">
            {files.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(file.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    {getStatusText(file.status)}
                  </div>
                  
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {file.status === 'error' && (
                    <p className="text-sm text-red-600">
                      {file.error}
                    </p>
                  )}

                  {file.status === 'pending' && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
