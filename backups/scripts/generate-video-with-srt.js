// 這個腳本用於將SRT字幕轉換成視頻

const fs = require('fs');
const path = require('path');
const Creatomate = require('creatomate');
const parseSRT = require('parse-srt');
require('dotenv').config({ path: '.env.local' });

// 獲取API密鑰
const apiKey = process.env.CREATOMATE_API_KEY || '';
if (!apiKey) {
  console.error('請設置CREATOMATE_API_KEY環境變數');
  process.exit(1);
}

// 創建Creatomate客戶端
const client = new Creatomate.Client(apiKey);

// 解析命令行參數
const srtPath = process.argv[2] || 'inputs/sample-subtitles.srt';
const outputName = process.argv[3] || 'output-video';
const templatePath = process.argv[4] || 'json/video-template.json';

// 讀取SRT文件
console.log(`讀取字幕文件: ${srtPath}`);
const srtContent = fs.readFileSync(srtPath, 'utf8');
const subtitles = parseSRT(srtContent);

// 讀取視頻模板
console.log(`讀取視頻模板: ${templatePath}`);
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

// 將字幕添加到模板中
const subtitleElements = subtitles.map(subtitle => ({
  type: 'text',
  text: subtitle.text,
  time: subtitle.start * 1000, // 轉換為毫秒
  duration: (subtitle.end - subtitle.start) * 1000,
  x: '50%',
  y: '90%',
  width: '90%',
  font_family: 'Noto Sans TC',
  font_size: 56,
  font_weight: 'bold',
  color: 'white',
  background_color: 'rgba(0, 0, 0, 0.5)',
  background_padding: '12px',
  text_alignment: 'center',
  opacity: 100,
  shadow_color: 'rgba(0, 0, 0, 0.5)',
  shadow_blur: 2,
  shadow_offset_x: 2,
  shadow_offset_y: 2
}));

// 將字幕元素添加到模板中
template.elements = [...template.elements, ...subtitleElements];

// 生成視頻
console.log('開始生成視頻...');
client.render({
  source: template,
  output_format: 'mp4',
  output_name: outputName
}).then(renders => {
  console.log('視頻生成成功!');
  console.log('輸出:', renders[0].url);
}).catch(error => {
  console.error('生成視頻時出錯:', error);
}); 