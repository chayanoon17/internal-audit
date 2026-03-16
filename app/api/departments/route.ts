import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    })

    return NextResponse.json(departments)
  } catch {
    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลสังกัดได้" },
      { status: 500 }
    )
  }
}
