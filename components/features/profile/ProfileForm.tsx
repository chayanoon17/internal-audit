"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
}

interface ProfileFormProps {
  user: {
    name: string
    departmentId?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentId, setDepartmentId] = useState<string>(user.departmentId ?? "")

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data)
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        departmentId: departmentId || null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || "เกิดข้อผิดพลาด")
      return
    }

    setSuccess(true)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>แก้ไขข้อมูล</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600">
              บันทึกเรียบร้อยแล้ว
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="profile-name">ชื่อ-นามสกุล</Label>
            <Input
              id="profile-name"
              name="name"
              defaultValue={user.name}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-department">สังกัด</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} disabled={loading}>
              <SelectTrigger id="profile-department">
                <SelectValue placeholder="เลือกสังกัด" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="size-4" />
                บันทึก
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
