import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('··· ENV DE SUPABASE ···')
console.log('URL:', supabaseUrl === undefined ? 'undefined' : supabaseUrl.startsWith('http') ? '[OK]' : supabaseUrl)
console.log('Anon Key:', supabaseAnonKey === undefined ? 'undefined' :
                supabaseAnonKey.length > 20 ? '[OK]' : supabaseAnonKey)
console.log('··· ··· ···')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables de entorno de Supabase faltantes o incorrectas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
