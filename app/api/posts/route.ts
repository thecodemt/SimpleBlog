import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse, Post, Pagination } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const published = searchParams.get('published') !== 'false'
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    const skip = (page - 1) * limit

    // 构建查询条件
    const where: any = {
      published,
      deletedAt: null
    }

    if (category) {
      where.category = {
        slug: category
      }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            slug: tag
          }
        }
      }
    }

    // 获取文章总数
    const total = await prisma.post.count({ where })

    // 获取文章列表
    const posts = await prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            postLikes: true
          }
        }
      },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    const totalPages = Math.ceil(total / limit)

    const response: ApiResponse<{
      posts: Post[]
      pagination: Pagination
    }> = {
      success: true,
      data: {
        posts: posts.map(post => ({
          ...post,
          tags: post.tags.map(pt => pt.tag)
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('获取文章列表失败:', error)
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取文章列表失败'
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, excerpt, coverImage, categoryId, tags, published } = body

    // 生成slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        categoryId,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: 'admin-user-id', // 临时硬编码，后续从认证中获取
        tags: tags ? {
          create: tags.map((tagId: string) => ({
            tagId
          }))
        } : undefined
      },
      include: {
        author: true,
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    })

    const response: ApiResponse<Post> = {
      success: true,
      data: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      },
      message: '文章创建成功'
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('创建文章失败:', error)
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '创建文章失败'
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}
