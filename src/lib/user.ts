import { prisma } from '@/lib/prisma'
import { MembershipType } from "@prisma/client"

export async function getUserMembership(email: string): Promise<MembershipType | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { membershipType: true }
  })

  return user?.membershipType || null
}