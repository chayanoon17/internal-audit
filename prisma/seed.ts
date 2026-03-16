import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { hashSync } from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})
const prisma = new PrismaClient({ adapter })

const departments = [
  { name: "ฝ่ายตรวจสอบภายใน", code: "IA" },
  { name: "ฝ่ายบัญชีและการเงิน", code: "FIN" },
  { name: "ฝ่ายบริหารความเสี่ยง", code: "RISK" },
  { name: "ฝ่ายเทคโนโลยีสารสนเทศ", code: "IT" },
]

async function main() {
  console.log("Seeding database...")

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    })
  }
  console.log(`Created ${departments.length} departments`)

  const iaDept = await prisma.department.findUnique({ where: { code: "IA" } })

  await prisma.user.upsert({
    where: { email: "admin@audit.com" },
    update: {},
    create: {
      email: "admin@audit.com",
      name: "Admin",
      password: hashSync("admin1234", 10),
      role: "ADMIN",
      departmentId: iaDept?.id,
    },
  })
  console.log("Created admin user (admin@audit.com / admin1234)")

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
