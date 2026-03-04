'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { UserActions } from './actions'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string | null
  banned_until: string | null
  is_banned: boolean
}

interface UserTableProps {
  users: User[]
  roles: { id: string; name: string }[]
  permissions: { canCreate: boolean; canUpdate: boolean; canDelete: boolean }
}

type SortColumn = 'full_name' | 'email' | 'role' | 'status'
type SortOrder = 'asc' | 'desc'

function SortIcon({
  column,
  sortColumn,
  sortOrder
}: {
  column: SortColumn;
  sortColumn: SortColumn;
  sortOrder: SortOrder
}) {
  if (sortColumn !== column) return null
  return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
}

export function UserTable({ users, roles, permissions }: UserTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('full_name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // 1. Filtering
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchQuery.toLowerCase()
      const matchesName = user.full_name.toLowerCase().includes(query)
      const matchesEmail = user.email.toLowerCase().includes(query)
      return matchesName || matchesEmail
    })
  }, [users, searchQuery])

  // 2. Sorting
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'full_name':
          comparison = a.full_name.localeCompare(b.full_name)
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'role':
          comparison = a.role.localeCompare(b.role)
          break
        case 'status':
          comparison = (a.is_banned ? 1 : 0) - (b.is_banned ? 1 : 0)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [filteredUsers, sortColumn, sortOrder])

  const totalPages = Math.ceil(sortedUsers.length / pageSize)
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortOrder('asc')
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters Overlay/Row */}
      <div className="mb-2">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-secondary/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-all overflow-hidden"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="table-standard min-w-[700px]">
            <thead className="table-head-standard">
              <tr>
                <th
                  className="table-th-standard cursor-pointer hover:text-primary transition-colors w-[25%]"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center gap-1">
                    Name <SortIcon column="full_name" sortColumn={sortColumn} sortOrder={sortOrder} />
                  </div>
                </th>
                <th
                  className="table-th-standard cursor-pointer hover:text-primary transition-colors w-[30%]"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email <SortIcon column="email" sortColumn={sortColumn} sortOrder={sortOrder} />
                  </div>
                </th>
                <th
                  className="table-th-standard cursor-pointer hover:text-primary transition-colors w-[15%]"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-1">
                    Role <SortIcon column="role" sortColumn={sortColumn} sortOrder={sortOrder} />
                  </div>
                </th>
                <th
                  className="table-th-standard cursor-pointer hover:text-primary transition-colors w-[15%]"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status <SortIcon column="status" sortColumn={sortColumn} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="table-th-standard text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="table-row-standard">
                  <td className="table-td-standard font-medium">{user.full_name || 'N/A'}</td>
                  <td className="table-td-standard text-muted-foreground">{user.email}</td>
                  <td className="table-td-standard">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-td-standard">
                    {user.is_banned ? (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Disabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="table-td-standard text-right">
                    <UserActions user={user} roles={roles} permissions={permissions} />
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted-foreground border-b-0">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/30" />
                      <p className="text-lg font-medium">No users match your filters.</p>
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-primary hover:underline text-sm"
                      >
                        Clear search
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium">{sortedUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, sortedUsers.length)}</span> of <span className="font-medium">{sortedUsers.length}</span> users
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center px-4 py-2 bg-secondary/50 rounded-md text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
