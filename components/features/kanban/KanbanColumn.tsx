"use client"

import { useMemo } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KanbanColumnConfig, KanbanItem } from "@/types/kanban"
import { SortableKanbanCard } from "./SortableKanbanCard"

interface KanbanColumnProps {
  column: KanbanColumnConfig
  items: KanbanItem[]
  className?: string
  onCardClick?: (item: KanbanItem) => void
  onAddCard?: (columnId: string) => void
}

export function KanbanColumn({
  column,
  items,
  className,
  onCardClick,
  onAddCard,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  })

  const itemIds = useMemo(() => items.map((item) => item.id), [items])

  return (
    <div
      className={cn(
        "flex w-[300px] min-w-[300px] flex-col rounded-xl transition-colors duration-200",
        column.color,
        isOver && "ring-2 ring-primary/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className={cn("size-2.5 rounded-full", column.dotColor)} />
          <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground/5 px-1.5 text-xs font-medium text-muted-foreground">
            {items.length}
          </span>
        </div>
        {onAddCard && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onAddCard(column.id)}
            className="text-muted-foreground"
          >
            <Plus className="size-4" />
          </Button>
        )}
      </div>

      {/* Cards - droppable + sortable zone */}
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-1 flex-col gap-2 overflow-y-auto p-2 pt-0",
            "min-h-[80px]",
          )}
        >
          {items.map((item) => (
            <SortableKanbanCard key={item.id} item={item} onClick={onCardClick} />
          ))}

          {items.length === 0 && (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-muted-foreground transition-colors",
                isOver ? "border-primary/40 bg-primary/5" : "border-foreground/10"
              )}
            >
              <p className="text-xs">
                {isOver ? "วางที่นี่" : "ยังไม่มีรายการ"}
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
