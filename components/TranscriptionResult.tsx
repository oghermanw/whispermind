'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Download, Play, Pause, Volume2, Edit3, Save, X, FileText, Clock, Target, Upload } from 'lucide-react'
import { TranscriptionData } from '@/types'

interface TranscriptionResultProps {
  transcription: TranscriptionData
  audioFile?: File | null
  onUploadNewFile?: () => void
}

export default function TranscriptionResult({ transcription, audioFile, onUploadNewFile }: TranscriptionResultProps) {
  const [copied, setCopied] = useState(false)
  const [playingSegment, setPlayingSegment] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(transcription.text)
  const [copiedSegment, setCopiedSegment] = useState<number | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 計算字數統計
  const getWordCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      paragraphs: text.split('\n\n').filter(p => p.trim().length > 0).length
    }
  }

  const wordStats = getWordCount(editedText)

  // 播放音頻片段
  const playSegment = async (segmentIndex: number) => {
    if (!audioFile || !audioRef.current) return

    const segment = transcription.segments[segmentIndex]
    if (!segment) return

    try {
      const audioUrl = URL.createObjectURL(audioFile)
      audioRef.current.src = audioUrl
      
      // 設置播放時間範圍
      audioRef.current.currentTime = segment.start
      
      // 播放音頻
      await audioRef.current.play()
      setIsPlaying(true)
      setPlayingSegment(segmentIndex)

      // 監聽播放結束
      const handleTimeUpdate = () => {
        if (audioRef.current && audioRef.current.currentTime >= segment.end) {
          audioRef.current.pause()
          setIsPlaying(false)
          setPlayingSegment(null)
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate)
        }
      }

      audioRef.current.addEventListener('timeupdate', handleTimeUpdate)
      
    } catch (error) {
      console.error('播放失敗:', error)
    }
  }

  // 停止播放
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setPlayingSegment(null)
    }
  }

  // 複製完整文字
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
      // 降級方案：使用舊的複製方法
      const textArea = document.createElement('textarea')
      textArea.value = editedText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 複製分段文字
  const copySegmentText = async (segmentIndex: number) => {
    const segment = transcription.segments[segmentIndex]
    if (!segment) return

    try {
      await navigator.clipboard.writeText(segment.text)
      setCopiedSegment(segmentIndex)
      setTimeout(() => setCopiedSegment(null), 2000)
    } catch (err) {
      console.error('複製分段失敗:', err)
    }
  }

  // 開始編輯
  const startEditing = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.select()
      }
    }, 100)
  }

  // 保存編輯
  const saveEditing = () => {
    setIsEditing(false)
    // 這裡可以添加保存到後端的邏輯
  }

  // 取消編輯
  const cancelEditing = () => {
    setEditedText(transcription.text)
    setIsEditing(false)
  }

  const downloadText = () => {
    const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadSegments = () => {
    const segmentsText = transcription.segments.map((segment, index) => 
      `${formatTime(segment.start)} - ${formatTime(segment.end)}\n${segment.text}\n`
    ).join('\n')
    
    const blob = new Blob([segmentsText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcription_segments_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'zh': '中文',
      'yue': '粵語',
      'en': '英文',
      'ja': '日文',
      'ko': '韓文',
      'es': '西班牙文',
      'fr': '法文',
      'de': '德文',
      'it': '義大利文',
      'pt': '葡萄牙文',
      'ru': '俄文',
      'ar': '阿拉伯文',
      'hi': '印地文'
    }
    return languages[code] || code
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* 標題和操作按鈕 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">轉錄結果</h3>
        </div>
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
          {!isEditing ? (
            <>
              <button
                onClick={startEditing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>編輯文字</span>
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? '已複製' : '複製文字'}</span>
              </button>
              <button
                onClick={downloadText}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下載文字</span>
              </button>
              <button
                onClick={downloadSegments}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下載分段</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={saveEditing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>保存</span>
              </button>
              <button
                onClick={cancelEditing}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>取消</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 統計信息卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
            <div className="text-sm font-medium text-blue-600">檢測語言</div>
          </div>
          <div className="text-lg font-semibold text-blue-900">
            {getLanguageName(transcription.language)}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="w-4 h-4 text-green-600" />
            <div className="text-sm font-medium text-green-600">信心度</div>
          </div>
          <div className="text-lg font-semibold text-green-900">
            {transcription.confidence ? (transcription.confidence * 100).toFixed(1) : '95.0'}%
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <div className="text-sm font-medium text-purple-600">音頻時長</div>
          </div>
          <div className="text-lg font-semibold text-purple-900">
            {transcription.duration ? formatTime(transcription.duration) : '0:05'}
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-orange-600" />
            <div className="text-sm font-medium text-orange-600">字數</div>
          </div>
          <div className="text-lg font-semibold text-orange-900">
            {wordStats.words}
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <FileText className="w-4 h-4 text-indigo-600" />
            <div className="text-sm font-medium text-indigo-600">字符數</div>
          </div>
          <div className="text-lg font-semibold text-indigo-900">
            {wordStats.characters}
          </div>
        </div>
      </div>

      {/* 詳細字數統計 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">詳細統計</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">單詞數:</span>
            <span className="font-medium text-gray-900">{wordStats.words}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">字符數:</span>
            <span className="font-medium text-gray-900">{wordStats.characters}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">無空格字符:</span>
            <span className="font-medium text-gray-900">{wordStats.charactersNoSpaces}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">段落數:</span>
            <span className="font-medium text-gray-900">{wordStats.paragraphs}</span>
          </div>
        </div>
      </div>

      {/* 完整轉錄文字 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-medium text-gray-900">完整轉錄文字</h4>
          <div className="flex items-center space-x-3">
            {isEditing && (
              <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                實時字數: {wordStats.words} 字
              </div>
            )}
            <div className="text-sm text-gray-500">
              {wordStats.words} 字 • {wordStats.characters} 字符
            </div>
          </div>
        </div>
        
        {isEditing ? (
          <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
            <textarea
              ref={textareaRef}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full h-64 p-4 text-gray-700 leading-relaxed resize-none focus:outline-none"
              placeholder="編輯轉錄文字..."
            />
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto border border-gray-200">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {editedText}
            </p>
          </div>
        )}
      </div>

      {/* 分段轉錄 */}
      {transcription.segments && transcription.segments.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-3">分段轉錄</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transcription.segments.map((segment, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex-shrink-0">
                  <button
                    onClick={() => {
                      if (playingSegment === index) {
                        stopPlayback()
                      } else {
                        playSegment(index)
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    {playingSegment === index && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900 bg-white px-2 py-1 rounded">
                        {formatTime(segment.start)} - {formatTime(segment.end)}
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {segment.confidence ? (segment.confidence * 100).toFixed(1) : '95.0'}%
                      </span>
                    </div>
                    <button
                      onClick={() => copySegmentText(index)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                        copiedSegment === index
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSegment === index ? '已複製' : '複製'}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {segment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 隱藏的音頻元素 */}
      <audio ref={audioRef} preload="metadata" />
    </div>
  )
}