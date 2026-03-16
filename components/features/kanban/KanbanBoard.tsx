"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { LayoutGrid, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { KanbanColumnConfig, KanbanItem, KanbanStatus } from "@/types/kanban"
import { KanbanColumn } from "./KanbanColumn"
import { KanbanCard } from "./KanbanCard"

interface KanbanBoardProps {
  columns: KanbanColumnConfig[]
  items: KanbanItem[]
  className?: string
  title?: string
  onCardClick?: (item: KanbanItem) => void
  onAddCard?: (columnId: string) => void
  onMoveCard?: (itemId: string, newStatus: KanbanStatus) => void
}

export function KanbanBoard({
  columns,
  items,
  className,
  title = "กระดานงาน",
  onCardClick,
  onAddCard,
  onMoveCard,
}: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null)
  const [localItems, setLocalItems] = useState(items)

  useEffect(() => {
    setLocalItems(items)
  }, [items])

  const itemsByColumn = useMemo(() => {
    const map: Record<string, KanbanItem[]> = {}
    for (const col of columns) {
      map[col.id] = localItems.filter((item) => item.status === col.id)
    }
    return map
  }, [columns, localItems])

  const totalItems = localItems.length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const findColumnOfItem = useCallback(
    (itemId: string): KanbanStatus | null => {
      const item = localItems.find((i) => i.id === itemId)
      return item?.status ?? null
    },
    [localItems]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const item = localItems.find((i) => i.id === active.id)
      if (item) setActiveItem(item)
    },
    [localItems]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = String(active.id)
      const overId = String(over.id)

      const activeColumn = findColumnOfItem(activeId)
      const isOverColumn = columns.some((c) => c.id === overId)
      const overColumn = isOverColumn ? overId : findColumnOfItem(overId)

      if (!activeColumn || !overColumn || activeColumn === overColumn) return

      setLocalItems((prev) =>
        prev.map((item) =>
          item.id === activeId ? { ...item, status: overColumn as KanbanStatus } : item
        )
      )
    },
    [columns, findColumnOfItem]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveItem(null)

      if (!over) return

      const activeId = String(active.id)
      const overId = String(over.id)

      const isOverColumn = columns.some((c) => c.id === overId)
      const targetColumn = isOverColumn ? overId : findColumnOfItem(overId)
      if (!targetColumn) return

      setLocalItems((prev) => {
        const itemsInTarget = prev.filter(
          (i) => i.status === targetColumn && i.id !== activeId
        )
        const activeItem = prev.find((i) => i.id === activeId)
        if (!activeItem) return prev

        let newIndex = itemsInTarget.length
        if (!isOverColumn) {
          const overIndex = itemsInTarget.findIndex((i) => i.id === overId)
          if (overIndex >= 0) newIndex = overIndex
        }

        const withoutActive = prev.filter((i) => i.id !== activeId)
        const updatedActive = { ...activeItem, status: targetColumn as KanbanStatus }

        const beforeTarget = withoutActive.filter((i) => i.status !== targetColumn)
        const inTarget = withoutActive.filter((i) => i.status === targetColumn)
        inTarget.splice(newIndex, 0, updatedActive)

        return [...beforeTarget, ...inTarget]
      })

      onMoveCard?.(activeId, targetColumn as KanbanStatus)
    },
    [columns, findColumnOfItem, onMoveCard]
  )

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 p-2">
            <LayoutGrid className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <p className="text-xs text-muted-foreground">
              ทั้งหมด {totalItems} รายการ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Search className="size-3.5" />
            ค้นหา
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="size-3.5" />
            กรอง
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-1 gap-4 overflow-x-auto bg-muted/30 p-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              items={itemsByColumn[column.id] ?? []}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeItem && (
            <div className="rotate-3">
              <KanbanCard item={activeItem} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
