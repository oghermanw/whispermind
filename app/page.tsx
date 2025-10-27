'use client'

import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import TranscriptionResult from '@/components/TranscriptionResult'
import SummaryResult from '@/components/SummaryResult'
import WhisperOptions from '@/components/WhisperOptions'
import { TranscriptionData, SummaryData } from '@/types'

export default function Home() {
  const [transcription, setTranscription] = useState<TranscriptionData | null>(null)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'transcribe' | 'summarize'>('upload')
  const [whisperOption, setWhisperOption] = useState<'local' | 'whisper'>('whisper')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  const handleTranscriptionComplete = (data: TranscriptionData) => {
    setTranscription(data)
    setCurrentStep('summarize')
    setSummaryError(null)
  }

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
  }

  const handleWhisperOptionChange = (option: 'local' | 'whisper') => {
    setWhisperOption(option)
  }

  const handleSummaryComplete = (data: SummaryData) => {
    setSummary(data)
    setSummaryError(null)
  }

  const handleSummaryError = (error: string) => {
    setSummaryError(error)
  }

  const resetProcess = () => {
    setTranscription(null)
    setSummary(null)
    setCurrentStep('upload')
    setIsProcessing(false)
    setUploadedFile(null)
    setSummaryError(null)
  }

  const retrySummary = () => {
    setSummaryError(null)
    setCurrentStep('summarize')
  }

  const uploadNewFile = () => {
    setTranscription(null)
    setSummary(null)
    setCurrentStep('upload')
    setIsProcessing(false)
    setUploadedFile(null)
    setSummaryError(null)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          語音轉文字
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          上傳您的語音文件，我們將使用 OpenAI Whisper API 為您轉換為文字，
          並生成摘要。支援多種語言自動檢測。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">處理進度</h3>
          <button
            onClick={resetProcess}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            重新開始
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-8">
          <div className={`flex items-center ${currentStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'upload' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">上傳文件</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep === 'transcribe' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'transcribe' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">語音轉文字</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep === 'summarize' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'summarize' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">生成摘要</span>
          </div>
        </div>

        {currentStep === 'upload' && (
          <div className="space-y-6">
            <WhisperOptions 
              onOptionChange={handleWhisperOptionChange}
              currentOption={whisperOption}
            />
            <FileUpload
              onTranscriptionComplete={handleTranscriptionComplete}
              onProcessingChange={setIsProcessing}
              onFileUpload={handleFileUpload}
              whisperOption={whisperOption}
            />
          </div>
        )}

        {transcription && currentStep === 'summarize' && !summaryError && (
          <SummaryResult
            transcription={transcription}
            onSummaryComplete={handleSummaryComplete}
            onSummaryError={handleSummaryError}
            onProcessingChange={setIsProcessing}
            onUploadNewFile={uploadNewFile}
          />
        )}

        {summaryError && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 mb-2">無法生成摘要</h3>
              <p className="text-red-600 mb-4">{summaryError}</p>
              <button
                onClick={retrySummary}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                重試
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">處理中...</span>
          </div>
        )}
      </div>

      {transcription && (
        <TranscriptionResult 
          transcription={transcription} 
          audioFile={uploadedFile}
          onUploadNewFile={uploadNewFile}
        />
      )}

    </div>
  )
}