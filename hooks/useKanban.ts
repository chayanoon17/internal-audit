"use client"

import { useMemo } from "react"
import type { KanbanColumnConfig, KanbanItem, KanbanStatus } from "@/types/kanban"

interface UseKanbanOptions {
  columns: KanbanColumnConfig[]
  items: KanbanItem[]
}

/**
 * จัดกลุ่ม items ตาม column (status)
 * ใช้ก่อนส่งไป KanbanBoard
 */
export function useKanban({ columns, items }: UseKanbanOptions) {
  const itemsByColumn = useMemo(() => {
    const map: Record<string, KanbanItem[]> = {}
    for (const col of columns) {
      map[col.id] = items.filter((item) => item.status === col.id)
    }
    return map
  }, [columns, items])

  return { itemsByColumn }
}

/**
 * แปลง status string เป็น KanbanStatus
 * ใช้เมื่อดึงข้อมูลจาก Prisma (status เป็น string)
 */
export function toKanbanStatus(status: string): KanbanStatus {
  const valid: KanbanStatus[] = ["draft", "in_progress", "review", "done"]
  return valid.includes(status as KanbanStatus) ? (status as KanbanStatus) : "draft"
}
