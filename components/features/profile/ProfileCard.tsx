"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Building2, Mail, Shield, Calendar } from "lucide-react"

interface ProfileCardProps {
  user: {
    name: string
    email: string
    role: string
    image?: string | null
    department?: { name: string; code: string } | null
    createdAt?: string
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลโปรไฟล์</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar size="lg">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="mt-1">
              {user.role === "ADMIN" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-4 text-muted-foreground" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Shield className="size-4 text-muted-foreground" />
            <span>{user.role === "ADMIN" ? "Admin" : "User"}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Building2 className="size-4 text-muted-foreground" />
            <span>
              {user.department
                ? `${user.department.name} (${user.department.code})`
                : "ไม่ได้ระบุสังกัด"}
            </span>
          </div>

          {user.createdAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span>
                สมาชิกตั้งแต่{" "}
                {new Date(user.createdAt).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
