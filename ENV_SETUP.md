# 🔧 Configuration des Variables d'Environnement

## ⚠️ ERREUR ACTUELLE
Vous voyez l'erreur `https://placeholder.supabase.co` car les variables d'environnement Supabase ne sont pas configurées.

## 📝 ÉTAPES À SUIVRE

### 1. Créer le fichier `.env.local`

Dans le dossier `eliatisshop/`, créez un fichier nommé **`.env.local`** (sans extension .txt)

### 2. Ajouter vos clés Supabase

Copiez ce contenu dans `.env.local` :

```bash
# Configuration Supabase pour EliAti
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

### 3. Obtenir vos clés Supabase

1. Allez sur **https://supabase.com/dashboard**
2. Sélectionnez votre projet **EliAti**
3. Dans le menu de gauche, cliquez sur **Settings** (⚙️)
4. Cliquez sur **API**
5. Vous verrez :
   - **Project URL** → Copiez et remplacez `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → Copiez et remplacez `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Exemple de fichier `.env.local` rempli

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xyzabcdef123.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZjEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjg0MzI5NjAwLCJleHAiOjE5OTk5MDU2MDB9.aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
```

### 5. Redémarrer le serveur

Une fois le fichier `.env.local` créé et rempli :

```bash
# Arrêtez le serveur (Ctrl+C dans le terminal)
# Puis relancez :
npm run dev
```

### 6. Vérifier que ça fonctionne

- Allez sur **http://localhost:3000/admin**
- Ouvrez la console du navigateur (F12)
- Vous ne devriez plus voir l'erreur `placeholder.supabase.co`

## 🔒 Important

- **NE JAMAIS** commit le fichier `.env.local` sur Git
- Ce fichier est déjà dans `.gitignore`
- Gardez vos clés secrètes !

## 💡 En cas de problème

Si après avoir suivi ces étapes, vous voyez encore des erreurs :

1. Vérifiez que le fichier s'appelle bien `.env.local` (avec le point au début)
2. Vérifiez qu'il n'y a pas d'espaces avant ou après les valeurs
3. Vérifiez que vous avez bien redémarré le serveur
4. Vérifiez que les clés sont bien copiées en entier (elles sont longues !)

