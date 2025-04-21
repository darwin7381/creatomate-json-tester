const fs = require('fs');
const path = require('path');
const Creatomate = require('creatomate');

// 初始化Creatomate客戶端
require('dotenv').config({ path: '.env.local' });
const client = new Creatomate.Client(process.env.CREATOMATE_API_KEY);

// 讀取視頻模板
const videoTemplate = require('../json/video-template.json');

// 解析SRT字幕文件
function parseSRT(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const subtitleBlocks = content.trim().split('\n\n');
  
  return subtitleBlocks.map(block => {
    const lines = block.trim().split('\n');
    if (lines.length < 3) return null;
    
    const timecodes = lines[1].split(' --> ');
    const startTime = timecodeToSeconds(timecodes[0]);
    const endTime = timecodeToSeconds(timecodes[1]);
    const text = lines.slice(2).join('\n');
    
    return {
      type: 'text',
      text: text,
      time: startTime,
      duration: endTime - startTime,
      y: '85%',
      width: '80%',
      background_color: 'rgba(0, 0, 0, 0.6)',
      text_color: '#ffffff',
      font_family: 'Roboto',
      font_size: 36,
      font_weight: 'bold',
      text_alignment: 'center',
      padding: 20,
      border_radius: 4
    };
  }).filter(Boolean);
}

// 將SRT時間碼轉換為秒
function timecodeToSeconds(timecode) {
  const parts = timecode.split(',');
  const timeParts = parts[0].split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = parseInt(timeParts[2], 10);
  const milliseconds = parseInt(parts[1], 10);
  
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

// 主函數
async function generateSubtitledVideo() {
  try {
    // 獲取輸入參數
    const subtitleFile = process.argv[2] || path.join(__dirname, '../inputs/sample-subtitles.srt');
    const outputName = process.argv[3] || 'output-video';
    
    console.log(`正在處理字幕文件: ${subtitleFile}`);
    
    // 解析字幕文件
    const subtitleElements = parseSRT(subtitleFile);
    
    // 將字幕添加到視頻模板
    const fullTemplate = {
      ...videoTemplate,
      elements: [...videoTemplate.elements, ...subtitleElements]
    };
    
    // 儲存完整模板
    const jsonOutputPath = path.join(__dirname, `../json/${outputName}-full.json`);
    fs.writeFileSync(jsonOutputPath, JSON.stringify(fullTemplate, null, 2));
    console.log(`已保存完整模板到: ${jsonOutputPath}`);
    
    // 使用Creatomate API生成視頻
    console.log('正在生成視頻，請稍候...');
    const renders = await client.render({
      source: fullTemplate,
      output_format: 'mp4'
    });
    
    console.log('視頻生成完成!');
    
    // 處理結果對象
    if (Array.isArray(renders) && renders.length > 0) {
      console.log(`視頻URL: ${renders[0].url}`);
      console.log(`視頻ID: ${renders[0].id}`);
    } else if (renders && renders.url) {
      console.log(`視頻URL: ${renders.url}`);
      console.log(`視頻ID: ${renders.id}`);
    } else {
      console.log('無法獲取視頻URL和ID，請檢查返回的結果');
    }
    
    // 保存渲染結果
    const renderOutputPath = path.join(__dirname, `../json/${outputName}-render-result.json`);
    fs.writeFileSync(renderOutputPath, JSON.stringify(renders, null, 2));
    console.log(`已保存渲染結果到: ${renderOutputPath}`);
    
  } catch (error) {
    console.error('生成視頻時出錯:', error);
  }
}

// 執行主函數
generateSubtitledVideo(); 