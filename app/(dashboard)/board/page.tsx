import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { BoardClient } from "./BoardClient"
import type { KanbanItem, KanbanStatus } from "@/types/kanban"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
}

export default async function BoardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const audits = await prisma.audit.findMany({
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const items: KanbanItem[] = audits.map((audit) => ({
    id: audit.id,
    title: audit.title,
    description: audit.description ?? undefined,
    status: audit.status as KanbanStatus,
    assignee: audit.user
      ? {
          name: audit.user.name,
          initials: getInitials(audit.user.name),
          avatarUrl: audit.user.image ?? undefined,
        }
      : undefined,
    createdAt: audit.createdAt,
  }))

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-background font-sans">
      <BoardClient initialItems={items} />
    </div>
  )
}
