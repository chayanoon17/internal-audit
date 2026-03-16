"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Trash2 } from "lucide-react"
import type { KanbanStatus } from "@/types/kanban"

export interface AuditFormData {
  id?: string
  title: string
  description?: string
  status: KanbanStatus
}

interface AuditFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  defaultStatus?: KanbanStatus
  initialData?: AuditFormData
  onSubmit: (data: AuditFormData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

const STATUS_OPTIONS: { value: KanbanStatus; label: string }[] = [
  { value: "draft", label: "ร่าง" },
  { value: "in_progress", label: "กำลังทำ" },
  { value: "review", label: "รอตรวจ" },
  { value: "done", label: "เสร็จแล้ว" },
]

export function AuditFormDialog({
  open,
  onOpenChange,
  mode,
  defaultStatus = "draft",
  initialData,
  onSubmit,
  onDelete,
}: AuditFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [status, setStatus] = useState<KanbanStatus>(
    initialData?.status ?? defaultStatus
  )

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)

    const formData = new FormData(e.currentTarget)
    try {
      await onSubmit({
        id: initialData?.id,
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        status,
      })
      onOpenChange(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    if (!initialData?.id || !onDelete) return
    setDeleting(true)
    await onDelete(initialData.id)
    setDeleting(false)
    setConfirmDelete(false)
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setConfirmDelete(false)
      setSubmitError(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "เพิ่มรายการใหม่" : "แก้ไขรายการ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "กรอกข้อมูลเพื่อสร้าง Audit ใหม่"
              : "แก้ไขข้อมูล Audit"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="audit-title">ชื่อรายการ</Label>
            <Input
              id="audit-title"
              name="title"
              placeholder="เช่น ตรวจสอบรายงานประจำเดือน"
              defaultValue={initialData?.title ?? ""}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-desc">รายละเอียด (ไม่บังคับ)</Label>
            <Textarea
              id="audit-desc"
              name="description"
              placeholder="รายละเอียดเพิ่มเติม..."
              defaultValue={initialData?.description ?? ""}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audit-status">สถานะ</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as KanbanStatus)} disabled={loading}>
              <SelectTrigger id="audit-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-between">
            {mode === "edit" && onDelete && initialData?.id && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {confirmDelete ? "ยืนยันลบ?" : "ลบ"}
              </Button>
            )}

            <div className="flex gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={loading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : mode === "create" ? (
                  "สร้าง"
                ) : (
                  "บันทึก"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
