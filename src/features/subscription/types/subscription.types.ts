import { MembershipType } from "@prisma/client"

export type UserMembership = {
  type: MembershipType | null
  trialStartDate?: Date | null
  stripeSubscriptionId?: string | null
  stripeCurrentPeriodEnd?: Date | null
  status?: string | null
}

export type MembershipInfo = {
  membershipType: MembershipType | null
  trialStartDate?: string | null
  stripeSubscriptionId?: string | null
  stripeCurrentPeriodEnd?: string | null
  status?: string | null
}

export type PlanCard = {
  name: string
  price: string
  interval: string
  features: string[]
  membershipType: MembershipType
}

export type TrialStatus = {
  daysRemaining: number
  endDate: string
}