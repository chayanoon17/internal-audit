import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProfileCard } from "@/components/features/profile/ProfileCard"
import { ProfileForm } from "@/components/features/profile/ProfileForm"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      departmentId: true,
      department: { select: { id: true, name: true, code: true } },
      createdAt: true,
    },
  })

  if (!user) redirect("/login")

  const serializedUser = {
    ...user,
    createdAt: user.createdAt.toISOString(),
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">โปรไฟล์</h1>
      <ProfileCard user={serializedUser} />
      <ProfileForm user={{ name: user.name, departmentId: user.departmentId }} />
    </div>
  )
}
