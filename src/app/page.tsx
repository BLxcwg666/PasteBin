import { ClipboardForm } from "@/components/clipboard-form"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Paste Bin</h1>
        <div className="max-w-3xl mx-auto">
          <ClipboardForm />
        </div>
        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} NekoWorkshop, LLC. All rights reserved.
        </footer>
      </main>
    </div>
  )
}