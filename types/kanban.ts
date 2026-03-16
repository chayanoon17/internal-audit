/**
 * Kanban / Board types
 * ใช้กับ Trello-style drag-and-drop board
 */

export type KanbanStatus = "draft" | "in_progress" | "review" | "done"

export interface KanbanColumnConfig {
  id: KanbanStatus
  title: string
  color: string
  dotColor: string
}

export type KanbanPriority = "low" | "medium" | "high"

export interface KanbanItem {
  id: string
  title: string
  description?: string
  status: KanbanStatus
  priority?: KanbanPriority
  assignee?: {
    name: string
    avatarUrl?: string
    initials: string
  }
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export const DEFAULT_KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: "draft", title: "ร่าง", color: "bg-slate-50 dark:bg-slate-900/30", dotColor: "bg-slate-400" },
  { id: "in_progress", title: "กำลังทำ", color: "bg-amber-50/60 dark:bg-amber-900/10", dotColor: "bg-amber-400" },
  { id: "review", title: "รอตรวจ", color: "bg-blue-50/60 dark:bg-blue-900/10", dotColor: "bg-blue-400" },
  { id: "done", title: "เสร็จแล้ว", color: "bg-emerald-50/60 dark:bg-emerald-900/10", dotColor: "bg-emerald-400" },
]
