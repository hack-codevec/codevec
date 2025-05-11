'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { Providers } from '@/hooks/auth-context'

export async function login(provider:Providers) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider,
    options:{
        redirectTo: "http://localhost:3000/auth/callback?next=/projects"
    }
  })

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect(data.url)
}
