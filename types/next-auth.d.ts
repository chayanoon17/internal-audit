import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role: string
      departmentId: string | null
      departmentName: string | null
    }
  }
}
