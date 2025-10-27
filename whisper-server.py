#!/usr/bin/env python3
"""
本地 Whisper Large V3 服務器
使用 Python 和 transformers 庫提供本地轉錄服務
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

# 設置日誌
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WhisperHandler(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.pipeline = None
        super().__init__(*args, **kwargs)
    
    def do_POST(self):
        if self.path == '/transcribe':
            self.handle_transcribe()
        else:
            self.send_error(404)
    
    def handle_transcribe(self):
        try:
            # 讀取請求數據
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            file_path = data.get('file_path')
            if not file_path or not os.path.exists(file_path):
                self.send_error(400, "File not found")
                return
            
            logger.info(f"轉錄文件: {file_path}")
            
            # 執行轉錄
            result = self.transcribe_audio(file_path)
            
            # 發送響應
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = json.dumps(result, ensure_ascii=False)
            self.wfile.write(response.encode('utf-8'))
            
        except Exception as e:
            logger.error(f"轉錄錯誤: {e}")
            self.send_error(500, str(e))
    
    def transcribe_audio(self, file_path: str) -> Dict[str, Any]:
        """使用 Whisper 轉錄音頻文件"""
        try:
            # 延遲導入以避免啟動時的依賴問題
            from transformers import pipeline
            
            # 加載模型 (如果尚未加載)
            if self.pipeline is None:
                logger.info("正在加載 Whisper Large V3 模型...")
                self.pipeline = pipeline(
                    "automatic-speech-recognition",
                    model="openai/whisper-large-v3",
                    return_timestamps=True,
                    chunk_length_s=30,
                    stride_length_s=5,
                )
                logger.info("模型加載完成")
            
            # 執行轉錄
            logger.info("開始轉錄...")
            result = self.pipeline(file_path)
            
            # 處理結果
            text = result.get("text", "")
            chunks = result.get("chunks", [])
            
            # 轉換為我們的格式
            segments = []
            for chunk in chunks:
                if "timestamp" in chunk:
                    segments.append({
                        "start": chunk["timestamp"][0],
                        "end": chunk["timestamp"][1],
                        "text": chunk["text"],
                        "confidence": 0.9  # Whisper 不提供信心度
                    })
            
            return {
                "success": True,
                "text": text,
                "language": "auto-detected",
                "confidence": 0.9,
                "duration": segments[-1]["end"] if segments else 0,
                "segments": segments
            }
            
        except Exception as e:
            logger.error(f"轉錄失敗: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def log_message(self, format, *args):
        """自定義日誌格式"""
        logger.info(f"{self.address_string()} - {format % args}")

def check_dependencies():
    """檢查必要的 Python 依賴"""
    try:
        import transformers
        import torch
        logger.info(f"Transformers 版本: {transformers.__version__}")
        logger.info(f"PyTorch 版本: {torch.__version__}")
        return True
    except ImportError as e:
        logger.error(f"缺少依賴: {e}")
        logger.error("請運行: pip install transformers torch torchaudio")
        return False

def main():
    """主函數"""
    logger.info("🚀 啟動本地 Whisper 服務器...")
    
    # 檢查依賴
    if not check_dependencies():
        sys.exit(1)
    
    # 設置服務器
    port = int(os.environ.get('WHISPER_PORT', 8000))
    server_address = ('', port)
    
    try:
        httpd = HTTPServer(server_address, WhisperHandler)
        logger.info(f"✅ 服務器啟動成功，監聽端口 {port}")
        logger.info(f"🌐 訪問地址: http://localhost:{port}")
        logger.info("📝 使用 POST /transcribe 端點進行轉錄")
        logger.info("🛑 按 Ctrl+C 停止服務器")
        
        httpd.serve_forever()
        
    except KeyboardInterrupt:
        logger.info("🛑 服務器已停止")
    except Exception as e:
        logger.error(f"❌ 服務器啟動失敗: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()



