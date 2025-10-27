#!/usr/bin/env python3
"""
強健的 Whisper 轉錄腳本
支持多種音頻格式，包括 M4A, MP3, WAV 等
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
    """使用 Whisper Large V3 轉錄音頻文件，支持多種格式"""
    try:
        # 延遲導入以避免啟動時的依賴問題
        from transformers import pipeline
        import librosa
        import soundfile as sf
        
        logger.info("🔄 正在加載 Whisper Large V3 模型...")
        
        # 創建轉錄管道
        pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-large-v3",
            return_timestamps=True,
            chunk_length_s=30,
            stride_length_s=5,
            ignore_warning=True,
        )
        
        logger.info("✅ 模型加載完成")
        logger.info(f"🎵 開始轉錄: {file_path}")
        
        # 嘗試不同的音頻加載方法
        audio_data = None
        sampling_rate = None
        
        try:
            # 方法1: 使用 librosa (支持更多格式)
            logger.info("🔄 嘗試使用 librosa 加載音頻...")
            audio_data, sampling_rate = librosa.load(file_path, sr=16000)
            logger.info(f"✅ librosa 成功加載: {len(audio_data)} 樣本, {sampling_rate}Hz")
        except Exception as e1:
            logger.warning(f"⚠️ librosa 加載失敗: {e1}")
            try:
                # 方法2: 使用 soundfile
                logger.info("🔄 嘗試使用 soundfile 加載音頻...")
                audio_data, sampling_rate = sf.read(file_path)
                # 如果是立體聲，轉換為單聲道
                if len(audio_data.shape) > 1:
                    audio_data = audio_data.mean(axis=1)
                # 重採樣到 16kHz
                if sampling_rate != 16000:
                    import librosa
                    audio_data = librosa.resample(audio_data, orig_sr=sampling_rate, target_sr=16000)
                    sampling_rate = 16000
                logger.info(f"✅ soundfile 成功加載: {len(audio_data)} 樣本, {sampling_rate}Hz")
            except Exception as e2:
                logger.error(f"❌ 所有音頻加載方法都失敗")
                logger.error(f"   librosa 錯誤: {e1}")
                logger.error(f"   soundfile 錯誤: {e2}")
                return {
                    "success": False,
                    "error": f"無法加載音頻文件。支持格式: wav, flac, mp3, m4a, aac, ogg。錯誤: {e1}"
                }
        
        # 執行轉錄
        logger.info("🔄 開始轉錄處理...")
        result = pipe(audio_data, return_timestamps=True)
        
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
        duration = segments[-1]["end"] if segments else len(audio_data) / sampling_rate
        
        logger.info(f"✅ 轉錄完成: {len(text)} 字符, {len(segments)} 分段")
        
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
            "error": "用法: python whisper-robust.py <audio_file_path>"
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


