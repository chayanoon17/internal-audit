import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .email("รูปแบบ Email ไม่ถูกต้อง"),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน"),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "กรุณากรอกชื่อ")
    .max(100, "ชื่อยาวเกินไป"),
  email: z
    .string()
    .min(1, "กรุณากรอก Email")
    .email("รูปแบบ Email ไม่ถูกต้อง"),
  password: z
    .string()
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
    .max(100, "รหัสผ่านยาวเกินไป"),
  departmentId: z
    .string()
    .optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
