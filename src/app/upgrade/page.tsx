import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import UpgradeClient from './UpgradeClient'

export default function UpgradePage() {
  return (
    <AuthenticatedLayout>
      <UpgradeClient />
    </AuthenticatedLayout>
  )
}