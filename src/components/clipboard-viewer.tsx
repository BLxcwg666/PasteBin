"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Clock, Calendar, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css" // 导入深色主题样式

// 定义剪贴板数据类型
interface ClipboardData {
  id: string
  author: string
  title: string
  content: string
  language: string
  retention: string
  createdAt: string
  expiresAt: string
  burnAfterReading: boolean
}

// 语言映射表
const languageMap: Record<string, string> = {
  plaintext: "plaintext",
  html: "html",
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  php: "php",
  go: "go",
  cpp: "cpp",
  c: "c",
  python: "python",
}

// 保留时长映射表
const retentionMap: Record<string, string> = {
  "5min": "5 分钟",
  "10min": "10 分钟",
  "1day": "1 天",
  "1week": "1 周",
  "1month": "1 个月",
  "1year": "1 年",
  burn: "阅后即焚",
}

export function ClipboardViewer({ data }: { data: ClipboardData }) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [hasRead, setHasRead] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState("")
  const codeRef = useRef<HTMLElement>(null)

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 高亮代码
  useEffect(() => {
    const language = languageMap[data.language] || "plaintext"

    try {
      if (language === "plaintext") {
        setHighlightedCode(data.content)
      } else {
        const highlighted = hljs.highlight(data.content, {
          language,
          ignoreIllegals: true,
        }).value
        setHighlightedCode(highlighted)
      }
    } catch (error) {
      console.error("Highlighting error:", error)
      setHighlightedCode(data.content)
    }
  }, [data.content, data.language])

  // 计算剩余时间
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const expires = new Date(data.expiresAt)
      const diff = expires.getTime() - now.getTime()

      if (diff <= 0) {
        return "已过期"
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days} 天 ${hours} 小时`
      } else if (hours > 0) {
        return `${hours} 小时 ${minutes} 分钟`
      } else {
        return `${minutes} 分钟`
      }
    }

    setTimeLeft(calculateTimeLeft())
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // 每分钟更新一次

    return () => clearInterval(timer)
  }, [data.expiresAt])

  // 复制内容到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 如果是阅后即焚，标记为已读
  useEffect(() => {
    if (data.burnAfterReading && !hasRead) {
      setHasRead(true)
      // 在实际应用中，这里会发送请求到服务器标记为已读
    }
  }, [data.burnAfterReading, hasRead])

  // 添加行号
  const codeWithLineNumbers = () => {
    const lines = data.content.split("\n")
    return (
      <div className="flex">
        <div className="text-right pr-4 select-none text-gray-500 bg-zinc-900 pt-6 pb-6">
          {lines.map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="overflow-auto w-full">
          <pre className="pt-6 pb-6">
            <code
              ref={codeRef}
              className={`language-${languageMap[data.language] || "plaintext"}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <CardTitle className="text-2xl">{data.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              由 {data.author || "匿名用户"} 创建于 {formatDate(data.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {retentionMap[data.retention] || data.retention}
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              剩余时间: {timeLeft}
            </Badge>
            {data.burnAfterReading && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                阅后即焚
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">预览</TabsTrigger>
            <TabsTrigger value="raw">原始文本</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-0">
            <div className="relative rounded-md border overflow-hidden">
              <div className="absolute right-2 top-2 z-10">
                <Button size="sm" variant="secondary" className="h-8 gap-1" onClick={copyToClipboard}>
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      复制
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-zinc-950 text-zinc-100 overflow-x-auto font-mono text-sm">{codeWithLineNumbers()}</div>
            </div>
          </TabsContent>

          <TabsContent value="raw" className="mt-0">
            <div className="relative">
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-2 top-2 h-8 gap-1"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制
                  </>
                )}
              </Button>
              <pre className={cn("p-6 rounded-md border bg-muted/50 overflow-auto", "text-sm font-mono")}>
                {data.content}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-6">
        <div className="text-sm text-muted-foreground">ID: {data.id}</div>
        <div className="text-sm text-muted-foreground mt-2 sm:mt-0">过期时间: {formatDate(data.expiresAt)}</div>
      </CardFooter>
    </Card>
  )
}