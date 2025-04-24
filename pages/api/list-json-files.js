import fs from 'fs';
import path from 'path';

// 獲取文件大小的格式化函數
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 遞歸獲取目錄中的所有JSON文件
function getAllJsonFiles(dir, basePath = '', fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsonFiles(filePath, relativePath, fileList);
    } else if (path.extname(file).toLowerCase() === '.json') {
      fileList.push({
        name: file,
        path: relativePath,
        size: formatFileSize(stat.size),
        lastModified: stat.mtime
      });
    }
  });
  
  return fileList;
}

export default function handler(req, res) {
  try {
    const workspaceRoot = process.cwd();
    const jsonDirPath = path.join(workspaceRoot, 'json');
    const sampleJsonDirPath = path.join(workspaceRoot, 'sample-json');
    
    let allFiles = [];
    
    // 檢查並獲取json目錄中的文件
    if (fs.existsSync(jsonDirPath)) {
      const jsonFiles = getAllJsonFiles(jsonDirPath, 'json');
      allFiles = allFiles.concat(jsonFiles);
    }
    
    // 檢查並獲取sample-json目錄中的文件
    if (fs.existsSync(sampleJsonDirPath)) {
      const sampleJsonFiles = getAllJsonFiles(sampleJsonDirPath, 'sample-json');
      allFiles = allFiles.concat(sampleJsonFiles);
    }
    
    // 按最後修改時間排序（最新的在前面）
    allFiles.sort((a, b) => b.lastModified - a.lastModified);
    
    res.status(200).json({
      files: allFiles
    });
  } catch (error) {
    console.error('Error listing JSON files:', error);
    res.status(500).json({
      error: '獲取JSON文件列表時出錯',
      message: error.message
    });
  }
} 