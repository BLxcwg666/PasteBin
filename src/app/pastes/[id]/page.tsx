import { notFound } from "next/navigation"
import { PasteViewer } from "@/components/paste-viewer"

// 从 API 获取剪贴板数据
async function getPasteData(id: string) {
  try {
    // 在实际应用中，这里会从 API 获取数据
    const response = await fetch(`http://localhost:4000/pastes/${id}`, {
      cache: "no-store", // 确保每次都获取最新数据
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("获取剪贴板数据失败:", error)
    return null
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PastePage({ params }: PageProps) {
  // 解析参数
  const { id } = await params

  // 获取数据
  const pasteData = await getPasteData(id)

  if (!pasteData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <PasteViewer id={id} initialData={pasteData} />
      </div>
    </div>
  )
}