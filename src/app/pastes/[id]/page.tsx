import { notFound } from "next/navigation"
import { Footer } from "@/components/footer"
import { PasteViewer } from "@/components/paste-viewer"
import type { Metadata, ResolvingMetadata } from "next"

// 从 API 获取剪贴板数据
async function getPasteData(id: string) {
  try {
    // 在实际应用中，这里会从 API 获取数据
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pastes/${id}`, {
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

// 生成动态元数据
export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params

  // 获取数据
  const pasteData = await getPasteData(id)

  // 如果没有找到数据，返回默认标题
  if (!pasteData) {
    return {
      title: "Paste Not Found - Paste Bin",
    }
  }

  // 使用剪贴板标题或默认标题
  const title = pasteData.title ? `${pasteData.title} - Paste Bin` : "Untitled Paste - Paste Bin"

  return {
    title,
  }
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params

  // 获取数据
  const pasteData = await getPasteData(id)

  if (!pasteData) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paste Bin</h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
          >
            返回首页
          </a>
        </div>
        <PasteViewer id={id} initialData={pasteData} />
        <Footer />
      </div>
    </div>
  )
}