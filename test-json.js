/**
 * Creatomate JSON測試腳本
 * 用法: node test-json.js path/to/your/json-file.json
 * 
 * 範例: 
 * node test-json.js sample-json/text-overlay.json
 */

// 載入環境變數
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const Creatomate = require('creatomate');

// 獲取API密鑰
const apiKey = process.env.CREATOMATE_API_KEY;

if (!apiKey) {
  console.error('\n⚠️ 請在.env.local文件中設置您的CREATOMATE_API_KEY');
  console.error('\n例如： CREATOMATE_API_KEY=your_api_key_here');
  process.exit(1);
}

// 創建Creatomate客戶端
const client = new Creatomate.Client(apiKey);

// 獲取命令行參數中的JSON文件路徑
const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('\n⚠️ 請提供JSON文件路徑。用法：node test-json.js path/to/your/json-file.json');
  console.error('\n範例：');
  console.error('- node test-json.js sample-json/text-overlay.json');
  console.error('- node test-json.js sample-json/video-concat.json');
  console.error('- node test-json.js json/subtitle-template.json');
  process.exit(1);
}

// 檢查文件是否存在
if (!fs.existsSync(jsonFilePath)) {
  console.error(`\n⚠️ 文件不存在: ${jsonFilePath}`);
  process.exit(1);
}

// 讀取JSON文件
console.log(`\n讀取JSON文件: ${jsonFilePath}`);
try {
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
  const jsonData = JSON.parse(jsonContent);
  
  console.log('JSON格式有效，準備測試...\n');
  testCreatomateJSON(jsonData);
} catch (error) {
  console.error(`\n⚠️ JSON解析錯誤: ${error.message}`);
  process.exit(1);
}

/**
 * 測試Creatomate JSON
 * @param {Object} jsonData - JSON數據對象
 */
async function testCreatomateJSON(jsonData) {
  console.log('🔄 正在發送到Creatomate進行渲染...');
  
  try {
    // 檢查JSON是否有source屬性（直接定義）或templateId（使用模板）
    const options = {};
    
    if (jsonData.source) {
      options.source = jsonData.source;
    } else if (jsonData.template_id || jsonData.templateId) {
      // 支持兩種模板ID命名風格
      options.templateId = jsonData.template_id || jsonData.templateId;
      
      // 如果有modifications屬性，則添加
      if (jsonData.modifications) {
        options.modifications = jsonData.modifications;
      }
    } else {
      // 如果既沒有source也沒有templateId，則假設整個JSON就是source定義
      options.source = jsonData;
    }
    
    // 執行渲染
    const renders = await client.render(options);
    
    console.log('\n✅ 渲染請求成功!');
    console.log('\n渲染結果:');
    console.log(JSON.stringify(renders, null, 2));
    
    console.log('\n您可以在以下URL查看渲染狀態:');
    renders.forEach(render => {
      console.log(`- ${render.id}: ${render.url || '無URL'}`);
    });
    
  } catch (error) {
    console.error(`\n❌ 渲染失敗: ${error.message}`);
    
    // 詳細錯誤信息
    if (error.response && error.response.data) {
      console.error('\n詳細錯誤信息:');
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
} 