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

    if (existingAdmin) {
      console.log('管理员用户已存在:', existingAdmin.email);
      return;
    }

    // 哈希密码
    const plainPassword = 'admin123456';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // 创建管理员用户
    const adminUser = await prisma.user.create({
      data: {
        name: "Administrator",
        email: "admin@simpleblog.com",
        password: hashedPassword,
        role: "admin",
        isActive: true
      }
    });

    console.log('管理员用户创建成功:');
    console.log('ID:', adminUser.id);
    console.log('姓名:', adminUser.name);
    console.log('邮箱:', adminUser.email);
    console.log('角色:', adminUser.role);
    console.log('创建时间:', adminUser.createdAt);
    console.log('');
    console.log('登录信息:');
    console.log('邮箱:', "admin@simpleblog.com");
    console.log('密码:', plainPassword);
    console.log('');
    console.log('⚠️  请在生产环境中修改默认密码！');

  } catch (error) {
    console.error('创建管理员用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();