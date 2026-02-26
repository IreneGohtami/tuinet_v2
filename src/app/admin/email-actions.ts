
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- SMTP Settings ---

export async function saveSMTPSettings(airlineId: string, data: Record<string, unknown>) {
  try {
    const { error } = await supabaseAdmin
      .from('settings_airline_smtp')
      .upsert({
        airline_id: airlineId,
        ...data,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    revalidatePath(`/admin/settings/airlines/${airlineId}/smtp`)
    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save SMTP settings'
    console.error('Error saving SMTP settings:', error)
    return { success: false, error: message }
  }
}

export async function verifyOAuthCredentials(airlineId: string, data: Record<string, unknown>) {
  try {
    const { getOAuth2AccessToken } = await import('@/lib/email')

    // Verify by attempting to fetch a token
    await getOAuth2AccessToken(data)

    // If successful, save the settings
    await saveSMTPSettings(airlineId, data)

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify OAuth credentials'
    console.error('OAuth Verification Error:', error)
    return { success: false, error: message }
  }
}

export async function testSMTPSettings(airlineId: string, data: Record<string, unknown>, recipient: string) {
  try {
    const { sendEmail } = await import('@/lib/email')
    const result = await sendEmail('test_connection', recipient, {
      airline_name: 'Test System',
      test_date: new Date().toLocaleString()
    }, {
      airline_id: airlineId,
      smtp_override: data
    })

    if (!result.success) throw new Error(result.error)

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to test SMTP settings'
    console.error('Error testing SMTP settings:', error)
    return { success: false, error: message }
  }
}

// --- Email Templates ---

export async function createTemplate(data: Record<string, unknown>) {
  try {
    const { error } = await supabaseAdmin.from('email_templates').insert(data)
    if (error) throw error
    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error creating template:', error)
    return { success: false, error: 'Failed to create template' }
  }
}

export async function updateTemplate(id: string, data: Record<string, unknown>) {
  try {
    const { error } = await supabaseAdmin.from('email_templates').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating template:', error)
    return { success: false, error: 'Failed to update template' }
  }
}

export async function deleteTemplate(id: string) {
  try {
    const { error } = await supabaseAdmin.from('email_templates').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error) {
    console.error('Error deleting template:', error)
    return { success: false, error: 'Failed to delete template' }
  }
}

export async function duplicateTemplate(id: string) {
  try {
    const { data: original, error: fetchError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const { id: _, created_at: __, updated_at: ___, ...content } = original
    const { error: insertError } = await supabaseAdmin
      .from('email_templates')
      .insert({
        ...content,
        type: `${content.type}_copy_${Date.now()}`
      })

    if (insertError) throw insertError

    revalidatePath('/admin/email-templates')
    return { success: true }
  } catch (error: unknown) {
    console.error('Error duplicating template:', error)
    return { success: false, error: 'Failed to duplicate template' }
  }
}
