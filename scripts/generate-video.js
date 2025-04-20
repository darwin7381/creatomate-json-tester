const fs = require('fs');
const path = require('path');
const Creatomate = require('creatomate');

// 讀取API密鑰
require('dotenv').config({ path: '.env.local' });
const apiKey = process.env.CREATOMATE_API_KEY;

if (!apiKey) {
  console.error('錯誤: 缺少CREATOMATE_API_KEY環境變量');
  console.log('請創建.env.local文件並添加您的API密鑰: CREATOMATE_API_KEY=your_key_here');
  process.exit(1);
}

// 初始化Creatomate客戶端
const client = new Creatomate.Client(apiKey);

// 讀取字幕文件
async function parseSubtitles(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const subtitles = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // 跳過空行
      if (line === '') {
        i++;
        continue;
      }
      
      // 解析時間戳行 (格式: 00:00:01 --> 00:00:05)
      if (line.includes('-->')) {
        const times = line.split('-->').map(t => t.trim());
        const startTime = parseTimeToSeconds(times[0]);
        const endTime = parseTimeToSeconds(times[1]);
        
        // 下一行是字幕文本
        if (i + 1 < lines.length) {
          const text = lines[i + 1].trim();
          
          subtitles.push({
            type: 'text',
            text: text,
            time: startTime,
            duration: endTime - startTime,
            y: '90%',
            background_color: 'rgba(0, 0, 0, 0.6)',
            background_padding: '0.5em',
            font_family: 'Roboto',
            font_size: '2em',
            color: 'white',
            text_alignment: 'center'
          });
          
          i += 2; // 跳到下一個時間戳
        } else {
          i++;
        }
      } else {
        i++;
      }
    }
    
    return subtitles;
  } catch (error) {
    console.error('解析字幕文件時出錯:', error);
    throw error;
  }
}

// 將時間字符串(HH:MM:SS)轉換為秒
function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

// 生成視頻
async function generateVideo(subtitlesPath, templatePath, outputPath) {
  try {
    // 讀取JSON模板
    const templateJson = JSON.parse(await fs.promises.readFile(templatePath, 'utf8'));
    
    // 解析字幕
    const subtitleElements = await parseSubtitles(subtitlesPath);
    
    // 將字幕添加到模板
    templateJson.elements[1].elements = subtitleElements;
    
    console.log('正在生成視頻...');
    
    // 創建渲染任務
    const output = await client.render({
      source: templateJson
    });
    
    console.log('視頻生成成功!');
    console.log('URL:', output.url);
    
    // 將結果保存到輸出文件
    await fs.promises.writeFile(outputPath, JSON.stringify(output, null, 2));
    console.log(`輸出信息已保存至: ${outputPath}`);
    
    return output;
  } catch (error) {
    console.error('生成視頻時出錯:', error);
    throw error;
  }
}

// 主函數
async function main() {
  const inputFile = process.argv[2] || 'inputs/sample-subtitles.txt';
  const templateFile = process.argv[3] || 'json/subtitle-template.json';
  const outputFile = process.argv[4] || 'json/output.json';
  
  try {
    await generateVideo(inputFile, templateFile, outputFile);
  } catch (error) {
    console.error('執行腳本時出錯:', error);
    process.exit(1);
  }
}

// 執行主函數
main(); 