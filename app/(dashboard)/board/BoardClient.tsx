"use client"

import { useCallback, useState } from "react"
import { KanbanBoard } from "@/components/features/kanban"
import { AuditFormDialog, type AuditFormData } from "@/components/features/kanban/AuditFormDialog"
import { DEFAULT_KANBAN_COLUMNS } from "@/types"
import type { KanbanItem, KanbanStatus } from "@/types/kanban"

interface BoardClientProps {
  initialItems: KanbanItem[]
}

export function BoardClient({ initialItems }: BoardClientProps) {
  const [items, setItems] = useState(initialItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [dialogDefaultStatus, setDialogDefaultStatus] = useState<KanbanStatus>("draft")
  const [editingItem, setEditingItem] = useState<AuditFormData | undefined>()

  const handleAddCard = useCallback((columnId: string) => {
    setDialogMode("create")
    setDialogDefaultStatus(columnId as KanbanStatus)
    setEditingItem(undefined)
    setDialogOpen(true)
  }, [])

  const handleCardClick = useCallback((item: KanbanItem) => {
    setDialogMode("edit")
    setEditingItem({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
    })
    setDialogOpen(true)
  }, [])

  const handleSubmit = useCallback(async (data: AuditFormData) => {
    if (data.id) {
      const res = await fetch(`/api/audits/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === data.id
              ? {
                  ...item,
                  title: json.title,
                  description: json.description ?? undefined,
                  status: json.status as KanbanStatus,
                }
              : item
          )
        )
      } else {
        throw new Error(json.error ?? "เกิดข้อผิดพลาด")
      }
    } else {
      const res = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        const newItem: KanbanItem = {
          id: json.id,
          title: json.title,
          description: json.description ?? undefined,
          status: json.status as KanbanStatus,
          assignee: json.user
            ? {
                name: json.user.name,
                initials: json.user.name
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2),
              }
            : undefined,
          createdAt: new Date(json.createdAt),
        }
        setItems((prev) => [newItem, ...prev])
      } else {
        throw new Error(json.error ?? "เกิดข้อผิดพลาด")
      }
    }
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/audits/${id}`, { method: "DELETE" })
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    }
  }, [])

  const handleMoveCard = useCallback(
    async (itemId: string, newStatus: KanbanStatus) => {
      await fetch(`/api/audits/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
    },
    []
  )

  return (
    <>
      <KanbanBoard
        columns={DEFAULT_KANBAN_COLUMNS}
        items={items}
        title="Audit Board"
        onCardClick={handleCardClick}
        onAddCard={handleAddCard}
        onMoveCard={handleMoveCard}
      />

      <AuditFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        defaultStatus={dialogDefaultStatus}
        initialData={editingItem}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  )
}
