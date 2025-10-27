// Whisper Large V3 模型下載腳本
const fs = require('fs');
const path = require('path');

async function downloadModel() {
  console.log('🚀 開始下載 Whisper Large V3 模型...');
  console.log('📦 這可能需要幾分鐘時間，請耐心等待...');
  
  try {
    // 動態導入 Hugging Face Transformers
    const { pipeline } = await import('@huggingface/transformers');
    
    console.log('🔄 正在下載模型文件...');
    
    // 創建管道並下載模型
    const whisperPipeline = await pipeline(
      'automatic-speech-recognition',
      'openai/whisper-large-v3',
      {
        quantized: false, // 使用完整模型
      }
    );
    
    console.log('✅ 模型下載完成！');
    console.log('📁 模型已保存到本地緩存');
    console.log('🎉 現在可以使用本地 Whisper 模型進行轉錄了');
    
    // 測試模型
    console.log('\n🧪 測試模型...');
    const testResult = await whisperPipeline('test', {
      return_timestamps: true,
    });
    
    console.log('✅ 模型測試成功！');
    
  } catch (error) {
    console.error('❌ 模型下載失敗:', error.message);
    console.log('\n💡 可能的解決方案:');
    console.log('1. 檢查網絡連接');
    console.log('2. 確保有足夠的磁盤空間 (至少 3GB)');
    console.log('3. 嘗試使用 VPN 或代理');
    console.log('4. 稍後重試');
  }
}

// 檢查是否已安裝必要依賴
function checkDependencies() {
  try {
    require('@huggingface/transformers');
    console.log('✅ 依賴已安裝');
    return true;
  } catch (error) {
    console.log('❌ 缺少依賴，正在安裝...');
    return false;
  }
}

async function main() {
  console.log('🔍 檢查依賴...');
  
  if (!checkDependencies()) {
    console.log('請先運行: npm install @huggingface/transformers');
    process.exit(1);
  }
  
  await downloadModel();
}

main().catch(console.error);



