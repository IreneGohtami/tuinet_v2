
import nodemailer from 'nodemailer'
import { supabaseAdmin } from './supabase/admin'

export interface EmailData {
  [key: string]: string | number | boolean | undefined | object
  attachments?: {
    filename: string
    content: Buffer | string
    contentType?: string
  }[]
}

export interface EmailContext {
  airline_id?: string
  region_id?: string
  currency_id?: string
  smtp_override?: Record<string, unknown>
}

const GLOBAL_DEFAULT_UUID = '00000000-0000-0000-0000-000000000000'

/**
 * Fetches a fresh OAuth2 Access Token using Client Credentials flow or Refresh Token flow.
 */
export async function getOAuth2AccessToken(settings: Record<string, unknown>) {
  const body: Record<string, string> = {
    client_id: String(settings.client_id || ''),
    client_secret: String(settings.client_secret || ''),
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  };

  const response = await fetch(`https://login.microsoftonline.com/${settings.tenant_id}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`OAuth2 token error: ${data.error_description || data.error}`);
  }

  // Debugging (remove in production)
  console.log('OAuth2 token successfully acquired for:', settings.user);
  if (data.expires_in) {
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    console.log('Token expires at:', expiresAt.toLocaleString());
  }

  return data.access_token;
}

/**
 * Sends an email using Microsoft Graph API (required for background Client Credentials flow).
 */
async function sendEmailViaGraph(accessToken: string, fromUser: string, recipient: string, subject: string, html: string, attachments?: { filename: string; content: Buffer | string; contentType?: string }[]) {
  const response = await fetch(`https://graph.microsoft.com/v1.0/users/${fromUser}/sendMail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: html
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipient
            }
          }
        ],
        attachments: attachments?.map(a => ({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: a.filename,
          contentType: a.contentType || 'application/octet-stream',
          contentBytes: (Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content)).toString('base64')
        }))
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Graph API error: ${error.error?.message || response.statusText}`);
  }
}

/**
 * Sends an email using a template with fallback logic and airline-specific SMTP settings.
 */
export async function sendEmail(
  type: string,
  recipient: string,
  data: EmailData,
  context: EmailContext
) {
  try {
    // 1. Fetch Template with Fallback Logic
    let template = await fetchTemplate(type, context)

    // Built-in fallback for connection tests
    if (!template && type === 'test_connection') {
      template = {
        id: GLOBAL_DEFAULT_UUID,
        subject: 'SMTP Connection Test',
        html_content: '<h1>Connection Successful</h1><p>This is a test email from the {{airline_name}} system sent on {{test_date}}.</p>',
        text_content: 'Connection Successful! This is a test email sent on {{test_date}}.'
      }
    }

    if (!template) {
      throw new Error(`No template found for type: ${type}`)
    }

    // 2. Fetch SMTP Settings (or use override)
    const smtpSettings = context.smtp_override || await fetchSMTPSettings(context.airline_id)

    // 3. Prepare Email Content
    const subject = replacePlaceholders(template.subject, data)
    const html = replacePlaceholders(template.html_content, data)
    const text = template.text_content ? replacePlaceholders(template.text_content, data) : undefined

    // 4. Send Email
    let messageId = ''
    if (smtpSettings?.auth_type === 'OAUTH2') {
      const accessToken = await getOAuth2AccessToken(smtpSettings)
      await sendEmailViaGraph(accessToken, smtpSettings.user, recipient, subject, html, data.attachments)
      messageId = `graph-${Date.now()}`
    } else {
      const transporter = await createTransporter(smtpSettings)
      const info = await transporter.sendMail({
        from: smtpSettings ? `"${smtpSettings.user}" <${smtpSettings.user}>` : process.env.SMTP_FROM,
        to: recipient,
        subject,
        html,
        text,
        attachments: data.attachments
      })
      messageId = info.messageId
    }

    // 5. Log Success
    await logEmail({
      template_id: template.id,
      airline_id: context.airline_id,
      recipient,
      subject,
      status: 'SUCCESS',
      attachments_sent: data.attachments?.map(a => a.filename) || []
    })

    return { success: true, messageId }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email sending failed:', error)

    // Log Failure
    await logEmail({
      airline_id: context.airline_id,
      recipient,
      subject: 'FAILED_SEND',
      status: 'FAILED',
      error_message: message
    })

    return { success: false, error: message }
  }
}

async function fetchTemplate(type: string, context: EmailContext) {
  const { airline_id, region_id, currency_id } = context

  // Supabase RPC or complex query for fallback
  // Fallback:
  // 1. A + R + C
  // 2. A + R + (C is NULL)
  // 3. A + (R is NULL) + (C is NULL)
  // 4. (A is NULL) + (R is NULL) + (C is NULL)

  const { data: templates, error } = await supabaseAdmin
    .from('email_templates')
    .select('*')
    .eq('type', type)

  if (error || !templates) return null

  // Manual fallback logic for clarity
  const findMatch = (a: string | null, r: string | null, c: string | null) =>
    templates.find(t =>
      (t.airline_id === a) &&
      (t.region_id === r) &&
      (t.currency_id === c)
    )

  return (
    findMatch(airline_id || null, region_id || null, currency_id || null) || // Specific
    findMatch(airline_id || null, region_id || null, null) ||               // Airline + Region
    findMatch(airline_id || null, null, null) ||                            // Airline Only
    findMatch(null, null, null)                                             // Global Default
  )
}

async function fetchSMTPSettings(airline_id?: string) {
  if (!airline_id) return null

  const { data, error } = await supabaseAdmin
    .from('setting_airline_smtp')
    .select('*')
    .eq('airline_id', airline_id)
    .single()

  if (error || !data) return null
  return data
}

async function createTransporter(settings: Record<string, unknown> | null) {
  if (!settings) {
    // Fallback to system default from env
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    } as import('nodemailer').TransportOptions)
  }

  if (settings.auth_type === 'OAUTH2') {
    // Always fetch a fresh token for Client Credentials or to ensure consistency
    const accessToken = await getOAuth2AccessToken(settings);
    console.log(accessToken, "accessToken")
    return nodemailer.createTransport({
      host: (settings.host as string) || 'smtp.office365.com',
      port: (settings.port as number) || 587,
      secure: Number(settings.port) === 465,
      auth: {
        type: 'OAuth2',
        user: settings.user as string,
        accessToken,
      },
      debug: true, // Enable debug output for now
      logger: true
    } as import('nodemailer').TransportOptions)
  }

  return nodemailer.createTransport({
    host: settings.host as string,
    port: Number(settings.port),
    secure: Number(settings.port) === 465,
    auth: {
      user: settings.user as string,
      pass: settings.password as string,
    },
    tls: {
      // Do not fail on invalid certs for custom SMTPs, and support older servers
      rejectUnauthorized: false,
    }
  } as import('nodemailer').TransportOptions)
}

function replacePlaceholders(content: string, data: EmailData) {
  return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const value = data[key.trim()]
    return value !== undefined ? String(value) : match
  })
}

async function logEmail(logEntry: Record<string, unknown>) {
  await supabaseAdmin
    .from('email_logs')
    .insert([logEntry])
}
