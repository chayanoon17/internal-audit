import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { createAuditSchema } from "@/lib/validations/audit"

export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const audits = await prisma.audit.findMany({
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(audits)
  } catch (err) {
    console.error("[GET /api/audits]", err)
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createAuditSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const audit = await prisma.audit.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        status: parsed.data.status ?? "draft",
        userId: session.user.id,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(audit, { status: 201 })
  } catch (err) {
    console.error("[POST /api/audits]", err)
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
