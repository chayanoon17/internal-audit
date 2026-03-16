"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard } from "./KanbanCard"
import type { KanbanItem } from "@/types/kanban"

interface SortableKanbanCardProps {
  item: KanbanItem
  onClick?: (item: KanbanItem) => void
}

export function SortableKanbanCard({ item, onClick }: SortableKanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, data: { type: "card", item } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard
        item={item}
        isDragging={isDragging}
        onClick={isDragging ? undefined : onClick}
      />
    </div>
  )
}
