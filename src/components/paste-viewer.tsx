"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check, Clock, Calendar, AlertTriangle, Trash2, Key, Loader2 } from "lucide-react"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// 定义剪贴板数据类型
interface PasteData {
  id: string
  owner?: string
  title?: string
  content: string
  language: string // API 返回的是 language 而不是 languageId
  keeping: string
  createdAt: string
  expiresAt: string
  burnAfterReading?: boolean
}

// API 语言名称到 highlight.js 语言标识符的映射
const languageMap: Record<string, string> = {
  "Plain Text": "plaintext",
  HTML: "html",
  JavaScript: "javascript",
  TypeScript: "typescript",
  PHP: "php",
  Go: "go",
  "C++": "cpp",
  C: "c",
  Python: "python",
}

// 保留时长映射表
const retentionMap: Record<string, string> = {
  "5m": "5 分钟",
  "10m": "10 分钟",
  "1d": "1 天",
  "7d": "1 周",
  "30d": "1 个月",
  "365d": "1 年",
  burn: "阅后即焚",
}

export function PasteViewer({ id, initialData }: { id: string; initialData: PasteData }) {
  const [data, setData] = useState<PasteData>(initialData)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState("")
  const [hasRead, setHasRead] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [token, setToken] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customToken, setCustomToken] = useState("")
  const codeRef = useRef<HTMLElement>(null)

  // 检查 localStorage 中是否有 token
  useEffect(() => {
    const savedToken = localStorage.getItem(`paste_token_${id}`)
    if (savedToken) {
      setToken(savedToken)
      // 只在首次加载时显示 token
      const hasShownToken = sessionStorage.getItem(`shown_token_${id}`)
      if (!hasShownToken) {
        setShowToken(true)
        sessionStorage.setItem(`shown_token_${id}`, "true")
      }
    }
  }, [id])

  // 格式化日期
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "未知日期"
      }
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "未知日期"
    }
  }

  // 获取 highlight.js 语言标识符
  const getHighlightLanguage = (apiLanguage: string): string => {
    return languageMap[apiLanguage] || "plaintext"
  }

  // 高亮代码
  useEffect(() => {
    const language = getHighlightLanguage(data.language)

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
      try {
        const now = new Date()
        const expires = new Date(data.expiresAt)

        if (isNaN(expires.getTime())) {
          return "未知"
        }

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
      } catch (error) {
        return "未知"
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

  // 复制 token 到剪贴板
  const copyTokenToClipboard = () => {
    navigator.clipboard.writeText(token)
    alert("Token 已复制到剪贴板")
  }

  // 如果是阅后即焚，标记为已读
  useEffect(() => {
    if (data.burnAfterReading && !hasRead) {
      setHasRead(true)
      // 在实际应用中，这里会发送请求到服务器标记为已读
    }
  }, [data.burnAfterReading, hasRead])

  // 删除剪贴板
  const deletePaste = async (tokenToUse: string) => {
    setIsDeleting(true)
    setDeleteError("")

    try {
      const response = await fetch("/del", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          token: tokenToUse,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setDeleteSuccess(true)
        // 删除成功后清除 localStorage 中的 token
        localStorage.removeItem(`paste_token_${id}`)
      } else {
        setDeleteError(result.error || "删除失败，请重试")
      }
    } catch (err) {
      console.error("删除剪贴板时出错:", err)
      setDeleteError("删除剪贴板时出错，请检查网络连接并重试")
    } finally {
      setIsDeleting(false)
      setIsDialogOpen(false)
    }
  }

  // 处理自定义 token 删除
  const handleCustomTokenDelete = () => {
    if (customToken.trim()) {
      deletePaste(customToken)
    } else {
      setDeleteError("请输入有效的 token")
    }
  }

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
              className={`language-${getHighlightLanguage(data.language)}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>
    )
  }

  // 如果删除成功，显示成功信息
  if (deleteSuccess) {
    return (
      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle>删除成功</AlertTitle>
        <AlertDescription>剪贴板已成功删除。</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {showToken && (
        <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle>您的访问令牌</AlertTitle>
          <AlertDescription className="flex items-center gap-2">
            <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded text-sm">{token}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyTokenToClipboard}
              className="h-7 text-xs border-blue-200 dark:border-blue-800"
            >
              复制
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowToken(false)} className="h-7 text-xs ml-auto">
              关闭
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{data.title || "无标题"}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                由 {data.owner || "匿名用户"} 创建于 {formatDate(data.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {retentionMap[data.keeping] || data.keeping}
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

                <div className="bg-zinc-950 text-zinc-100 overflow-x-auto font-mono text-sm">
                  {codeWithLineNumbers()}
                </div>
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
                <pre className="p-6 rounded-md border bg-muted/50 overflow-auto text-sm font-mono">{data.content}</pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">ID: {id}</div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="text-sm text-muted-foreground">过期时间: {formatDate(data.expiresAt)}</div>

            {token ? (
              <Button
                variant="destructive"
                size="sm"
                className="ml-4 gap-1"
                onClick={() => deletePaste(token)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    删除
                  </>
                )}
              </Button>
            ) : (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4 gap-1">
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>输入删除令牌</DialogTitle>
                    <DialogDescription>请输入创建此剪贴板时获得的令牌以删除它。</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="token">令牌</Label>
                      <Input
                        id="token"
                        placeholder="请输入令牌"
                        value={customToken}
                        onChange={(e) => setCustomToken(e.target.value)}
                      />
                    </div>
                    {deleteError && <p className="text-sm font-medium text-destructive">{deleteError}</p>}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      取消
                    </Button>
                    <Button variant="destructive" onClick={handleCustomTokenDelete} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          删除中...
                        </>
                      ) : (
                        "删除"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  )
}