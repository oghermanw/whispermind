'use client'

import { useState, useEffect, useRef } from 'react'
import { Copy, Download, RefreshCw, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { TranscriptionData, SummaryData, MindMapData } from '@/types'
import * as d3 from 'd3'

interface MindMapResultProps {
  transcription: TranscriptionData
  summary: SummaryData
  onMindMapComplete: (data: MindMapData) => void
  onProcessingChange: (processing: boolean) => void
}

export default function MindMapResult({ 
  transcription, 
  summary, 
  onMindMapComplete, 
  onProcessingChange 
}: MindMapResultProps) {
  const [mindmap, setMindmap] = useState<MindMapData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    generateMindMap()
  }, [])

  useEffect(() => {
    if (mindmap && svgRef.current) {
      renderMindMap()
    }
  }, [mindmap])

  const generateMindMap = async () => {
    setIsGenerating(true)
    onProcessingChange(true)

    try {
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: transcription.text,
          summary: summary.summary,
          keyPoints: summary.keyPoints,
          language: transcription.language
        })
      })

      if (!response.ok) {
        throw new Error('生成思維導圖失敗')
      }

      const mindmapData = await response.json()
      setMindmap(mindmapData)
      onMindMapComplete(mindmapData)
    } catch (error) {
      console.error('生成思維導圖時發生錯誤:', error)
    } finally {
      setIsGenerating(false)
      onProcessingChange(false)
    }
  }

  const renderMindMap = () => {
    if (!mindmap || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    svg.attr('width', width).attr('height', height)

    const g = svg.append('g')
      .attr('transform', `translate(${centerX}, ${centerY}) scale(${zoom})`)

    // 創建力導向圖
    const simulation = d3.forceSimulation(mindmap.nodes as any)
      .force('link', d3.forceLink(mindmap.links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))

    // 繪製連線
    const link = g.append('g')
      .selectAll('line')
      .data(mindmap.links)
      .enter().append('line')
      .attr('class', 'mindmap-link')
      .attr('stroke-width', (d: any) => Math.sqrt(d.strength) * 2)

    // 繪製節點
    const node = g.append('g')
      .selectAll('g')
      .data(mindmap.nodes)
      .enter().append('g')
      .attr('class', 'mindmap-node')
      .call((d3.drag() as any)
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))

    // 添加圓形背景
    node.append('circle')
      .attr('r', (d: any) => Math.max(20, d.label.length * 3))
      .attr('fill', (d: any) => {
        if (d.level === 0) return '#3b82f6'
        if (d.level === 1) return '#10b981'
        if (d.level === 2) return '#f59e0b'
        return '#6b7280'
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // 添加文字
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text((d: any) => d.label.length > 20 ? d.label.substring(0, 20) + '...' : d.label)

    // 添加標題
    node.append('title')
      .text((d: any) => d.label)

    // 更新位置
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x}, ${d.y})`)
    })

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event: any, d: any) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
  }

  const copyToClipboard = async () => {
    if (!mindmap) return
    
    try {
      const mindmapText = `思維導圖\n\n${mindmap.nodes.map(node => 
        `${'  '.repeat(node.level)}• ${node.label}`
      ).join('\n')}`
      
      await navigator.clipboard.writeText(mindmapText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const downloadMindMap = () => {
    if (!mindmap) return
    
    const mindmapText = `思維導圖\n\n${mindmap.nodes.map(node => 
      `${'  '.repeat(node.level)}• ${node.label}`
    ).join('\n')}`
    
    const blob = new Blob([mindmapText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mindmap_${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3))
  }

  const handleReset = () => {
    setZoom(1)
  }

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成思維導圖...</p>
        </div>
      </div>
    )
  }

  if (!mindmap) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">無法生成思維導圖</p>
        <button
          onClick={generateMindMap}
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
        <h3 className="text-xl font-semibold text-gray-900">思維導圖</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="縮小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="重置"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={generateMindMap}
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
            onClick={downloadMindMap}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下載</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <svg ref={svgRef} className="w-full h-96"></svg>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-blue-600 mb-1">節點總數</div>
          <div className="text-lg font-semibold text-blue-900">
            {mindmap.nodes.length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-green-600 mb-1">連線數</div>
          <div className="text-lg font-semibold text-green-900">
            {mindmap.links.length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm font-medium text-purple-600 mb-1">層級數</div>
          <div className="text-lg font-semibold text-purple-900">
            {Math.max(...mindmap.nodes.map(n => n.level)) + 1}
          </div>
        </div>
      </div>
    </div>
  )
}
