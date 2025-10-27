#!/usr/bin/env python3
"""
Whisper 轉錄腳本
用於從命令行調用 Whisper Large V3 模型進行轉錄
"""

import sys
import json
import os
import logging
from pathlib import Path

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def transcribe_audio(file_path: str) -> dict:
    """使用 Whisper Large V3 轉錄音頻文件"""
    try:
        # 延遲導入以避免啟動時的依賴問題
        from transformers import pipeline
        
        logger.info("🔄 正在加載 Whisper Large V3 模型...")
        
        # 創建轉錄管道，添加音頻格式處理
        pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-large-v3",
            return_timestamps=True,
            chunk_length_s=30,
            stride_length_s=5,
            ignore_warning=True,  # 忽略實驗性警告
        )
        
        logger.info("✅ 模型加載完成")
        logger.info(f"🎵 開始轉錄: {file_path}")
        
        # 執行轉錄
        result = pipe(file_path)
        
        # 處理結果
        text = result.get("text", "")
        chunks = result.get("chunks", [])
        
        # 轉換為我們的格式
        segments = []
        for chunk in chunks:
            if "timestamp" in chunk and chunk["timestamp"]:
                segments.append({
                    "start": chunk["timestamp"][0],
                    "end": chunk["timestamp"][1],
                    "text": chunk["text"],
                    "confidence": 0.9  # Whisper 不提供信心度
                })
        
        # 計算總時長
        duration = segments[-1]["end"] if segments else 0
        
        return {
            "success": True,
            "text": text,
            "language": "auto-detected",
            "confidence": 0.9,
            "duration": duration,
            "segments": segments
        }
        
    except Exception as e:
        logger.error(f"❌ 轉錄失敗: {e}")
        return {
            "success": False,
            "error": str(e)
        }

def main():
    """主函數"""
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "用法: python whisper-transcribe.py <audio_file_path>"
        }))
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # 檢查文件是否存在
    if not os.path.exists(file_path):
        print(json.dumps({
            "success": False,
            "error": f"文件不存在: {file_path}"
        }))
        sys.exit(1)
    
    # 執行轉錄
    result = transcribe_audio(file_path)
    
    # 輸出結果
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()

