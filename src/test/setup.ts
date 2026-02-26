
import { vi } from 'vitest'

// Mock Supabase clients
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: vi.fn(),
        updateUserById: vi.fn(),
      },
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

vi.mock('./sync-user', () => ({
  syncUserMetadata: vi.fn(),
}))
