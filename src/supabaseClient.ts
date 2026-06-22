import { createClient } from '@supabase/supabase-js'

// Same Supabase project as the iOS app
const SUPABASE_URL = 'https://ibhsjbsqpjupxwwxvyak.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_A35AAt4HQICKl0jdof4f0A_rVJQbjg4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true }
})

export async function uploadImage(bucket: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `web/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'image/jpeg', upsert: true
  })
  if (error) throw error
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}
