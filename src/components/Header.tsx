import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart3 } from "lucide-react"

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="#">
        <BarChart3 className="h-6 w-6" />
        <span className="sr-only">Acme Inc</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
          機能
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
          料金
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#contact">
          お問い合わせ
        </Link>
        <Button variant="outline" asChild>
          <Link href="/dashboard">ログイン</Link>
        </Button>
      </nav>
    </header>
  )
}