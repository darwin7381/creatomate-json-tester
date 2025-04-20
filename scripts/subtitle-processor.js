/**
 * Creatomate 字幕處理器
 * 
 * 此腳本能將SRT格式的字幕添加到視頻中，並自動提交到Creatomate API生成視頻
 * 
 * 用法:
 * node subtitle-processor.js [字幕文件] [視頻URL]
 * 
 * 例如:
 * node subtitle-processor.js ../inputs/sample-subtitle.txt https://example.com/video.mp4
 */

// 載入環境變數
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

// 獲取命令行參數
const args = process.argv.slice(2);
const subtitleFile = args[0] || path.join(__dirname, '../inputs/sample-subtitle.txt');
const videoUrl = args[1] || 'https://creatomate-static.s3.amazonaws.com/demo/video1.mp4';

// 獲取API密鑰
const apiKey = process.env.CREATOMATE_API_KEY;
if (!apiKey) {
  console.error('\n⚠️ 請在.env.local檔案中設置CREATOMATE_API_KEY');
  process.exit(1);
}

// 檢查字幕文件
if (!fs.existsSync(subtitleFile)) {
  console.error(`\n⚠️ 字幕文件不存在: ${subtitleFile}`);
  process.exit(1);
}

// 開始處理
console.log('\n🎬 Creatomate 字幕添加器');
console.log('------------------------');
console.log(`📄 字幕文件: ${subtitleFile}`);
console.log(`🎥 視頻URL: ${videoUrl}`);

// 讀取字幕文件
try {
  console.log('\n📖 讀取字幕文件...');
  const subtitleText = fs.readFileSync(subtitleFile, 'utf8');
  
  // 處理字幕
  console.log('🔄 處理字幕內容...');
  const subtitleKeyframes = parseSubtitles(subtitleText);
  
  // 創建請求對象
  const requestBody = {
    source: {
      output_format: "mp4",
      elements: [
        // 視頻元素
        {
          type: "video",
          source: videoUrl
        },
        // 字幕元素
        {
          type: "text",
          text: subtitleKeyframes,
          width: "100%",
          height: "100%",
          x_padding: "3 vmin",
          y_padding: "8 vmin",
          x_alignment: "50%",
          y_alignment: "100%",
          font_family: "Noto Sans TC",
          font_weight: "800",
          font_size: "8.48 vh",
          fill_color: "#ffffff",
          shadow_color: "rgba(0,0,0,0.65)",
          shadow_blur: "1.6 vmin"
        }
      ]
    }
  };
  
  // 保存處理結果
  const outputFile = path.join(__dirname, '../json/subtitle-output.json');
  fs.writeFileSync(outputFile, JSON.stringify(requestBody, null, 2));
  console.log(`✅ 已生成JSON文件: ${outputFile}`);
  
  // 發送到API
  console.log('\n🚀 正在提交到Creatomate API生成視頻...');
  sendToCreatomate(requestBody, apiKey);
  
} catch (error) {
  console.error(`\n❌ 處理出錯: ${error.message}`);
  console.error(error.stack);
  process.exit(1);
}

/**
 * 解析字幕文本
 * @param {string} subtitleText - 字幕文本
 * @returns {Array} 關鍵幀數組
 */
function parseSubtitles(subtitleText) {
  const keyframes = [];
  
  // 以空行分割每個字幕塊
  const subtitleBlocks = subtitleText.split('\n\n');
  
  for (const block of subtitleBlocks) {
    if (!block.trim()) continue;
    
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;
    
    // 分析時間行
    const timeLine = lines[0];
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    
    if (!timeMatch) continue;
    
    const startTime = parseTimestamp(timeMatch[1]);
    const endTime = parseTimestamp(timeMatch[2]);
    
    // 獲取字幕文本（可能有多行）
    const captionText = lines.slice(1).join('\n');
    
    keyframes.push({
      time: `${startTime} s`,
      value: captionText
    });
    
    // 添加結束時間的空值，以便在時間結束時移除字幕
    keyframes.push({
      time: `${endTime} s`,
      value: ""
    });
  }
  
  return keyframes;
}

/**
 * 將SRT時間戳格式轉換為秒數
 * @param {string} timestamp - SRT時間戳 (00:01:23,456)
 * @returns {number} 秒數
 */
function parseTimestamp(timestamp) {
  // 替換逗號為點
  timestamp = timestamp.replace(',', '.');
  
  // 分解時間部分
  const parts = timestamp.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  
  // 轉換為秒
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 發送到Creatomate API
 * @param {Object} requestBody - 請求體
 * @param {string} apiKey - API密鑰
 */
function sendToCreatomate(requestBody, apiKey) {
  const options = {
    hostname: 'api.creatomate.com',
    port: 443,
    path: '/v1/renders',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    // 接收數據
    res.on('data', (chunk) => {
      data += chunk;
    });

    // 完成請求
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        // 保存API響應
        const responseFile = path.join(__dirname, '../json/subtitle-response.json');
        fs.writeFileSync(responseFile, JSON.stringify(response, null, 2));
        
        console.log('\n✅ API請求成功!');
        console.log(`📄 完整響應已保存到: ${responseFile}`);
        
        // 顯示渲染信息
        if (Array.isArray(response) && response.length > 0) {
          console.log('\n🎬 渲染任務信息:');
          response.forEach((render, index) => {
            console.log(`  任務 ${index + 1}:`);
            console.log(`    ID: ${render.id}`);
            console.log(`    狀態: ${render.status}`);
            if (render.url) {
              console.log(`    URL: ${render.url}`);
            }
          });
          
          console.log('\n🔍 可以通過訪問上述URL查看生成的視頻');
        }
        
      } catch (error) {
        console.error('\n❌ 解析API響應時出錯:', error.message);
      }
    });
  });

  // 處理請求錯誤
  req.on('error', (error) => {
    console.error('\n❌ API請求失敗:', error.message);
  });

  // 發送請求
  req.write(JSON.stringify(requestBody));
  req.end();
} 