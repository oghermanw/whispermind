'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react'

interface ApiStatusProps {
  onStatusChange?: (status: { openai: boolean; whisper: boolean }) => void
}

export default function ApiStatus({ onStatusChange }: ApiStatusProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<{
    openai: 'checking' | 'available' | 'unavailable' | 'error'
    whisper: 'checking' | 'available' | 'unavailable' | 'error'
  }>({
    openai: 'checking',
    whisper: 'checking'
  })

  const checkApiStatus = async () => {
    setStatus({ openai: 'checking', whisper: 'checking' })
    
    try {
      // 檢查 OpenAI API
      const openaiResponse = await fetch('/api/test-whisper-api')
      const openaiData = await openaiResponse.json()
      setStatus(prev => ({
        ...prev,
        openai: openaiData.success ? 'available' : 'unavailable'
      }))
    } catch (error) {
      setStatus(prev => ({ ...prev, openai: 'error' }))
    }

    try {
      // 檢查本地 Whisper
      const whisperResponse = await fetch('/api/test-local-whisper')
      const whisperData = await whisperResponse.json()
      setStatus(prev => ({
        ...prev,
        whisper: whisperData.success ? 'available' : 'unavailable'
      }))
    } catch (error) {
      setStatus(prev => ({ ...prev, whisper: 'error' }))
    }

    // 通知父組件狀態變化
    if (onStatusChange) {
      onStatusChange({
        openai: status.openai === 'available',
        whisper: status.whisper === 'available'
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkApiStatus()
    }
  }, [isOpen])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checking':
        return '檢查中...'
      case 'available':
        return '可用'
      case 'unavailable':
        return '不可用'
      case 'error':
        return '錯誤'
      default:
        return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700'
      case 'unavailable':
        return 'bg-red-100 text-red-700'
      case 'error':
        return 'bg-red-100 text-red-700'
      case 'checking':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>API 狀態</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">API 服務狀態</h4>
            <button
              onClick={checkApiStatus}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重新檢查</span>
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.openai)}
                <span className="text-sm font-medium text-gray-700">OpenAI API</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status.openai)}`}>
                {getStatusText(status.openai)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded border">
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.whisper)}
                <span className="text-sm font-medium text-gray-700">本地 Whisper</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(status.whisper)}`}>
                {getStatusText(status.whisper)}
              </span>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>提示:</strong> 如果 OpenAI API 不可用，請檢查 .env.local 文件中的 OPENAI_API_KEY 設置。
            </p>
          </div>

          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <p><strong>轉錄:</strong> OpenAI API 或 本地 Whisper</p>
            <p><strong>摘要:</strong> 需要 OpenAI API</p>
            <p><strong>思維導圖:</strong> 需要 OpenAI API</p>
          </div>
        </div>
      )}
    </div>
  )
}
