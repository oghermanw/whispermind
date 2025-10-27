'use client'

import { useEffect, useState } from 'react'
import { TranscriptionData, SummaryData } from '@/types'
import { Download, Copy, CheckCircle } from 'lucide-react'

interface MarkmapResultProps {
  transcription: TranscriptionData
  summary: SummaryData
  onMindMapComplete: (data: any) => void
  onProcessingChange: (processing: boolean) => void
}

export default function MarkmapResult({ 
  transcription, 
  summary, 
  onMindMapComplete, 
  onProcessingChange 
}: MarkmapResultProps) {
  const [copied, setCopied] = useState(false)
  const [markmapData, setMarkmapData] = useState<string>('')

  // 生成 markmap 數據
  useEffect(() => {
    const generateMarkmap = async () => {
      try {
        onProcessingChange(true)
        
        const response = await fetch('/api/markmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            transcription,
            summary
          })
        })

        if (!response.ok) {
          throw new Error('Markmap 生成失敗')
        }

        const result = await response.json()
        if (result.success) {
          setMarkmapData(result.markdown)
          onMindMapComplete({ markdown: result.markdown })
        } else {
          throw new Error(result.message || 'Markmap 生成失敗')
        }
      } catch (error) {
        console.error('Markmap 生成錯誤:', error)
        // 生成一個簡單的備用 markmap
        const fallbackMarkdown = `# ${transcription.text.substring(0, 20)}...

## 主要內容
- ${transcription.text}

## 摘要
- ${summary.summary}

## 關鍵點
${summary.keyPoints.map(point => `- ${point}`).join('\n')}`
        setMarkmapData(fallbackMarkdown)
        onMindMapComplete({ markdown: fallbackMarkdown })
      } finally {
        onProcessingChange(false)
      }
    }

    generateMarkmap()
  }, [transcription, summary, onMindMapComplete, onProcessingChange])

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markmapData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const downloadMarkdown = () => {
    const blob = new Blob([markmapData], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindmap_${new Date().toISOString().split('T')[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">思維導圖 (Markmap)</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyMarkdown}
            className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              copied 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>{copied ? '已複製' : '複製 Markdown'}</span>
          </button>
          <button
            onClick={downloadMarkdown}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下載 Markdown</span>
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2 text-blue-800">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Markmap 格式</span>
        </div>
        <p className="text-xs text-blue-600 mt-1">
          基於 <a href="https://markmap.js.org/api/" target="_blank" rel="noopener noreferrer" className="underline">markmap.js.org</a> 的思維導圖格式
        </p>
      </div>

      {/* Markdown 預覽 */}
      <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
        <div className="bg-gray-50 p-4 h-full overflow-y-auto">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {markmapData}
          </pre>
        </div>
      </div>

      {/* 說明 */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 這是 Markmap 格式的 Markdown 數據。您可以複製此內容到 <a href="https://markmap.js.org/repl" target="_blank" rel="noopener noreferrer" className="underline">markmap.js.org/repl</a> 查看交互式思維導圖。
        </p>
      </div>
    </div>
  )
}