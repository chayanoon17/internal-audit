import { z } from "zod"

const VALID_STATUSES = ["draft", "in_progress", "review", "done"] as const

export const createAuditSchema = z.object({
  title: z
    .string()
    .min(1, "กรุณากรอกชื่อรายการ")
    .max(200, "ชื่อรายการยาวเกินไป"),
  description: z
    .string()
    .max(1000, "รายละเอียดยาวเกินไป")
    .optional(),
  status: z
    .enum(VALID_STATUSES)
    .default("draft"),
})

export const updateAuditSchema = createAuditSchema.partial()

export type CreateAuditInput = z.infer<typeof createAuditSchema>
export type UpdateAuditInput = z.infer<typeof updateAuditSchema>
