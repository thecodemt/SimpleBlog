import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  try {
    // 检查管理员用户是否已存在
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@simpleblog.com" }
    });

    let adminUser;
    if (!existingAdmin) {
      // 哈希密码
      const plainPassword = 'admin123456';
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      // 创建管理员用户
      adminUser = await prisma.user.create({
        data: {
          name: "Administrator",
          email: "admin@simpleblog.com",
          password: hashedPassword,
          role: "admin",
          isActive: true
        }
      });

      console.log('管理员用户创建成功:', adminUser.email);
    } else {
      adminUser = existingAdmin;
      console.log('管理员用户已存在:', adminUser.email);
    }

    // 创建分类
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'tech' },
        update: {},
        create: {
          name: '技术',
          slug: 'tech',
          description: '技术相关文章'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'life' },
        update: {},
        create: {
          name: '生活',
          slug: 'life',
          description: '生活感悟'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'tutorial' },
        update: {},
        create: {
          name: '教程',
          slug: 'tutorial',
          description: '教程和指南'
        }
      })
    ]);

    // 创建标签
    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { slug: 'nextjs' },
        update: {},
        create: {
          name: 'Next.js',
          slug: 'nextjs'
        }
      }),
      prisma.tag.upsert({
        where: { slug: 'react' },
        update: {},
        create: {
          name: 'React',
          slug: 'react'
        }
      }),
      prisma.tag.upsert({
        where: { slug: 'typescript' },
        update: {},
        create: {
          name: 'TypeScript',
          slug: 'typescript'
        }
      }),
      prisma.tag.upsert({
        where: { slug: 'prisma' },
        update: {},
        create: {
          name: 'Prisma',
          slug: 'prisma'
        }
      })
    ]);

    // 创建示例文章
    const posts = [
      {
        title: "Next.js 16 新特性详解",
        slug: "nextjs-16-new-features",
        content: `# Next.js 16 新特性详解

Next.js 16 带来了许多激动人心的新特性，让我们一起来看看这些改进如何提升开发体验。

## 主要特性

### 1. 改进的 App Router
- 更好的性能
- 更直观的 API
- 更强的类型安全

### 2. React 19 支持
- 最新的 React 特性
- 更好的并发渲染
- 改进的 Suspense

### 3. 性能优化
- 更快的构建速度
- 更小的包体积
- 更好的缓存策略

这些改进让 Next.js 成为了构建现代 Web 应用的最佳选择。`,
        excerpt: "深入了解 Next.js 16 带来的新特性和改进，包括 App Router、React 19 支持等。",
        published: true,
        publishedAt: new Date(),
        viewCount: 156,
        categoryId: categories[0].id,
        tagIds: [tags[0].id, tags[1].id]
      },
      {
        title: "TypeScript 最佳实践指南",
        slug: "typescript-best-practices",
        content: `# TypeScript 最佳实践指南

TypeScript 为 JavaScript 带来了类型安全，但如何正确使用它呢？

## 基础配置

### 1. 严格的 tsconfig.json
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
\`\`\`

### 2. 类型定义
- 使用 interface 定义对象类型
- 使用 type 定义联合类型
- 避免使用 any

## 高级技巧

### 1. 泛型的正确使用
### 2. 工具类型的妙用
### 3. 条件类型的威力

掌握这些技巧，让你的 TypeScript 代码更加健壮。`,
        excerpt: "学习 TypeScript 的最佳实践，提升代码质量和开发效率。",
        published: true,
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        viewCount: 89,
        categoryId: categories[2].id,
        tagIds: [tags[2].id]
      },
      {
        title: "Prisma ORM 入门教程",
        slug: "prisma-orm-tutorial",
        content: `# Prisma ORM 入门教程

Prisma 是一个现代化的数据库工具包，让数据库操作变得简单而类型安全。

## 什么是 Prisma？

Prisma 包含三个主要部分：
- Prisma Client: 类型安全的数据库客户端
- Prisma Migrate: 数据库迁移工具
- Prisma Studio: 数据库管理界面

## 快速开始

### 1. 安装 Prisma
\`\`\`bash
npm install prisma @prisma/client
\`\`\`

### 2. 初始化项目
\`\`\`bash
npx prisma init
\`\`\`

### 3. 定义数据模型
在 schema.prisma 中定义你的数据模型。

### 4. 生成客户端
\`\`\`bash
npx prisma generate
\`\`\`

## 核心概念

- 数据模型定义
- 数据库关系
- 查询和操作
- 迁移管理

通过 Prisma，你可以专注于业务逻辑，而不是复杂的 SQL 查询。`,
        excerpt: "从零开始学习 Prisma ORM，掌握现代化的数据库操作方式。",
        published: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        viewCount: 234,
        categoryId: categories[2].id,
        tagIds: [tags[3].id, tags[2].id]
      }
    ];

    for (const postData of posts) {
      const { tagIds, ...postWithoutTags } = postData;
      
      const existingPost = await prisma.post.findUnique({
        where: { slug: postData.slug }
      });

      if (!existingPost) {
        const post = await prisma.post.create({
          data: {
            ...postWithoutTags,
            authorId: adminUser.id,
            tags: tagIds ? {
              create: tagIds.map(tagId => ({
                tagId
              }))
            } : undefined
          }
        });

        console.log('文章创建成功:', post.title);
      } else {
        console.log('文章已存在:', existingPost.title);
      }
    }

    console.log('\n✅ 种子数据创建完成！');
    console.log('📧 管理员账号: admin@simpleblog.com');
    console.log('🔑 管理员密码: admin123456');

  } catch (error) {
    console.error('创建种子数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();