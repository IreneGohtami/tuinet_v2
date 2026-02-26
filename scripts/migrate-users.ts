import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!
const decryptionKey = process.env.V1_DECRYPTION_KEY! // Should be 32 chars for AES-256
//const decryptionIv = process.env.V1_DECRYPTION_IV! // Might not be used for ECB

if (!supabaseUrl || !supabaseServiceKey || !decryptionKey) {
  console.error('Missing environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, and V1_DECRYPTION_KEY are set.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function decryptPassword(encryptedBase64: string): string {
  try {
    // Note: ECB mode usually ignores the IV.
    // If the user insists on IV, they might be using it for key derivation or it's actually CBC.
    // We'll try ECB first as requested.
    const decipher = crypto.createDecipheriv(
      'aes-256-ecb',
      Buffer.from(decryptionKey, 'utf8'),
      null // IV is null for ECB
    )

    let decrypted = decipher.update(encryptedBase64, 'base64')
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString('utf16le') // V1 MSSQL data is often UTF-16LE
  } catch (error) {
    console.error(`Failed to decrypt password: ${encryptedBase64}`, error)
    return ''
  }
}

async function migrate() {
  const csvPath = path.join(process.cwd(), 'tuinet-v1', 'migrations', 'Usuario_Completo.csv')
  const content = fs.readFileSync(csvPath, 'utf8')
  const lines = content.split('\n')

  // Skip BOM if present and headers
  const startIndex = lines[0].includes('userId') ? 1 : 0
  const dataLines = lines.slice(startIndex).filter(line => line.trim() !== '')

  console.log(`Starting migration of ${dataLines.length} users...`)

  for (const line of dataLines) {
    // Simple CSV split (not handling quoted commas, but V1 data usually doesn't have them in these fields)
    const [userId, name, username, encryptedPassword, rawEmail, active, superuser] = line.split(',')

    if (!rawEmail || !encryptedPassword) continue

    const email = rawEmail.trim().toLowerCase()
    const password = decryptPassword(encryptedPassword)
    if (!password) {
      console.log(`Skipping user ${email} due to decryption failure.`)
      continue
    }

    const isActive = active === '1'
    const isSuperuser = superuser === '1'

    console.log(`Migrating: ${email} (Active: ${isActive})`)

    // 1. Create User in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        legacy_id: userId,
        username: username,
        is_superuser: isSuperuser
      }
    })

    if (authError) {
      if (authError.message.toLowerCase().includes('already registered') || authError.status === 422 || authError.status === 400) {
        console.log(`User ${email} already exists. Updating password...`)
        // Fetch user to get ID
        const { data: { users }, error: _listError } = await supabase.auth.admin.listUsers()
        const existingUser = users.find(u => u.email?.toLowerCase() === email)

        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
            password: password,
            user_metadata: {
              full_name: name,
              legacy_id: userId,
              username: username,
              is_superuser: isSuperuser
            }
          })
          if (updateError) {
            console.error(`Error updating user ${email}:`, updateError.message)
            continue
          }
          // Proceed with profile sync using existing ID
          await syncProfile(existingUser.id, email, name, isSuperuser)
        }
      } else {
        console.error(`Error creating auth user ${email}:`, authError.message)
      }
      continue
    }

    const sid = authUser?.user?.id
    if (sid) {
      // 2. Handle Deactivation
      if (!isActive) {
        console.log(`Deactivating user ${email}...`)
        await supabase.auth.admin.updateUserById(sid, {
          ban_duration: '876000h' // Ban for 100 years
        })
      }

      // 3. Sync to user_profiles
      await syncProfile(sid, email, name, isSuperuser)
    }
  }

  console.log('Migration complete.')
}

async function syncProfile(id: string, email: string, name: string, isSuperuser: boolean) {
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: id,
      email: email.trim(),
      full_name: name,
      role: isSuperuser ? 'admin' : 'user'
    })

  if (profileError) {
    console.error(`Error syncing profile for ${email}:`, profileError.message)
  }
}

migrate()
