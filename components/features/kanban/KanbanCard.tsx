"use client"

import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Flag } from "lucide-react"
import type { KanbanItem, KanbanPriority } from "@/types/kanban"

interface KanbanCardProps {
  item: KanbanItem
  isDragging?: boolean
  className?: string
  onClick?: (item: KanbanItem) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

const priorityConfig: Record<KanbanPriority, { label: string; className: string }> = {
  low: { label: "ต่ำ", className: "text-slate-500" },
  medium: { label: "ปานกลาง", className: "text-amber-500" },
  high: { label: "สูง", className: "text-rose-500" },
}

export function KanbanCard({
  item,
  isDragging = false,
  className,
  onClick,
  dragHandleProps,
}: KanbanCardProps) {
  const priority = item.priority ? priorityConfig[item.priority] : null

  return (
    <Card
      size="sm"
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(item)}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(item)}
      className={cn(
        "cursor-pointer gap-2.5 transition-all duration-150",
        "hover:ring-foreground/20 hover:shadow-md",
        "active:scale-[0.98]",
        isDragging && "rotate-2 scale-105 opacity-80 shadow-xl",
        className
      )}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute top-2 right-2 cursor-grab text-muted-foreground active:cursor-grabbing"
          aria-label="ลากเพื่อย้าย"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
      )}

      <div className="px-3">
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-4 font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <p className="font-medium text-sm leading-snug text-foreground">{item.title}</p>

        {item.description && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          {priority && (
            <div className={cn("flex items-center gap-0.5", priority.className)}>
              <Flag className="size-3" />
              <span className="text-[10px]">{priority.label}</span>
            </div>
          )}
          {item.createdAt && (
            <div className="flex items-center gap-0.5 text-[10px]">
              <Calendar className="size-3" />
              <span>
                {item.createdAt.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
              </span>
            </div>
          )}
        </div>

        {item.assignee && (
          <Avatar size="sm">
            {item.assignee.avatarUrl && (
              <AvatarImage src={item.assignee.avatarUrl} alt={item.assignee.name} />
            )}
            <AvatarFallback>{item.assignee.initials}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </Card>
  )
}
