-- ===========================================
-- Migration des utilisateurs existants vers la table profiles
-- ===========================================

-- Insérer les utilisateurs existants qui n'ont pas de profil
INSERT INTO public.profiles (id, email, first_name, last_name, created_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', ''),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
  last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
  updated_at = NOW();

-- Vérifier le résultat
SELECT 
  'Migration completed' as status,
  COUNT(*) as profiles_created
FROM public.profiles;

-- Afficher les profils créés
SELECT 
  id,
  email,
  first_name,
  last_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
