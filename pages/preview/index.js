import React, { useRef, useState } from 'react';
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
        <Link href="/preview/json" className={styles.jsonLink}>
          瀏覽JSON文件 &rarr;
        </Link>
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
            <Link href="/preview/json" className={styles.browseLink}>
              瀏覽所有JSON
            </Link>
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