const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis; // Use global object to prevent reinitialization

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

module.exports = prisma;
