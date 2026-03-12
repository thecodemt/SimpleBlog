import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui'

async function getPost(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/posts/${slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch post')
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* 文章头部 */}
            <header className="mb-8">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span>{formatDate(post.createdAt)}</span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span>{post.category.name}</span>
                  </>
                )}
                <span>•</span>
                <span>{post.viewCount} 次浏览</span>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {post.author?.avatar && (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {post.author?.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {post.author?.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {post._count && (
                    <>
                      <span className="text-sm text-gray-500">
                        {post._count.comments} 评论
                      </span>
                      <span className="text-sm text-gray-500">
                        {post._count.postLikes} 点赞
                      </span>
                    </>
                  )}
                </div>
              </div>
            </header>

            {/* 文章封面图 */}
            {post.coverImage && (
              <div className="mb-8">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* 文章内容 */}
            <div className="prose prose-lg max-w-none mb-8">
              <div 
                dangerouslySetInnerHTML={{ __html: post.content }}
                className="whitespace-pre-wrap"
              />
            </div>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-4 pt-8 border-t">
              <Button variant="outline">
                👍 点赞
              </Button>
              <Button variant="outline">
                💬 评论
              </Button>
              <Button variant="outline">
                🔗 分享
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* 相关文章区域 */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              相关文章
            </h2>
            <div className="text-center text-gray-500">
              相关文章功能开发中...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
