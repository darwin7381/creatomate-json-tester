const fs = require('fs');
const path = require('path');
const Creatomate = require('creatomate');
require('dotenv').config({ path: '.env.local' });

// 初始化 Creatomate API 客戶端
const apiKey = process.env.CREATOMATE_API_KEY || '你的API密鑰'; // 請替換為您的 API 密鑰
const client = new Creatomate.Client(apiKey);

/**
 * 解析字幕文件
 * @param {string} content 字幕文件內容
 * @returns {Array} 處理後的字幕數組
 */
function parseSubtitles(content) {
  // 前處理：處理各種可能的格式問題
  
  // 1. 檢查是否是只有一行但包含\n字符的情況
  if (!content.includes('\n') && content.includes('\\n')) {
    console.log('檢測到單行包含\\n的字幕文件，進行轉換處理...');
    // 將\n字符序列替換為實際的換行符
    content = content.replace(/\\n/g, '\n');
  }
  
  // 2. 檢查是否是JSON格式的字幕
  try {
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const jsonData = JSON.parse(content);
      console.log('檢測到JSON格式的字幕，進行轉換處理...');
      
      // 簡單處理一下常見的字幕JSON格式
      if (Array.isArray(jsonData)) {
        // 可能是數組格式的字幕
        const converted = jsonData.map((item, index) => {
          const startTime = item.startTime || item.start || 0;
          const endTime = item.endTime || item.end || 0;
          const text = item.text || item.content || '';
          
          return `${index + 1}\n00:00:${formatTime(startTime)} --> 00:00:${formatTime(endTime)}\n${text}\n`;
        }).join('\n');
        
        content = converted;
      }
    }
  } catch (e) {
    // 不是有效的JSON，繼續使用原始內容
  }
  
  // 3. 處理可能的字幕時間戳格式問題
  
  const lines = content.split('\n');
  const subtitles = [];
  let i = 0;

  // 跳過BOM和文件頭部信息
  while (i < lines.length && !lines[i].match(/^\d+$/)) {
    i++;
  }

  while (i < lines.length) {
    // 字幕序號
    const index = parseInt(lines[i], 10);
    if (isNaN(index)) {
      i++;
      continue;
    }
    i++;

    // 時間戳行
    if (i >= lines.length) break;
    const timeLine = lines[i];
    i++;

    // 解析時間範圍 - 支持多種格式
    // 標準SRT: 00:00:00,000 --> 00:00:00,000
    // 簡化格式: 0:00 --> 0:00
    let timeMatch = timeLine.match(/(\d+:\d+:\d+,\d+)\s*-->\s*(\d+:\d+:\d+,\d+)/) || 
                   timeLine.match(/(\d+:\d+:\d+\.\d+)\s*-->\s*(\d+:\d+:\d+\.\d+)/) ||
                   timeLine.match(/(\d+:\d+)\s*-->\s*(\d+:\d+)/);
    
    if (!timeMatch) continue;

    let startTime = timeMatch[1];
    let endTime = timeMatch[2];
    
    // 統一格式
    startTime = startTime.replace(',', '.');
    endTime = endTime.replace(',', '.');
    
    // 補充完整時間格式
    if (!startTime.includes(':')) {
      startTime = `00:00:${startTime}`;
    } else if (startTime.split(':').length === 2) {
      startTime = `00:${startTime}`;
    }
    
    if (!endTime.includes(':')) {
      endTime = `00:00:${endTime}`;
    } else if (endTime.split(':').length === 2) {
      endTime = `00:${endTime}`;
    }

    // 字幕文本 (可能有多行)
    let text = '';
    while (i < lines.length && lines[i].trim() !== '') {
      text += (text ? '\n' : '') + lines[i];
      i++;
    }

    // 計算時間（秒）
    const startSeconds = parseTimeToSeconds(startTime);
    const endSeconds = parseTimeToSeconds(endTime);
    const duration = endSeconds - startSeconds;

    subtitles.push({
      index,
      start: startSeconds,
      end: endSeconds,
      duration,
      text: text.trim()
    });

    // 跳過空行
    i++;
  }

  return subtitles;
}

/**
 * 格式化時間為 00.000 格式
 * @param {number} seconds 
 * @returns {string}
 */
