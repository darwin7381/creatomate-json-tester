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

    // 解析時間範圍
    const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeMatch) continue;

    const startTime = timeMatch[1].replace(',', '.');
    const endTime = timeMatch[2].replace(',', '.');

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
 * @param {string} templatePath JSON模板路徑
 * @param {string} outputPath 輸出JSON路徑
 * @returns {Promise<string>} 處理結果
 */
async function processSubtitles(subtitlePath, templatePath, outputPath) {
  try {
    // 讀取字幕文件
    const subtitleContent = fs.readFileSync(subtitlePath, 'utf8');
    const subtitles = parseSubtitles(subtitleContent);
    
    if (subtitles.length === 0) {
      throw new Error('未找到有效字幕');
    }

    console.log(`已解析 ${subtitles.length} 條字幕`);
    
    // 讀取模板
    const templateJson = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // 計算視頻總時長 (最後一個字幕的結束時間)
    const totalDuration = Math.ceil(subtitles[subtitles.length - 1].end);
    templateJson.duration = totalDuration;
    
    // 更新視頻源的持續時間
    if (templateJson.elements && templateJson.elements[0]) {
      if (templateJson.elements[0].sources) {
        templateJson.elements[0].sources[0].duration = totalDuration;
      } else if (templateJson.elements[0].source) {
        templateJson.elements[0].duration = totalDuration;
      }
    }
    
    // 清除現有字幕元素
    const nonSubtitleElements = templateJson.elements.filter(elem => elem.type !== 'subtitle');
    templateJson.elements = nonSubtitleElements;
    
    // 添加新的字幕元素
    subtitles.forEach(subtitle => {
      templateJson.elements.push({
        type: 'subtitle',
        track: 10,
        text_align: 'center',
        text: subtitle.text,
        font_family: 'Noto Sans TC',
        font_size: 60,
        font_weight: 'bold',
        stroke_color: '#000000',
        stroke_width: 5,
        x: '50%',
        y: '85%',
        width: '80%',
        background_color: 'transparent',
        start: subtitle.start,
        duration: subtitle.duration
      });
    });
    
    // 保存生成的JSON
    fs.writeFileSync(outputPath, JSON.stringify(templateJson, null, 2));
    console.log(`已將處理後的JSON保存到: ${outputPath}`);
    
    // 創建視頻
    console.log('開始渲染視頻...');
    const source = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    
    const renders = await client.render({
      source: source
    });
    
    // 檢查渲染任務結果格式
    let videoUrl = '';
    if (Array.isArray(renders) && renders.length > 0) {
      videoUrl = renders[0].url;
    } else if (renders && renders.url) {
      videoUrl = renders.url;
    }
    
    return `視頻渲染成功，訪問地址: ${videoUrl}`;
  } catch (error) {
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
    
    // 設置模板和輸出路徑
    const templatePath = path.join(jsonDir, 'subtitle-template.json');
    const outputPath = path.join(jsonDir, 'output-video.json');
    
    // 處理字幕
    console.log(`正在處理字幕文件: ${subtitlePath}`);
    const result = await processSubtitles(subtitlePath, templatePath, outputPath);
    console.log(result);
  } catch (error) {
    console.error(`執行過程中發生錯誤: ${error.message}`);
    process.exit(1);
  }
}

// 執行主函數
main(); 