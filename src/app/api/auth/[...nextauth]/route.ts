import NextAuth from "next-auth"
import { workingAuthOptions } from "@/lib/auth-working"

const handler = NextAuth(workingAuthOptions)

export { handler as GET, handler as POST }
