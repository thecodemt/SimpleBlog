import "dotenv/config";

const config = {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
};

export default config;