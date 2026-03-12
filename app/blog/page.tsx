import { Suspense } from 'react'
import { PostCard } from '@/components/features/post-card'
import { Button } from '@/components/ui'

async function getPosts() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts?limit=10`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } }
  }
}

async function PostsList() {
  const { posts, pagination } = await getPosts()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">暂无文章</h2>
        <p className="text-gray-600">还没有发布任何文章，请稍后再来查看。</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post: any) => (
        <PostCard key={post.id} post={post} />
      ))}
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">
            加载更多
          </Button>
        </div>
      )}
    </div>
  )
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              博客文章
            </h1>
            <p className="text-xl text-gray-600">
              分享技术心得，记录成长历程
            </p>
          </div>

          <Suspense fallback={
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          }>
            <PostsList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