function formatTime(seconds) {
  const wholeSec = Math.floor(seconds);
  const ms = Math.floor((seconds - wholeSec) * 1000);
  return `${wholeSec.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * 將時間字符串轉換為秒數
 * @param {string} timeStr 時間字符串 (格式: HH:MM:SS.mmm)
 * @returns {number} 秒數
 */
function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':');
  const seconds = parseFloat(parts[2]);
  const minutes = parseInt(parts[1], 10);
  const hours = parseInt(parts[0], 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * 處理字幕並創建視頻
 * @param {string} subtitlePath 字幕文件路徑
 * @returns {Promise<string>} 處理結果
 */
async function processSubtitles(subtitlePath) {
  try {
    // 讀取字幕文件
    const subtitleContent = fs.readFileSync(subtitlePath, 'utf8');
    const subtitles = parseSubtitles(subtitleContent);
    
    if (subtitles.length === 0) {
      throw new Error('未找到有效字幕');
    }

    console.log(`已解析 ${subtitles.length} 條字幕`);
    
    // 計算視頻總時長 (最後一個字幕的結束時間)
    const totalDuration = Math.ceil(subtitles[subtitles.length - 1].end);
    console.log(`設置視頻總時長為 ${totalDuration} 秒`);
    
    // 構建更簡單的渲染源定義
    const source = {
      outputFormat: 'mp4',
      width: 1920,
      height: 1080,
      fillColor: '#262626',
      elements: [
        // 背景視頻
        {
          type: 'video',
          source: 'https://creatomate.com/files/assets/c16f42db-7b5b-4ab7-9625-bc869fae623d.mp4',
          fit: 'cover'
        }
      ]
    };
    
    // 添加字幕元素
    subtitles.forEach((subtitle, index) => {
      console.log(`添加字幕 #${index+1}: ${subtitle.start}s --> ${subtitle.start + subtitle.duration}s: ${subtitle.text.substring(0, 30)}${subtitle.text.length > 30 ? '...' : ''}`);
      
      source.elements.push({
        type: 'text',
        name: 'subtitle',
        text: subtitle.text,
        font_family: 'Noto Sans TC',
        font_size: '5.5 vmin',
        font_size_minimum: '5 vmin',
        line_height: '126%',
        font_weight: '700',
        fill_color: '#FFFFFF',
        x_alignment: '50%',
        y: '70.3388%',
        width: '83.1194%',
        background_color: 'rgba(19,19,19,0.7)',
        time: `${subtitle.start} s`,
        duration: `${subtitle.duration} s`
      });
    });
    
    // 保存生成的源代碼到JSON文件（僅用於參考）
    const outputJsonPath = path.join(path.resolve(__dirname, '..'), 'json', 'output-video.json');
    fs.writeFileSync(outputJsonPath, JSON.stringify(source, null, 2));
    console.log(`已將處理後的源代碼保存到: ${outputJsonPath}`);
    
    // 創建視頻
    console.log('開始渲染視頻...');
    const renders = await client.render({ 
      source,
      output_format: 'mp4' // 明確指定輸出格式
    });
    
    // 檢查渲染任務結果
    let videoUrl = '';
    if (Array.isArray(renders) && renders.length > 0) {
      videoUrl = renders[0].url;
      console.log(`渲染任務ID: ${renders[0].id}, 狀態: ${renders[0].status}`);
    } else if (renders && renders.url) {
      videoUrl = renders.url;
      console.log(`渲染任務ID: ${renders.id}, 狀態: ${renders.status}`);
    }
    
    return `視頻渲染成功，訪問地址: ${videoUrl}`;
  } catch (error) {
    console.error(`處理字幕時出錯: ${error.message}`);
    console.error(error.stack);
    return `處理字幕時出錯: ${error.message}`;
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    // 確保目錄結構
    const baseDir = path.resolve(__dirname, '..');
    const inputsDir = path.join(baseDir, 'inputs');
    const jsonDir = path.join(baseDir, 'json');
    
    // 創建目錄（如果不存在）
    [inputsDir, jsonDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    
    // 處理命令行參數
    const args = process.argv.slice(2);
    
    // 獲取字幕文件名
    let subtitleFile = args[0];
    if (!subtitleFile) {
      // 嘗試讀取inputs目錄中的第一個.srt文件
      const files = fs.readdirSync(inputsDir);
      subtitleFile = files.find(file => file.endsWith('.srt'));
      
      if (!subtitleFile) {
        console.error('錯誤: 請指定字幕文件，或將.srt文件放在inputs目錄中');
        process.exit(1);
      }
    }
    
    // 確保字幕文件路徑正確
    const subtitlePath = subtitleFile.includes('/') ? 
      subtitleFile : path.join(inputsDir, subtitleFile);
    
    // 檢查文件是否存在
    if (!fs.existsSync(subtitlePath)) {
      console.error(`錯誤: 字幕文件 ${subtitlePath} 不存在`);
      process.exit(1);
    }
    
    // 處理字幕
    console.log(`正在處理字幕文件: ${subtitlePath}`);
    const result = await processSubtitles(subtitlePath);
    console.log(result);
  } catch (error) {
    console.error(`執行過程中發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
main(); 