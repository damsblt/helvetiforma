-- Configuration de la base de données Supabase pour Helvetiforma
-- Exécuter ce script dans l'éditeur SQL de Supabase

-- 1. Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des achats
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id TEXT NOT NULL,
  post_title TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Montant en centimes
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent_id TEXT,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'))
);

-- 3. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_post_id ON purchases(post_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);

-- 4. Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger pour exécuter la fonction lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Politiques de sécurité (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Politique pour les profils : les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour les achats : les utilisateurs peuvent voir leurs propres achats
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (auth.uid() = user_id);

-- Politique pour l'insertion des achats (utilisée par l'API)
CREATE POLICY "Allow insert purchases" ON purchases
  FOR INSERT WITH CHECK (true);

-- Politique pour la mise à jour des achats (utilisée par l'API)
CREATE POLICY "Allow update purchases" ON purchases
  FOR UPDATE USING (true);

-- 7. Fonction pour vérifier si un utilisateur a acheté un article
CREATE OR REPLACE FUNCTION public.check_user_purchase(user_id UUID, post_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM purchases 
    WHERE purchases.user_id = check_user_purchase.user_id 
    AND purchases.post_id = check_user_purchase.post_id 
    AND purchases.status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour enregistrer un achat
CREATE OR REPLACE FUNCTION public.record_purchase(
  p_user_id UUID,
  p_post_id TEXT,
  p_post_title TEXT,
  p_amount INTEGER,
  p_stripe_session_id TEXT,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO purchases (
    user_id, post_id, post_title, amount, 
    stripe_session_id, stripe_payment_intent_id, status
  ) VALUES (
    p_user_id, p_post_id, p_post_title, p_amount,
    p_stripe_session_id, p_stripe_payment_intent_id, 'pending'
  );
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction pour mettre à jour le statut d'un achat
CREATE OR REPLACE FUNCTION public.update_purchase_status(
  p_stripe_session_id TEXT,
  p_status TEXT,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE purchases 
  SET 
    status = p_status,
    stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id)
  WHERE stripe_session_id = p_stripe_session_id;
  
  RETURN FOUND;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
