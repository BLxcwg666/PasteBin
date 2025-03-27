import { ClipboardForm } from "@/components/paste-form"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Paste Bin</h1>
        <div className="max-w-3xl mx-auto">
          <ClipboardForm />
        </div>
        <Footer />
      </main>
    </div>
  )
}