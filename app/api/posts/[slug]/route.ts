import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ApiResponse, Post } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const post = await prisma.post.findUnique({
      where: {
        slug,
        published: true,
        deletedAt: null
      },
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
      }
    })

    if (!post) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '文章不存在'
        }
      }
      return NextResponse.json(response, { status: 404 })
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } }
    })

    const response: ApiResponse<Post> = {
      success: true,
      data: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('获取文章详情失败:', error)
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '获取文章详情失败'
      }
    }

    return NextResponse.json(response, { status: 500 })
  }
}
