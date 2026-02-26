
'use client'

import { useState, useEffect, useCallback } from 'react'
import { updateRole, updateRolePermissions } from './actions'
import { Pencil, X, Loader2 } from 'lucide-react'

const MODULES = ['users', 'bookings', 'settings', 'reports']
const ACTIONS = ['create', 'read', 'update', 'delete']

export function EditRoleDialog({ role }: {
  role: { id: string; name: string; description?: string; is_system: boolean }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [permissions, setPermissions] = useState<Set<string>>(new Set())
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [refData, setRefData] = useState<{ airlines: { id: string; code: string }[], regions: { id: string; code: string; name?: string }[], currencies: { id: string; code: string; name?: string }[] }>({ airlines: [], regions: [], currencies: [] })

  const loadPermissions = useCallback(async () => {
    setLoadingPermissions(true)
    const { getRolePermissions, getReferenceData } = await import('./actions')

    const [permResult, refResult] = await Promise.all([
      getRolePermissions(role.id),
      getReferenceData()
    ])

    if (permResult.success && permResult.data) {
      const perms = new Set(
        permResult.data.map((p: { module: string; action: string }) => `${p.module}:${p.action}`)
      )
      setPermissions(perms)
    }

    if (refResult.success && refResult.data) {
      setRefData(refResult.data)
    }

    setLoadingPermissions(false)
  }, [role.id])

  useEffect(() => {
    if (isOpen) {
      loadPermissions()
    }
  }, [isOpen, loadPermissions])

  function togglePermission(module: string, action: string) {
    const key = `${module}:${action}`
    const newPermissions = new Set(permissions)
    if (newPermissions.has(key)) {
      newPermissions.delete(key)
    } else {
      newPermissions.add(key)
    }
    setPermissions(newPermissions)
  }

  function hasPermission(module: string, action: string) {
    return permissions.has(`${module}:${action}`)
  }

  function toggleAllRestriction(type: 'airline' | 'region' | 'currency', checked: boolean) {
    const newPermissions = new Set(permissions)
    const keyPrefix = type === 'currency' ? 'currencies' : `${type}s`
    const items = (refData[keyPrefix as keyof typeof refData] || []) as { id: string; code: string }[]

    items.forEach((item) => {
      const key = `booking_restriction:${type}:${item.code}`
      if (checked) {
        newPermissions.add(key)
      } else {
        newPermissions.delete(key)
      }
    })

    setPermissions(newPermissions)
  }

  function isAllRestrictionSelected(type: 'airline' | 'region' | 'currency') {
    const keyPrefix = type === 'currency' ? 'currencies' : `${type}s`
    const items = (refData[keyPrefix as keyof typeof refData] || []) as { id: string; code: string }[]
    if (items.length === 0) return false
    return items.every((item) => hasPermission('booking_restriction', `${type}:${item.code}`))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    // Update role details
    const roleResult = await updateRole(role.id, {
      name,
      description: description || undefined
    })

    if (!roleResult.success) {
      setIsLoading(false)
      setMessage({ type: 'error', text: roleResult.error || 'Failed to update role' })
      return
    }

    // Update permissions
    const permissionsArray = Array.from(permissions).map((p: string) => {
      const firstColon = p.indexOf(':')
      const moduleName = p.substring(0, firstColon)
      const action = p.substring(firstColon + 1)
      return { module: moduleName, action }
    })

    const permResult = await updateRolePermissions(role.id, permissionsArray)

    setIsLoading(false)
    if (permResult.success) {
      setMessage({ type: 'success', text: 'Role updated successfully' })
      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
      }, 1500)
    } else {
      setMessage({ type: 'error', text: permResult.error || 'Failed to update permissions' })
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Edit Role</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={role.name}
                  required
                  disabled={role.is_system}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                />
                {role.is_system && (
                  <p className="text-xs text-muted-foreground">System roles cannot be renamed</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  defaultValue={role.description || ''}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">Access Permissions</label>
                {loadingPermissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="p-3 text-left font-medium text-muted-foreground">Module</th>
                          {ACTIONS.map(action => (
                            <th key={action} className="p-3 text-center font-medium text-muted-foreground capitalize">
                              {action}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {MODULES.map((module, idx) => (
                          <tr key={module} className={idx % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}>
                            <td className="p-3 font-medium text-foreground capitalize">{module}</td>
                            {ACTIONS.map(action => (
                              <td key={action} className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={hasPermission(module, action)}
                                  onChange={() => togglePermission(module, action)}
                                  className="h-4 w-4 rounded border-input cursor-pointer"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">Booking Restrictions</label>
                <p className="text-xs text-muted-foreground italic">
                  * Users will only see and manage bookings matching these specific values.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-border rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Airlines</h5>
                      <label className="flex items-center ml-2 text-[10px] font-medium cursor-pointer hover:text-foreground transition-colors group">
                        <input
                          type="checkbox"
                          checked={isAllRestrictionSelected('airline')}
                          onChange={(e) => toggleAllRestriction('airline', e.target.checked)}
                          className="h-3 w-3 rounded border-input cursor-pointer"
                        />
                      </label>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {refData.airlines.map((item: { id: string; code: string }) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={hasPermission('booking_restriction', `airline:${item.code}`)}
                            onChange={() => togglePermission('booking_restriction', `airline:${item.code}`)}
                            className="h-4 w-4 rounded border-input cursor-pointer"
                          />
                          <span>{item.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Regions</h5>
                      <label className="flex items-center ml-2 text-[10px] font-medium cursor-pointer hover:text-foreground transition-colors group">
                        <input
                          type="checkbox"
                          checked={isAllRestrictionSelected('region')}
                          onChange={(e) => toggleAllRestriction('region', e.target.checked)}
                          className="h-3 w-3 rounded border-input cursor-pointer"
                        />
                      </label>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {refData.regions.map((item: { id: string; code: string; name?: string }) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={hasPermission('booking_restriction', `region:${item.code}`)}
                            onChange={() => togglePermission('booking_restriction', `region:${item.code}`)}
                            className="h-4 w-4 rounded border-input cursor-pointer"
                          />
                          <span>{item.name || item.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Currencies</h5>
                      <label className="flex items-center ml-2 text-[10px] font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors group">
                        <input
                          type="checkbox"
                          checked={isAllRestrictionSelected('currency')}
                          onChange={(e) => toggleAllRestriction('currency', e.target.checked)}
                          className="h-3 w-3 rounded border-input cursor-pointer"
                        />
                      </label>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {refData.currencies.map((item: { id: string; code: string; name?: string }) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                          <input
                            type="checkbox"
                            checked={hasPermission('booking_restriction', `currency:${item.code}`)}
                            onChange={() => togglePermission('booking_restriction', `currency:${item.code}`)}
                            className="h-4 w-4 rounded border-input cursor-pointer"
                          />
                          <span>{item.name || item.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
