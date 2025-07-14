'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Providers } from '@/hooks/auth-context'

export async function login(provider: Providers) {
  const supabase = await createClient()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = `${baseUrl}/auth/callback?next=/projects`
  console.log(redirectTo)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo,
    },
  })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect(data.url)
}
