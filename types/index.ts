/**
 * Shared TypeScript types
 * ใช้ร่วมกันทั้ง frontend และ backend
 */

export type {
  KanbanStatus,
  KanbanColumnConfig,
  KanbanItem,
  KanbanPriority,
} from "./kanban"
export { DEFAULT_KANBAN_COLUMNS } from "./kanban"

// ตัวอย่าง - ปรับตาม Prisma schema
// export type AuditStatus = "draft" | "pending" | "completed"
// export interface Audit {
//   id: string
//   title: string
//   status: AuditStatus
//   createdAt: Date
//   updatedAt: Date
// }
