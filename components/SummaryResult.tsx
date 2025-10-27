'use client'

import { useState, useEffect } from 'react'
import { Copy, Download, RefreshCw, Upload } from 'lucide-react'
import { TranscriptionData, SummaryData } from '@/types'

interface SummaryResultProps {
  transcription: TranscriptionData
  onSummaryComplete: (data: SummaryData) => void
  onSummaryError: (error: string) => void
  onProcessingChange: (processing: boolean) => void
  onUploadNewFile?: () => void
}

export default function SummaryResult({ 
  transcription, 
  onSummaryComplete, 
  onSummaryError,
  onProcessingChange,
  onUploadNewFile
}: SummaryResultProps) {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    generateSummary()
  }, [])

  const generateSummary = async () => {
    setIsGenerating(true)
    onProcessingChange(true)

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: transcription.text,
          language: transcription.language
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '生成摘要失敗')
      }

      const summaryData = await response.json()
      
      // 檢查是否返回錯誤
      if (summaryData.success === false) {
        throw new Error(summaryData.message || '生成摘要失敗')
      }
      
      setSummary(summaryData)
      onSummaryComplete(summaryData)
    } catch (error) {
      console.error('生成摘要時發生錯誤:', error)
      const errorMessage = error instanceof Error ? error.message : '生成摘要失敗，請稍後重試'
      onSummaryError(errorMessage)
    } finally {
      setIsGenerating(false)
      onProcessingChange(false)
    }
  }

  const copyToClipboard = async () => {
    if (!summary) return
    
    try {
      await navigator.clipboard.writeText(summary.summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const downloadSummary = () => {
    if (!summary) return
    
    const content = `摘要\n\n${summary.summary}\n\n關鍵要點:\n${summary.keyPoints.map(point => `• ${point}`).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `summary_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成摘要...</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">無法生成摘要</p>
        <button
          onClick={generateSummary}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          重試
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">摘要結果</h3>
        <div className="flex items-center space-x-2">
          {onUploadNewFile && (
            <button
              onClick={onUploadNewFile}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>上傳新文件</span>
            </button>
          )}
          <button
            onClick={generateSummary}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>重新生成</span>
          </button>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? '已複製' : '複製'}</span>
          </button>
          <button
            onClick={downloadSummary}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下載</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-3">摘要內容</h4>
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {summary.summary}
          </p>
        </div>
      </div>

      {summary.keyPoints && summary.keyPoints.length > 0 && (
        <div className="bg-white p-6 rounded-lg mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">關鍵要點</h4>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-gray-700">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}



