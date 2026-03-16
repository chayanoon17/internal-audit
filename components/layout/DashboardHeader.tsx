import { auth } from "@/auth"
import { UserNav } from "./UserNav"

export async function DashboardHeader() {
  const session = await auth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <a href="/" className="text-base font-semibold text-foreground">
          Audit-internal
        </a>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          <a
            href="/board"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            กระดานงาน
          </a>
          <a
            href="/profile"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            โปรไฟล์
          </a>
        </nav>
      </div>

      {session?.user && (
        <UserNav
          user={{
            name: session.user.name,
            email: session.user.email,
            role: session.user.role,
            departmentName: session.user.departmentName,
          }}
        />
      )}
    </header>
  )
}
