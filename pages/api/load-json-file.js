import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  // 只接受GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '僅支持GET方法' });
  }

  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: '缺少必要參數: filePath' });
    }
    
    // 安全檢查：確保路徑只包含有效的字符，並且只能訪問json和sample-json目錄
    if (!/^(json|sample-json)\/[a-zA-Z0-9_\-\/\.]+\.json$/.test(filePath)) {
      return res.status(400).json({ error: '無效的文件路徑格式' });
    }
    
    // 構建文件的絕對路徑
    const workspaceRoot = process.cwd();
    const absolutePath = path.join(workspaceRoot, filePath);
    
    // 防止目錄遍歷攻擊
    const normalizedPath = path.normalize(absolutePath);
    if (!normalizedPath.startsWith(workspaceRoot)) {
      return res.status(403).json({ error: '禁止訪問該路徑' });
    }
    
    // 檢查文件是否存在
    if (!fs.existsSync(normalizedPath)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    
    // 讀取文件內容
    const fileContent = fs.readFileSync(normalizedPath, 'utf8');
    
    // 嘗試解析JSON
    try {
      const jsonContent = JSON.parse(fileContent);
      res.status(200).json({
        content: fileContent,
        parsedJson: jsonContent
      });
    } catch (parseError) {
      res.status(200).json({
        content: fileContent,
        error: '無法解析JSON: ' + parseError.message
      });
    }
  } catch (error) {
    console.error('讀取JSON文件時出錯:', error);
    res.status(500).json({
      error: '讀取JSON文件時出錯',
      message: error.message
    });
  }
} 