import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/JsonLoader.module.css';

export default function JsonLoaderPage() {
  const router = useRouter();
  const [jsonFiles, setJsonFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchJsonFiles() {
      try {
        // 獲取 JSON 文件列表
        const response = await fetch('/api/list-json-files');
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤 ${response.status}`);
        }
        
        const data = await response.json();
        setJsonFiles(data.files || []);
      } catch (err) {
        setError(`載入JSON文件列表失敗: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchJsonFiles();
  }, []);

  const handleSelectFile = (fileName) => {
    router.push({
      pathname: '/preview',
      query: { file: fileName }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          &larr; 返回首頁
        </Link>
        <h1 className={styles.title}>JSON 文件選擇器</h1>
        <Link href="/preview" className={styles.previewLink}>
          前往預覽頁面 &rarr;
        </Link>
      </div>

      <div className={styles.content}>
        <p className={styles.description}>
          從下面選擇一個JSON文件進行預覽，或者<Link href="/preview">直接前往預覽頁面</Link>輸入自定義JSON。
        </p>

        {loading && <div className={styles.loading}>正在載入文件列表...</div>}
        
        {error && <div className={styles.error}>{error}</div>}

        {!loading && !error && jsonFiles.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              沒有找到JSON文件。請確保您的<code>json/</code>和<code>sample-json/</code>目錄中有JSON文件。
            </p>
          </div>
        )}

        {jsonFiles.length > 0 && (
          <div className={styles.fileGrid}>
            {jsonFiles.map((file) => (
              <div 
                key={file.path} 
                className={styles.fileCard}
                onClick={() => handleSelectFile(file.path)}
              >
                <div className={styles.fileIcon}>📄</div>
                <div className={styles.fileInfo}>
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.filePath}>{file.path}</div>
                  <div className={styles.fileSize}>{file.size}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 