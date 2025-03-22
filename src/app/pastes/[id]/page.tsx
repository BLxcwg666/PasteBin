"use client"

import { notFound } from "next/navigation"
import { ClipboardViewer } from "@/components/clipboard-viewer"

// 模拟从数据库获取剪贴板数据
async function getClipboardData(id: string) {
  // 在实际应用中，这里会从数据库获取数据
  // 这里仅作为演示，返回模拟数据

  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  // 如果ID不是有效格式，返回404
  if (!/^[a-zA-Z0-9]{8}$/.test(id)) {
    return null
  }

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 7) // 假设保留一周

  return {
    id,
    author: "张三",
    title: "React Hooks 示例代码",
    content: `import { useState, useEffect } from 'react';

function ExampleComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`You clicked \${count} times\`;
    
    return () => {
      // 清理函数
      console.log('Component unmounted');
    };
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default ExampleComponent;`,
    language: "jsx",
    retention: "1week",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    burnAfterReading: false,
  }
}

export default async function ClipboardPage({ params }: { params: { id: string } }) {
  const clipboardData = await getClipboardData(params.id)

  if (!clipboardData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <ClipboardViewer data={clipboardData} />
      </div>
    </div>
  )
}