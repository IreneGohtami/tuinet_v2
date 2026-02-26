
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserPermissions, hasPermission, getModulePermissions, canAccessAdmin } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/server'
import { syncUserMetadata } from '@/lib/sync-user'

vi.mock('@/lib/supabase/server')
vi.mock('@/lib/sync-user')

describe('RBAC Utility', () => {
  const mockUser = {
    id: 'user-123',
    app_metadata: {
      permissions: [
        { module: 'users', action: 'read' },
        { module: 'users', action: 'create' },
      ],
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserPermissions', () => {
    it('should return permissions from app_metadata if present', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const permissions = await getUserPermissions()
      expect(permissions).toEqual(mockUser.app_metadata.permissions)
      expect(syncUserMetadata).not.toHaveBeenCalled()
    })

    it('should sync and return permissions if not in app_metadata', async () => {
      const userWithoutPerms = { id: 'user-456', app_metadata: {} }
      const userWithPerms = {
        id: 'user-456',
        app_metadata: { permissions: [{ module: 'bookings', action: 'read' }] }
      }

      const mockSupabase = {
        auth: {
          getUser: vi.fn()
            .mockResolvedValueOnce({ data: { user: userWithoutPerms } })
            .mockResolvedValueOnce({ data: { user: userWithPerms } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)
      vi.mocked(syncUserMetadata).mockResolvedValue({ success: true } as unknown as { success: boolean })

      const permissions = await getUserPermissions()
      expect(syncUserMetadata).toHaveBeenCalledWith('user-456')
      expect(permissions).toEqual(userWithPerms.app_metadata.permissions)
    })

    it('should return empty array if no user', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const permissions = await getUserPermissions()
      expect(permissions).toEqual([])
    })
  })

  describe('hasPermission', () => {
    it('should return true if user has permission', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await hasPermission('users', 'read')
      expect(result).toBe(true)
    })

    it('should return false if user does not have permission', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await hasPermission('users', 'delete')
      expect(result).toBe(false)
    })
  })

  describe('getModulePermissions', () => {
    it('should return correct permissions for a module', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await getModulePermissions('users')
      expect(result).toEqual({
        canRead: true,
        canCreate: true,
        canUpdate: false,
        canDelete: false,
      })
    })

    it('should return all false for unknown module', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await getModulePermissions('settings')
      expect(result).toEqual({
        canRead: false,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      })
    })
  })

  describe('canAccessAdmin', () => {
    it('should return true if user has any administrative permission', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await canAccessAdmin()
      expect(result).toBe(true)
    })

    it('should return false if user has no permissions', async () => {
      const userWithoutPerms = { id: 'user-789', app_metadata: { permissions: [] } }
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: userWithoutPerms } }),
        },
      }
      vi.mocked(createClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createClient>>)

      const result = await canAccessAdmin()
      expect(result).toBe(false)
    })
  })
})
