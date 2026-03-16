# โครงสร้างโปรเจกต์ Demo Audit

เอกสารนี้อธิบายโครงสร้างโปรเจกต์แบบมืออาชีพสำหรับการพัฒนาแอป Audit-internal

## โครงสร้างโฟลเดอร์

```
demo-audit/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Route group: หน้า login, register
│   ├── (dashboard)/          # Route group: หน้าหลักหลัง login
│   ├── api/                  # API Routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── features/              # Components ตาม feature (audit, report, etc.)
│   ├── layout/                # Header, Sidebar, Footer
│   └── shared/                # Components ใช้ร่วมกันหลายที่
│
├── lib/                       # Utilities & config
│   ├── db.ts                  # Prisma client singleton
│   ├── utils.ts               # cn(), helpers
│   └── validations/           # Zod schemas
│
├── hooks/                     # Custom React hooks
├── services/                  # Business logic, API calls
├── types/                     # TypeScript types/interfaces
├── constants/                 # ค่าคงที่ของแอป
│
├── prisma/
│   └── schema.prisma         # Database schema
│
└── public/                    # Static assets
```

## กฎการเขียนโค้ด

### 1. การตั้งชื่อไฟล์
- **Components**: PascalCase (`AuditCard.tsx`)
- **Hooks**: camelCase ขึ้นต้นด้วย `use` (`useAuditList.ts`)
- **Utils/Services**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Audit.ts`)

### 2. โครงสร้าง Component
```tsx
// 1. Imports (external → internal → types)
import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Audit } from "@/types"

// 2. Types/Interfaces
interface AuditCardProps {
  audit: Audit
}

// 3. Component
export function AuditCard({ audit }: AuditCardProps) {
  // hooks → state → derived → effects → handlers → render
  return <div>...</div>
}
```

### 3. การ Import
- ใช้ path alias `@/` เสมอ
- เรียง: React → libraries → components → lib → types

### 4. Services Layer
- เก็บ business logic แยกจาก components
- ใช้ใน Server Components หรือ API routes
- ตัวอย่าง: `services/audit.service.ts`

### 5. Types
- เก็บ types กลางที่ `types/`
- ใช้ Prisma types: `import type { Audit } from "@prisma/client"`

## สถานะปัจจุบัน

| โฟลเดอร์ | สถานะ |
|----------|--------|
| app/ | ✅ มี layout, page |
| components/ui | ✅ มี Button (shadcn) |
| lib/ | ✅ มี utils |
| prisma/ | 🔲 ต้องสร้าง schema |
| services/ | 🔲 พร้อมใช้งาน |
| hooks/ | 🔲 พร้อมใช้งาน |
| types/ | 🔲 พร้อมใช้งาน |
| constants/ | 🔲 พร้อมใช้งาน |
