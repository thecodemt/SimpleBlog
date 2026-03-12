// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

// 分页类型
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 文章类型
export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  coverImage?: string | null
  published: boolean
  publishedAt?: Date | null
  viewCount: number
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  authorId: string
  categoryId?: string | null
  author?: {
    id: string
    name: string
    email: string
    avatar?: string | null
  }
  category?: {
    id: string
    name: string
    slug: string
  } | null
  tags?: {
    id: string
    name: string
    slug: string
  }[]
  _count?: {
    comments: number
    postLikes: number
  }
}
