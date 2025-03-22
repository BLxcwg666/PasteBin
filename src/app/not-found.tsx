import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
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