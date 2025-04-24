import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Creatomate 視頻工具集</h1>
      
      <div className={styles.description}>
        <p>這個項目提供了一系列工具和腳本，用於使用Creatomate API生成和處理視頻，特別是添加字幕到視頻中。</p>
      </div>
      
      <div className={styles.grid}>
        <Link href="/preview" className={styles.card}>
          <h2>視頻預覽工具 &rarr;</h2>
          <p>使用我們的預覽工具來即時查看和驗證你的視頻JSON腳本。</p>
        </Link>
        
        <div className={styles.card}>
          <h2>生成字幕視頻 &rarr;</h2>
          <p>使用 'npm run subtitle' 命令從字幕文件生成視頻。</p>
        </div>
        
        <div className={styles.card}>
          <h2>生成基本視頻 &rarr;</h2>
          <p>使用 'npm run generate' 命令生成基本視頻。</p>
        </div>
        
        <div className={styles.card}>
          <h2>JSON測試 &rarr;</h2>
          <p>使用 'npm test' 命令測試你的JSON腳本。</p>
        </div>
      </div>
    </div>
  );
} 