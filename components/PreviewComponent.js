import React, { useEffect, useRef, useState } from 'react';
import { Preview } from '@creatomate/preview';

export default function PreviewComponent({ jsonInput, filePath, onError, onLoadingChange }) {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化預覽SDK
  useEffect(() => {
    if (!containerRef.current) return;

    const setupPreview = () => {
      try {
        // 清理先前的實例
        if (previewRef.current) {
          previewRef.current.dispose();
          previewRef.current = null;
        }

        if (onLoadingChange) onLoadingChange(true);

        // 初始化預覽器
        const preview = new Preview(
          containerRef.current,
          'player',
          process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN
        );

        preview.onReady = async () => {
          try {
            setIsInitialized(true);

            // 嘗試加載模板（如果配置了）
            if (process.env.NEXT_PUBLIC_TEMPLATE_ID) {
              await preview.loadTemplate(process.env.NEXT_PUBLIC_TEMPLATE_ID);
            }

            if (onLoadingChange) onLoadingChange(false);
          } catch (err) {
            console.error('初始化預覽時出錯:', err);
            if (onError) onError(`初始化預覽時出錯: ${err.message}`);
            if (onLoadingChange) onLoadingChange(false);
          }
        };

        preview.onError = (err) => {
          console.error('預覽SDK錯誤:', err);
          if (onError) onError(`預覽SDK錯誤: ${err}`);
          if (onLoadingChange) onLoadingChange(false);
        };

        preview.onLoad = () => {
          if (onLoadingChange) onLoadingChange(true);
        };

        preview.onLoadComplete = () => {
          if (onLoadingChange) onLoadingChange(false);
        };

        previewRef.current = preview;
      } catch (err) {
        console.error('設置預覽時出錯:', err);
        if (onError) onError(`設置預覽時出錯: ${err.message}`);
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    setupPreview();

    // 清理函數
    return () => {
      if (previewRef.current) {
        previewRef.current.dispose();
        previewRef.current = null;
      }
    };
  }, [containerRef.current]);

  // 處理從文件加載的JSON
  useEffect(() => {
    const loadJsonFile = async () => {
      if (!previewRef.current || !isInitialized || !filePath) return;

      try {
        if (onLoadingChange) onLoadingChange(true);
        
        const response = await fetch(`/api/load-json-file?filePath=${encodeURIComponent(filePath)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP錯誤 ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content && previewRef.current) {
          try {
            const jsonSource = JSON.parse(data.content);
            await previewRef.current.setSource(jsonSource);
          } catch (err) {
            if (onError) onError(`無法應用JSON: ${err.message}`);
          }
        } else if (data.error) {
          if (onError) onError(`載入JSON錯誤: ${data.error}`);
        }
      } catch (err) {
        console.error('載入JSON文件失敗:', err);
        if (onError) onError(`載入JSON文件失敗: ${err.message}`);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    loadJsonFile();
  }, [filePath, isInitialized]);

  // 處理JSON輸入更新
  useEffect(() => {
    const updatePreview = async () => {
      if (!previewRef.current || !isInitialized || !jsonInput) return;

      try {
        if (onLoadingChange) onLoadingChange(true);
        const jsonSource = JSON.parse(jsonInput);
        await previewRef.current.setSource(jsonSource);
      } catch (err) {
        console.error('應用JSON時出錯:', err);
        if (onError) onError(`JSON解析錯誤: ${err.message}`);
      } finally {
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    updatePreview();
  }, [jsonInput, isInitialized]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
} 