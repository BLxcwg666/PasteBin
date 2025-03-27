"use client"

import { useSearchParams } from "next/navigation"
import { Footer } from "@/components/footer"
import { PasteViewer } from "@/components/paste-viewer"
import { useEffect, useState } from "react"
import { use } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

async function fetchPasteData(id: string, ownerToken?: string) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/pastes/${id}`)
    if (ownerToken) url.searchParams.set("ownerToken", ownerToken)

    const response = await fetch(url.toString(), { cache: "no-store" })
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("获取剪贴板数据失败:", error)
    return null
  }
}

export default function PastePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const searchParams = useSearchParams()
  const ownerToken = searchParams.get("ownerToken")

  const [pasteData, setPasteData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false) // 404 状态

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPasteData(id, ownerToken)
      if (!data) {
        setIsNotFound(true) // 数据未找到时设置 404
      } else {
        setPasteData(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [id, ownerToken])

  if (isNotFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">剪贴板未找到</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">您请求的剪贴板不存在或已过期</p>
          <Button asChild className="mt-6">
            <Link href="/">返回首页</Link>
          </Button>
        </div>
      </div>
    )
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

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          {loading ? (
            <p className="text-center text-gray-500">加载中...</p>
          ) : (
            <PasteViewer id={id} initialData={pasteData} />
          )}
        </div>

        <Footer />
      </div>
    </div>
  )
}