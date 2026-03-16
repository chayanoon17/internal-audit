import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { updateAuditSchema } from "@/lib/validations/audit"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = updateAuditSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.audit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 })
    }

    const audit = await prisma.audit.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json(audit)
  } catch (err) {
    console.error("[PATCH /api/audits/[id]]", err)
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.audit.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 })
    }

    await prisma.audit.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /api/audits/[id]]", err)
    const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาด"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
