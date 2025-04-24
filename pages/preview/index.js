import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Preview.module.css';
import dynamic from 'next/dynamic';

// 動態導入 Preview 組件以避免服務端渲染問題
const PreviewComponent = dynamic(() => import('../../components/PreviewComponent'), {
  ssr: false,
  loading: () => <div className={styles.loading}>正在載入預覽器...</div>
});

export default function PreviewPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jsonFiles, setJsonFiles] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 載入可用的JSON文件列表
  useEffect(() => {
    async function fetchJsonFiles() {
      try {
        const response = await fetch('/api/list-json-files');
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤 ${response.status}`);
        }
        
        const data = await response.json();
        setJsonFiles(data.files || []);
      } catch (err) {
        setError(`載入JSON文件列表失敗: ${err.message}`);
      }
    }

    fetchJsonFiles();
  }, []);

  // 處理點擊下拉選單外部關閉下拉選單
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 從文件載入JSON
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // 驗證這是有效的JSON
        JSON.parse(content);
        setJsonInput(content);
      } catch (err) {
        setError(`無效的JSON文件: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  // 從服務器加載JSON文件
  const handleLoadJsonFile = async (filePath) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/load-json-file?filePath=${encodeURIComponent(filePath)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP錯誤 ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.content) {
        setJsonInput(data.content);
      } else if (data.error) {
        setError(`載入JSON錯誤: ${data.error}`);
      }
      
      setIsDropdownOpen(false);
    } catch (err) {
      setError(`載入JSON文件失敗: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 設置示例JSON
  const setExampleJson = () => {
    const exampleJson = {
      output_format: 'mp4',
      width: 1920,
      height: 1080,
      elements: [
        {
          type: 'video',
          source: 'https://creatomate.com/files/assets/c16f42db-7b5b-4ab7-9625-bc869fae623d.mp4',
          duration: 5,
          fit: 'contain'
        },
        {
          type: 'text',
          text: '示例文本',
          font_family: 'Noto Sans TC',
          font_size: '5.5 vmin',
          font_weight: '700',
          fill_color: '#FFFFFF',
          x_alignment: '50%',
          y: '70%',
          width: '80%',
          background_color: 'rgba(0,0,0,0.7)',
          time: 0,
          duration: 5
        }
      ]
    };
    
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          &larr; 返回首頁
        </Link>
        <h1 className={styles.title}>Creatomate 視頻預覽</h1>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.jsonInput}>
          <h2>JSON 腳本</h2>
          <div className={styles.inputActions}>
            <button onClick={setExampleJson}>載入示例</button>
            <label className={styles.fileUpload}>
              從文件載入
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileUpload} 
                hidden 
              />
            </label>
            <div className={styles.dropdown} ref={dropdownRef}>
              <button 
                className={styles.dropdownButton} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                瀏覽所有JSON {isDropdownOpen ? '▲' : '▼'}
              </button>
              {isDropdownOpen && (
                <div className={styles.dropdownContent}>
                  {jsonFiles.length === 0 ? (
                    <div className={styles.dropdownItem}>沒有找到JSON文件</div>
                  ) : (
                    jsonFiles.map((file) => (
                      <div 
                        key={file.path} 
                        className={styles.dropdownItem}
                        onClick={() => handleLoadJsonFile(file.path)}
                      >
                        {file.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <textarea 
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="請在此輸入JSON腳本或使用「載入示例」按鈕"
            rows={15}
            className={styles.jsonTextarea}
          />
          
          {error && <div className={styles.error}>{error}</div>}
        </div>
        
        <div className={styles.previewContainer}>
          <h2>視頻預覽</h2>
          <div className={styles.previewWrapper}>
            <PreviewComponent
              jsonInput={jsonInput}
              filePath={router.query.file}
              onError={(errorMessage) => setError(errorMessage)}
              onLoadingChange={(loading) => setIsLoading(loading)}
            />
            
            {isLoading && (
              <div className={styles.loadingIndicator}>
                載入中...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 