
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm, SecurityForm, DangerZone } from './profile-forms'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch full profile data including full_name
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile information and security settings.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ProfileForm
          userEmail={user.email!}
          initialFullName={profile?.full_name || user.user_metadata?.full_name || null}
        />
        <SecurityForm />
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <DangerZone />
      </div>
    </div>
  )
}
