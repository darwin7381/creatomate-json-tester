const fs = require('fs');
const path = require('path');
const { Creatomate } = require('creatomate');

// 讀取API密鑰
require('dotenv').config();
const apiKey = process.env.CREATOMATE_API_KEY;

// 建立Creatomate客戶端
const client = new Creatomate.Client(apiKey);

// 讀取字幕文件
function readSubtitleFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    const subtitles = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 解析時間碼格式 00:00:00,000 --> 00:00:05,000
      const timeCodeMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      
      if (timeCodeMatch) {
        const startTime = parseTimeCode(timeCodeMatch[1]);
        const endTime = parseTimeCode(timeCodeMatch[2]);
        
        // 下一行是字幕文本
        if (i + 1 < lines.length) {
          const text = lines[i + 1].trim();
          
          subtitles.push({
            startTime,
            endTime,
            text
          });
          
          i++; // 跳過已處理的文本行
        }
      }
    }
    
    return subtitles;
  } catch (error) {
    console.error('讀取字幕文件出錯:', error);
    return [];
  }
}

// 將時間碼轉換為秒
function parseTimeCode(timeCode) {
  // 將 00:00:00,000 格式轉換為秒
  const parts = timeCode.replace(',', '.').split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseFloat(parts[2]);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// 生成視頻JSON
function generateVideoJSON(subtitles, templatePath, outputPath) {
  try {
    // 讀取模板JSON
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    
    // 將字幕添加到模板中
    const subtitleElements = subtitles.map(subtitle => ({
      type: 'text',
      text: subtitle.text,
      time: subtitle.startTime,
      duration: subtitle.endTime - subtitle.startTime,
      y: '85%',
      width: '90%',
      background_color: 'rgba(0, 0, 0, 0.5)',
      background_padding: 10,
      font_family: 'Roboto',
      font_size: 36,
      color: 'white',
      text_align: 'center'
    }));
    
    // 將字幕元素添加到模板中
    templateData.elements = [...templateData.elements, ...subtitleElements];
    
    // 寫入輸出JSON
    fs.writeFileSync(outputPath, JSON.stringify(templateData, null, 2));
    
    console.log(`已生成視頻JSON: ${outputPath}`);
    return templateData;
  } catch (error) {
    console.error('生成視頻JSON出錯:', error);
    return null;
  }
}

// 使用Creatomate API生成視頻
async function renderVideo(jsonData, outputFilename) {
  try {
    console.log('正在生成視頻...');
    
    const renders = await client.render({
      source: jsonData,
      output_format: 'mp4',
      width: jsonData.width,
      height: jsonData.height,
      framerate: jsonData.framerate
    });
    
    console.log('視頻生成成功!');
    console.log('視頻URL:', renders[0].url);
    
    // 下載視頻到本地
    const outputDir = path.join(__dirname, '../outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 透過URL下載視頻
    console.log(`視頻已生成，請從以下URL下載: ${renders[0].url}`);
    
    return renders[0].url;
  } catch (error) {
    console.error('視頻生成失敗:', error);
    return null;
  }
}

// 主函數
async function main() {
  const inputFile = path.join(__dirname, '../inputs/sample-subtitles.txt');
  const templateFile = path.join(__dirname, '../json/video-template.json');
  const outputJsonFile = path.join(__dirname, '../json/output-video.json');
  
  console.log('正在處理字幕文件...');
  const subtitles = readSubtitleFile(inputFile);
  console.log(`找到 ${subtitles.length} 個字幕`);
  
  console.log('正在生成視頻JSON...');
  const videoJson = generateVideoJSON(subtitles, templateFile, outputJsonFile);
  
  if (videoJson) {
    console.log('正在調用Creatomate API生成視頻...');
    const videoUrl = await renderVideo(videoJson, 'subtitle-video.mp4');
    
    if (videoUrl) {
      console.log('===========================================');
      console.log('處理完成!');
      console.log(`視頻JSON保存在: ${outputJsonFile}`);
      console.log(`視頻URL: ${videoUrl}`);
      console.log('===========================================');
    }
  }
}

// 執行主函數
main().catch(console.error); 