#!/usr/bin/env python3
"""
真正的 Whisper 轉錄腳本 - 實際轉錄音頻內容
使用 OpenAI Whisper 命令行工具進行真實轉錄
"""

import os
import sys
import json
import logging
import subprocess
import tempfile
import shutil
from pathlib import Path

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger(__name__)

def convert_audio_to_wav(input_path: str) -> str:
    """將音頻文件轉換為 WAV 格式"""
    try:
        # 創建臨時 WAV 文件
        temp_dir = tempfile.mkdtemp()
        wav_path = os.path.join(temp_dir, "converted.wav")
        
        # 使用 ffmpeg 轉換音頻
        cmd = [
            'ffmpeg', '-i', input_path,
            '-ar', '16000',  # 16kHz 採樣率
            '-ac', '1',      # 單聲道
            '-y',            # 覆蓋輸出文件
            wav_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0 and os.path.exists(wav_path):
            logger.info(f"✅ 音頻轉換成功: {wav_path}")
            return wav_path
        else:
            logger.error(f"❌ 音頻轉換失敗: {result.stderr}")
            return input_path  # 返回原文件
            
    except Exception as e:
        logger.error(f"❌ 音頻轉換錯誤: {str(e)}")
        return input_path

def transcribe_with_whisper(file_path: str) -> dict:
    """使用 Whisper 進行真實轉錄"""
    try:
        logger.info(f"🎵 開始真實轉錄: {file_path}")
        
        # 轉換音頻格式
        wav_path = convert_audio_to_wav(file_path)
        
        # 創建臨時目錄用於輸出
        temp_dir = tempfile.mkdtemp()
        output_dir = temp_dir
        
        try:
            # 使用 whisper 命令行工具進行轉錄
            whisper_path = '/Users/herman/WhisperMind/whisper-env/bin/whisper'
            cmd = [
                whisper_path, wav_path,
                '--model', 'base',  # 使用 base 模型（較小）
                '--output_dir', output_dir,
                '--output_format', 'json',
                '--fp16', 'False',
                '--verbose', 'False'
            ]
            
            logger.info(f"🔄 執行轉錄命令: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                # 查找生成的 JSON 文件
                json_files = [f for f in os.listdir(output_dir) if f.endswith('.json')]
                if json_files:
                    json_path = os.path.join(output_dir, json_files[0])
                    
                    with open(json_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    
                    # 清理臨時文件
                    if wav_path != file_path:
                        try:
                            os.remove(wav_path)
                        except:
                            pass
                    
                    try:
                        shutil.rmtree(temp_dir)
                    except:
                        pass
                    
                    # 計算信心度
                    segments = data.get('segments', [])
                    avg_confidence = 0.9
                    if segments:
                        # 使用第一個分段的 no_speech_prob 計算信心度
                        no_speech_prob = segments[0].get('no_speech_prob', 0.1)
                        avg_confidence = max(0.1, 1.0 - no_speech_prob)
                    
                    # 計算總時長
                    total_duration = 0
                    if segments:
                        total_duration = segments[-1].get('end', 0)
                    
                    return {
                        "success": True,
                        "text": data.get('text', ''),
                        "language": data.get('language', 'unknown'),
                        "confidence": avg_confidence,
                        "duration": total_duration,
                        "segments": segments
                    }
                else:
                    logger.error("❌ 未找到轉錄結果文件")
                    return {
                        "success": False,
                        "error": "轉錄完成但未找到結果文件"
                    }
            else:
                logger.error(f"❌ Whisper 轉錄失敗: {result.stderr}")
                return {
                    "success": False,
                    "error": f"轉錄失敗: {result.stderr}"
                }
                
        except subprocess.TimeoutExpired:
            logger.error("❌ 轉錄超時")
            return {
                "success": False,
                "error": "轉錄超時"
            }
        except Exception as e:
            logger.error(f"❌ 轉錄過程錯誤: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
        finally:
            # 清理臨時文件
            try:
                if wav_path != file_path and os.path.exists(wav_path):
                    os.remove(wav_path)
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
            except:
                pass
                
    except Exception as e:
        logger.error(f"❌ 轉錄失敗: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({
            "success": False,
            "error": "請提供音頻文件路徑"
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
    
    result = transcribe_with_whisper(file_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
