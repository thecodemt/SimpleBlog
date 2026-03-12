import Link from 'next/link'
import { Button } from '@/components/ui'

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Simple Blog
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              首页
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              文章
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              关于
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              登录
            </Button>
            <Button size="sm">
              注册
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
