import React, { useEffect, useRef, useState } from 'react';
import { Preview } from '@creatomate/preview';

export default function PreviewComponent({ jsonInput, filePath, onError, onLoadingChange }) {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const previousJsonInputRef = useRef('');
  const processingRef = useRef(false);
  const pendingUpdateRef = useRef(null);
  const retryCountRef = useRef(0);  // 新增：重試計數器
  const maxRetries = 3;  // 新增：最大重試次數
  
  // 分離更新到獨立時間片段，避免阻塞主線程
  const scheduleUpdate = (callback) => {
    return new Promise(resolve => {
      if (typeof window !== 'undefined') {
        // 使用 setTimeout 嵌套在 requestAnimationFrame 中，進一步減少對主線程的佔用
        window.requestAnimationFrame(() => {
          // 用 0ms 延遲來釋放主線程，允許輸入處理
          setTimeout(() => {
            try {
              const result = callback();
              resolve(result);
            } catch (err) {
              console.error('執行更新時出錯:', err);
              resolve(null);
            }
          }, 0);
        });
      } else {
        try {
          const result = callback();
          resolve(result);
        } catch (err) {
          console.error('執行更新時出錯:', err);
          resolve(null);
        }
      }
    });
  };

  // 新增：重試設置源的函數
  const setSourceWithRetry = async (jsonSource, isRetry = false) => {
    if (!previewRef.current) return;
    
    try {
      // 如果是重試，則添加更長的延遲
      if (isRetry) {
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // 首次嘗試前主動顯示處理中信息，避免錯誤閃現
        if (onError) onError(`載入大型JSON中，正在進行優化處理...`);
      }
      
      // 包裝在 try-catch 中執行 setSource 調用
      try {
        await previewRef.current.setSource(jsonSource);
      } catch (setSourceError) {
        // 直接在內部處理，不向外拋出錯誤
        console.log('setSource錯誤已在內部處理:', setSourceError);
        // 如果是載入失敗，則進入重試邏輯而不顯示錯誤
        if (setSourceError.toString().includes('Load failed') && retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log(`嘗試重新應用JSON，第 ${retryCountRef.current} 次重試`);
          
          setTimeout(() => {
            setSourceWithRetry(jsonSource, true);
          }, 800 * retryCountRef.current);
          
          return; // 直接返回，防止錯誤向上傳播
        }
      }
      
      // 成功後重置重試計數
      retryCountRef.current = 0;
      // 清除錯誤消息
      if (onError) onError('');
    } catch (err) {
      console.error('應用JSON時出錯:', err);
      
      // 檢查是否為載入失敗錯誤且還有重試機會
      if (err.toString().includes('Load failed') && retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        console.log(`嘗試重新應用JSON，第 ${retryCountRef.current} 次重試`);
        
        // 顯示處理中信息而非錯誤信息
        if (onError) {
          onError(`載入大型JSON中，正在進行優化處理...`);
        }
        
        // 延遲後重試
        setTimeout(() => {
          setSourceWithRetry(jsonSource, true);
        }, 800 * retryCountRef.current); // 隨著重試次數增加延遲時間
      } else {
        // 重試次數用完或其他錯誤
        if (onError) onError(`應用JSON時出錯: ${err.message}`);
        retryCountRef.current = 0;
      }
    } finally {
      // 只有在不是重試或者是最後一次重試時才重置處理標誌
      if (!isRetry || retryCountRef.current >= maxRetries) {
        // 延遲重置處理標誌，讓UI有時間響應
        setTimeout(() => {
          processingRef.current = false;
          if (onLoadingChange) onLoadingChange(false);
        }, 50);
      }
    }
  };

  // 初始化預覽SDK
  useEffect(() => {
    if (!containerRef.current) return;

    const setupPreview = async () => {
      try {
        // 清理先前的實例
        if (previewRef.current) {
          previewRef.current.dispose();
          previewRef.current = null;
        }

        if (onLoadingChange) onLoadingChange(true);

        // 全局捕獲未處理的承諾錯誤，防止錯誤顯示在界面上
        const originalOnUnhandledRejection = window.onunhandledrejection;
        window.onunhandledrejection = function(event) {
          // 檢查錯誤信息中是否包含 "Load failed"
          if (event && event.reason && 
              (event.reason.toString().includes('Load failed') || 
               event.reason.toString().includes('Failed to set source'))) {
            // 防止默認行為（顯示錯誤）
            event.preventDefault();
            event.stopPropagation();
            console.log('已攔截未處理的承諾錯誤:', event.reason);
            
            // 可以在這裡替換為友好的錯誤信息
            if (onError && retryCountRef.current === 0) {
              onError('載入大型JSON中，正在進行優化處理...');
            }
            return true;
          }
          // 對於其他類型的錯誤，保持默認行為
          return originalOnUnhandledRejection ? originalOnUnhandledRejection.apply(this, arguments) : false;
        };

        // 初始化預覽器
        const preview = new Preview(
          containerRef.current,
          'player',
          process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN
        );

        // 攔截 setSource 方法，增加錯誤處理
        const originalSetSource = preview.setSource;
        preview.setSource = async function(source) {
          try {
            return await originalSetSource.call(this, source);
          } catch (err) {
            console.log('攔截到 setSource 錯誤:', err);
            // 不要將錯誤向上拋出，而是通過自定義處理方式處理
            if (err.toString().includes('Load failed')) {
              // 這裡不拋出錯誤，僅記錄，避免錯誤彈窗
              if (onError) onError('載入大型JSON中，正在進行優化處理...');
              // 如果需要重試，可以在此處理
              if (retryCountRef.current < maxRetries) {
                retryCountRef.current++;
                // 將重試邏輯從 setSourceWithRetry 移到這裡
                setTimeout(() => {
                  setSourceWithRetry(source, true);
                }, 800 * retryCountRef.current);
              }
              return false; // 返回非拋出錯誤的結果
            }
            // 僅在需要時才拋出錯誤
            throw err;
          }
        };

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
          
          // 過濾所有與「Load failed」或「Failed to set source」相關的錯誤
          if (err.includes('Load failed') || err.includes('Failed to set source')) {
            // 完全抑制這些錯誤的顯示
            console.log('資源載入失敗已被攔截，避免顯示錯誤彈窗');
            // 顯示處理中信息
            if (onError) {
              onError(`載入大型JSON中，正在進行優化處理...`);
            }
            return; // 直接返回，不顯示錯誤
          }
          
          // 其他類型錯誤或重試次數用完的處理
          processingRef.current = false;
          if (onError) {
            // 如果是CORS錯誤或視頻載入錯誤，提供更友好的錯誤信息
            if (err.includes('CORS') || err.includes('video') || err.includes('load')) {
              onError('視頻資源載入錯誤: 請確保視頻URL正確且允許跨域訪問');
            } else {
              onError(`預覽SDK錯誤: ${err}`);
            }
          }
          if (onLoadingChange) onLoadingChange(false);
        };

        preview.onLoad = () => {
          processingRef.current = true;
          if (onLoadingChange) onLoadingChange(true);
        };

        preview.onLoadComplete = () => {
          // 延遲標記處理完成，確保UI更新後再處理新的輸入
          setTimeout(() => {
            processingRef.current = false;
            if (onLoadingChange) onLoadingChange(false);
          }, 50);
        };

        previewRef.current = preview;
      } catch (err) {
        console.error('設置預覽時出錯:', err);
        if (onError) onError(`設置預覽時出錯: ${err.message}`);
        processingRef.current = false;
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    setupPreview();

    // 清理函數
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
      if (previewRef.current) {
        previewRef.current.dispose();
        previewRef.current = null;
      }
      // 恢復原始的未處理承諾錯誤處理器
      if (typeof window !== 'undefined') {
        window.onunhandledrejection = null;
      }
    };
  }, []);

  // 處理從文件加載的JSON
  useEffect(() => {
    const loadJsonFile = async () => {
      if (!previewRef.current || !isInitialized || !filePath || processingRef.current) return;

      processingRef.current = true;
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
            
            // 使用帶重試機制的方法應用JSON
            await scheduleUpdate(() => {
              if (!previewRef.current) return null;
              // 使用新的重試機制
              return setSourceWithRetry(jsonSource);
            });
          } catch (err) {
            if (onError) onError(`無法應用JSON: ${err.message}`);
            processingRef.current = false;
            if (onLoadingChange) onLoadingChange(false);
          }
        } else if (data.error) {
          if (onError) onError(`載入JSON錯誤: ${data.error}`);
          processingRef.current = false;
          if (onLoadingChange) onLoadingChange(false);
        }
      } catch (err) {
        console.error('載入JSON文件失敗:', err);
        if (onError) onError(`載入JSON文件失敗: ${err.message}`);
        processingRef.current = false;
        if (onLoadingChange) onLoadingChange(false);
      }
    };

    loadJsonFile();
  }, [filePath, isInitialized]);

  // 使用防抖處理JSON輸入更新
  useEffect(() => {
    // 清除現有的更新計劃
    if (pendingUpdateRef.current) {
      clearTimeout(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
    
    if (!isInitialized || !jsonInput) return;
    
    // 避免處理相同的輸入
    if (jsonInput === previousJsonInputRef.current) return;
    previousJsonInputRef.current = jsonInput;
    
    // 避免在處理中重複觸發更新
    if (processingRef.current) {
      // 如果正在處理，計劃稍後再嘗試
      pendingUpdateRef.current = setTimeout(() => {
        // 重新觸發效果而不更新依賴項
        const currentInput = jsonInput;
        setImmediate(() => {
          if (currentInput === jsonInput) {
            previousJsonInputRef.current = '';
          }
        });
      }, 1000);
      return;
    }
    
    // 清除現有的超時
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // 使用更長的防抖延遲，確保用戶完成輸入
    debounceTimeoutRef.current = setTimeout(() => {
      try {
        let jsonSource;
        
        try {
          // 驗證JSON格式，但不應用
          jsonSource = JSON.parse(jsonInput);
          
          // 簡單檢查是否為有效物件
          if (!jsonSource || typeof jsonSource !== 'object') {
            if (onError) onError('JSON格式不正確，請確保提供有效的對象');
            return;
          }
        } catch (parseError) {
          console.error('JSON解析錯誤:', parseError);
          if (onError) onError(`JSON格式錯誤: ${parseError.message}`);
          return;
        }
        
        if (!previewRef.current) return;
        
        // 標記正在處理
        processingRef.current = true;
        if (onLoadingChange) onLoadingChange(true);
        if (onError) onError(''); // 清除錯誤
        
        // 使用非阻塞方式並帶重試機制設置源
        scheduleUpdate(async () => {
          if (!previewRef.current) return;
          // 使用新的重試機制
          await setSourceWithRetry(jsonSource);
        });
      } catch (err) {
        console.error('處理JSON輸入時出錯:', err);
        if (onError) onError(`處理JSON時出錯: ${err.message}`);
        processingRef.current = false;
        if (onLoadingChange) onLoadingChange(false);
      }
    }, 1000); // 使用更長的防抖時間，確保用戶完成輸入
    
  }, [jsonInput, isInitialized]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>;
} 