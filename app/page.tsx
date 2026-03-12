import Link from 'next/link'
import { Button } from '@/components/ui'

async function getRecentPosts() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts?limit=3`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.data.posts || []
  } catch (error) {
    console.error('Error fetching recent posts:', error)
    return []
  }
}

async function RecentPosts() {
  const posts = await getRecentPosts()

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post: any) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold mb-2">
            <Link 
              href={`/blog/${post.slug}`}
              className="text-gray-900 hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.excerpt || '暂无摘要'}
          </p>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              欢迎来到 Simple Blog
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              一个现代化的全栈博客系统，基于 Next.js 和 Prisma 构建
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Link href="/blog">
                  浏览文章
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                了解更多
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              功能特色
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">高性能</h3>
                <p className="text-gray-600">基于 Next.js 16 和 React 19，提供极致的用户体验</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">现代化设计</h3>
                <p className="text-gray-600">使用 Tailwind CSS 打造美观响应式界面</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">类型安全</h3>
                <p className="text-gray-600">TypeScript + Prisma 提供完整的类型支持</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                最新文章
              </h2>
              <p className="text-gray-600">
                发现最新的技术分享和见解
              </p>
            </div>
            <RecentPosts />
            <div className="text-center mt-8">
              <Button variant="outline">
                <Link href="/blog">
                  查看全部文章
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
