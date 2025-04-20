#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Creatomate = require('creatomate');
require('dotenv').config({ path: '.env.local' });

// 配置參數
const API_KEY = process.env.CREATOMATE_API_KEY;
const INPUT_FILE = process.argv[2];
const VIDEO_DURATION = process.argv[3] || 60; // 默認60秒

if (!API_KEY) {
  console.error('請設置 CREATOMATE_API_KEY 環境變數');
  process.exit(1);
}

if (!INPUT_FILE) {
  console.error('用法: node generate-subtitle-video.js <字幕文件路徑> [視頻時長(秒)]');
  process.exit(1);
}

// 創建Creatomate客戶端實例
const client = new Creatomate.Client(API_KEY);

// 讀取字幕文件
function parseSubtitles(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  return lines.map(line => {
    const match = line.match(/(\d{2}:\d{2}:\d{2})\s+(.*)/);
    if (!match) return null;
    
    const timeStr = match[1];
    const text = match[2];
    
    // 將時間格式轉換為秒
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const startTime = hours * 3600 + minutes * 60 + seconds;
    
    return {
      type: 'text',
      text: text,
      time: startTime,
      x: '50%',
      y: '85%',
      width: '80%',
      font_family: 'Noto Sans TC',
      font_size: 42,
      font_weight: 'bold',
      background_color: 'rgba(0, 0, 0, 0.6)',
      background_border_radius: 4,
      text_padding: 10,
      color: 'white',
      text_alignment: 'center',
      duration: 4
    };
  }).filter(Boolean);
}

// 主函數
async function generateVideo(subtitlePath, templatePath, outputName) {
  try {
    // 讀取字幕和模板
    const subtitles = parseSubtitles(subtitlePath);
    const templateJson = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    
    // 合併到模板中
    const videoElements = templateJson.elements[0].elements;
    subtitles.forEach(subtitle => {
      videoElements.push(subtitle);
    });

    console.log('開始生成視頻...');
    
    // 使用Creatomate API生成視頻
    const renders = await client.render({
      source: templateJson,
      output_format: templateJson.format || 'mp4',
      modifications: {}
    });

    console.log('視頻生成成功！');
    console.log(renders);
    
    return renders;
  } catch (error) {
    console.error('生成視頻時出錯:', error);
    throw error;
  }
}

// 如果直接運行腳本
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('用法: node generate-subtitle-video.js <字幕文件路徑> [模板JSON路徑] [輸出名稱]');
    process.exit(1);
  }
  
  const subtitlePath = args[0];
  const templatePath = args[1] || path.join(__dirname, '../json/video-template.json');
  const outputName = args[2] || 'output-video';
  
  generateVideo(subtitlePath, templatePath, outputName)
    .then(() => console.log('處理完成'))
    .catch(err => {
      console.error('腳本執行失敗:', err);
      process.exit(1);
    });
}

module.exports = { generateVideo, parseSubtitles }; 