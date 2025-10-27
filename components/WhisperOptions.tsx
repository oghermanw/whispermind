'use client'

import { useState } from 'react'
import { Settings, TestTube, CheckCircle, XCircle, Loader } from 'lucide-react'

interface WhisperOptionsProps {
  onOptionChange: (option: 'local' | 'whisper') => void
  currentOption: 'local' | 'whisper'
}

export default function WhisperOptions({ onOptionChange, currentOption }: WhisperOptionsProps) {
  const [testing, setTesting] = useState<'local' | 'whisper' | null>(null)
  const [testResults, setTestResults] = useState<{
    local: 'idle' | 'testing' | 'success' | 'error'
    whisper: 'idle' | 'testing' | 'success' | 'error'
  }>({
    local: 'idle',
    whisper: 'idle'
  })

  const testWhisperAPI = async () => {
    setTesting('whisper')
    setTestResults(prev => ({ ...prev, whisper: 'testing' }))
    
    try {
      const response = await fetch('/api/test-whisper-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, whisper: 'success' }))
      } else {
        setTestResults(prev => ({ ...prev, whisper: 'error' }))
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, whisper: 'error' }))
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">使用 OpenAI Whisper API</h3>
        </div>
        <div className="flex items-center space-x-2">
          {testing === 'whisper' ? (
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
          ) : testResults.whisper === 'success' ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : testResults.whisper === 'error' ? (
            <XCircle className="w-4 h-4 text-red-600" />
          ) : (
            <TestTube className="w-4 h-4 text-gray-400" />
          )}
          <button
            onClick={testWhisperAPI}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
          >
            測試連接
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        使用 OpenAI 的 Whisper API 進行高質量語音轉文字，支援多種語言自動檢測
      </p>
      <div className="text-xs text-gray-500 mt-2">
        {testResults.whisper === 'success' && '✅ API 連接正常'}
        {testResults.whisper === 'error' && '❌ API 連接失敗'}
        {testResults.whisper === 'idle' && '點擊測試按鈕檢查 API 狀態'}
      </div>
    </div>
  )
}