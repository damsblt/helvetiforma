// Script pour vérifier les variables d'environnement
console.log('🔍 Vérification des variables d\'environnement:')
console.log('')

console.log('Variables côté client (NEXT_PUBLIC_*):')
console.log('NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL || 'NON DÉFINIE')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NON DÉFINIE')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DÉFINIE' : 'NON DÉFINIE')

console.log('')
console.log('Variables côté serveur:')
console.log('NODE_ENV:', process.env.NODE_ENV || 'NON DÉFINIE')
console.log('VERCEL:', process.env.VERCEL || 'NON DÉFINIE')
console.log('VERCEL_URL:', process.env.VERCEL_URL || 'NON DÉFINIE')

console.log('')
console.log('URLs de redirection calculées:')
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://helvetiforma.ch'
console.log('Site URL utilisée:', siteUrl)
console.log('URL de réinitialisation:', `${siteUrl}/reset-password`)

console.log('')
console.log('✅ Si NEXT_PUBLIC_SITE_URL n\'est pas définie, l\'application utilisera le fallback https://helvetiforma.ch')
