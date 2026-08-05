import { prisma } from "../utils/prisma.js";

async function dbConfig() {
    await prisma.$connect();
    console.log("Connected to the database successfully.");
    await prisma.$disconnect();
}

export default dbConfig;