import Link from 'next/link'
import { formatDate, truncateText } from '@/lib/utils'
import { Post } from '@/types'

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span>{formatDate(post.createdAt)}</span>
        {post.category && (
          <>
            <span>•</span>
            <Link 
              href={`/blog/category/${post.category.slug}`}
              className="hover:text-blue-600"
            >
              {post.category.name}
            </Link>
          </>
        )}
        <span>•</span>
        <span>{post.viewCount} 次浏览</span>
      </div>

      <h2 className="text-xl font-semibold mb-2">
        <Link 
          href={`/blog/${post.slug}`}
          className="text-gray-900 hover:text-blue-600 transition-colors"
        >
          {post.title}
        </Link>
      </h2>

      {post.excerpt && (
        <p className="text-gray-600 mb-4 line-clamp-2">
          {truncateText(post.excerpt, 120)}
        </p>
      )}

      {post.coverImage && (
        <div className="mb-4">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-48 object-cover rounded-md"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {post.author?.avatar && (
            <img 
              src={post.author.avatar} 
              alt={post.author.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-sm text-gray-600">{post.author?.name}</span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {post._count && (
            <>
              <span>{post._count.comments} 评论</span>
              <span>{post._count.postLikes} 点赞</span>
            </>
          )}
        </div>
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map(tag => (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
