"use client"

import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"

interface UserNavProps {
  user: {
    name: string
    email: string
    role: string
    departmentName?: string | null
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

export function UserNav({ user }: UserNavProps) {
  return (
    <div className="flex items-center gap-3">
      <a href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted">
        <Avatar size="sm">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs text-muted-foreground">
            {user.departmentName ?? user.email}
          </p>
        </div>
      </a>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="ออกจากระบบ"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
