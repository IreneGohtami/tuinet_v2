
'use client'

import { DeleteUserDialog } from './delete-user-dialog'
import { EditUserDialog } from './edit-user-dialog'
import { ResetPasswordDialog } from './reset-password-dialog'
import { ToggleUserStatusDialog } from './toggle-user-status-dialog'

interface UserActionsProps {
  user: {
    id: string
    full_name: string
    email: string
    role: string
    is_banned?: boolean | null
  },
  roles: { id: string; name: string }[],
  permissions: { canUpdate: boolean; canDelete: boolean }
}

export function UserActions({ user, roles, permissions }: UserActionsProps) {
  if (!permissions.canUpdate && !permissions.canDelete) return null

  return (
    <div className="flex justify-end gap-2 items-center">
      {permissions.canUpdate && (
        <>
          <ResetPasswordDialog userId={user.id} email={user.email} />

          <ToggleUserStatusDialog
            userId={user.id}
            isBanned={!!user.is_banned}
            userName={user.full_name || user.email}
          />

          <EditUserDialog user={user} roles={roles} />
        </>
      )}
      {permissions.canDelete && (
        <DeleteUserDialog userId={user?.id} userName={user?.full_name || user?.email} />
      )}
    </div>
  )
}
