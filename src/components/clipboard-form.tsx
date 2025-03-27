"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

const languages = [
  { value: "1", label: "Plain Text" },
  { value: "2", label: "HTML" },
  { value: "3", label: "JavaScript" },
  { value: "4", label: "TypeScript" },
  { value: "5", label: "PHP" },
  { value: "6", label: "Go" },
  { value: "7", label: "C++" },
  { value: "8", label: "C" },
  { value: "9", label: "Python" },
]

const retentionOptions = [
  { value: "5m", label: "5 分钟" },
  { value: "10m", label: "10 分钟" },
  { value: "1d", label: "1 天" },
  { value: "7d", label: "1 周" },
  { value: "1m", label: "1 个月" },
  { value: "1y", label: "1 年" },
  { value: "burn", label: "阅后即焚" },
]

export function ClipboardForm() {
  const router = useRouter()
  const [owner, setOwner] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [languageId, setLanguageId] = useState("1")
  const [keeping, setKeeping] = useState("1d")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // 准备提交数据
      const formData = {
        owner,
        title,
        content,
        languageId,
        keeping,
      }

      // 只有在有值时才添加可选字段
      if (owner.trim()) {
        formData["owner"] = owner
      }

      if (title.trim()) {
        formData["title"] = title
      }

      // 发送 API 请求
      const response = await fetch("http://localhost:4000/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // 保存 token 到 localStorage
        localStorage.setItem(`paste_token_${data.id}`, data.token)

        // 跳转到剪贴板查看页面
        router.push(`/pastes/${data.id}`)
      } else {
        setError(data.error || "创建剪贴板失败，请重试")
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error("提交表单时出错:", err)
      setError("提交表单时出错，请检查网络连接并重试")
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">创建新剪贴板</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="owner">作者</Label>
              <Input
                id="owner"
                placeholder="请输入作者名称（可选）"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">标题</Label>
              <Input
                id="title"
                placeholder="请输入标题（可选）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            <Textarea
              id="content"
              placeholder="请输入或粘贴内容"
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">语言</Label>
              <Select value={languageId} onValueChange={setLanguageId}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="选择语言" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="retention">保留时长</Label>
              <Select value={keeping} onValueChange={setKeeping}>
                <SelectTrigger id="retention">
                  <SelectValue placeholder="选择保留时长" />
                </SelectTrigger>
                <SelectContent>
                  {retentionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting || !content}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              "创建剪贴板"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}