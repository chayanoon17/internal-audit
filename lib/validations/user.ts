import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .max(100, "ชื่อยาวเกินไป")
    .optional(),
  departmentId: z
    .string()
    .nullable()
    .optional(),
  image: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .nullable()
    .optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
