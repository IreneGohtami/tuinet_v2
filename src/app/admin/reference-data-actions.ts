
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- Airlines ---

export async function createAirline(data: { name: string; code: string }) {
  try {
    const { error } = await supabaseAdmin.from('settings_airlines').insert(data)
    if (error) throw error
    revalidatePath('/admin/settings/airlines')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Airline code must be unique.' }
    }
    console.error('Error creating airline:', error)
    return { success: false, error: 'Failed to create airline' }
  }
}

export async function updateAirline(id: string, data: { name: string; code: string }) {
  try {
    const { error } = await supabaseAdmin.from('settings_airlines').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/airlines')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Airline code must be unique.' }
    }
    console.error('Error updating airline:', error)
    return { success: false, error: 'Failed to update airline' }
  }
}

export async function deleteAirline(id: string) {
  try {
    const { error } = await supabaseAdmin.from('settings_airlines').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/airlines')
    return { success: true }
  } catch (error) {
    console.error('Error deleting airline:', error)
    return { success: false, error: 'Failed to delete airline' }
  }
}

// --- Currencies ---

export async function getCurrencies(params: {
  page?: number
  pageSize?: number
  search?: string
}) {
  const { page = 1, pageSize = 10, search = '' } = params
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabaseAdmin
    .from('settings_currencies')
    .select('*', { count: 'exact' })
    .order('code', { ascending: true })

  if (search) {
    query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`)
  }

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching currencies:', error)
    return { data: [], count: 0, error: error.message }
  }

  return { data: data || [], count: count || 0 }
}

export async function createCurrency(data: { code: string; name?: string; symbol?: string; id?: number }) {
  try {
    const { error } = await supabaseAdmin.from('settings_currencies').insert(data)
    if (error) throw error
    revalidatePath('/admin/settings/currencies')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Currency code must be unique.' }
    }
    console.error('Error creating currency:', error)
    return { success: false, error: 'Failed to create currency' }
  }
}

export async function updateCurrency(id: string | number, data: { code: string; name?: string; symbol?: string }) {
  try {
    const { error } = await supabaseAdmin.from('settings_currencies').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/currencies')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Currency code must be unique.' }
    }
    console.error('Error updating currency:', error)
    return { success: false, error: 'Failed to update currency' }
  }
}

export async function deleteCurrency(id: string) {
  try {
    const { error } = await supabaseAdmin.from('settings_currencies').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/currencies')
    return { success: true }
  } catch (error) {
    console.error('Error deleting currency:', error)
    return { success: false, error: 'Failed to delete currency' }
  }
}

// --- Regions ---

export async function createRegion(data: { code: string }) {
  try {
    const { error } = await supabaseAdmin.from('settings_regions').insert(data)
    if (error) throw error
    revalidatePath('/admin/settings/regions')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Region code must be unique.' }
    }
    console.error('Error creating region:', error)
    return { success: false, error: 'Failed to create region' }
  }
}

export async function updateRegion(id: string, data: { code: string }) {
  try {
    const { error } = await supabaseAdmin.from('settings_regions').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/regions')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Region code must be unique.' }
    }
    console.error('Error updating region:', error)
    return { success: false, error: 'Failed to update region' }
  }
}

export async function deleteRegion(id: string) {
  try {
    const { error } = await supabaseAdmin.from('settings_regions').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/settings/regions')
    return { success: true }
  } catch (error) {
    console.error('Error deleting region:', error)
    return { success: false, error: 'Failed to delete region' }
  }
}
