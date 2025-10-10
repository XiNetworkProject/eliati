# 🚀 Démarrage rapide - EliAtis

Guide étape par étape pour lancer votre boutique EliAtis localement.

## ⚡ Installation en 5 minutes

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

#### Option A : Utiliser Supabase Cloud (recommandé)

1. **Créez un compte gratuit sur [Supabase](https://supabase.com)**

2. **Créez un nouveau projet**
   - Nom : `eliatisshop`
   - Mot de passe de la base de données : choisissez un mot de passe fort
   - Région : choisissez la plus proche de vous

3. **Créez les tables**
   - Allez dans **SQL Editor**
   - Copiez-collez le contenu du fichier `SUPABASE_SETUP.md` (section "Créer les types et tables")
   - Exécutez le script

4. **Créez le bucket Storage**
   - Allez dans **Storage**
   - Créez un bucket public nommé `products`

5. **Récupérez vos clés API**
   - Allez dans **Settings** > **API**
   - Copiez `Project URL` et `anon/public key`

#### Option B : Utiliser Supabase Local (avancé)

```bash
# Installer le CLI Supabase
npm install -g supabase

# Initialiser Supabase localement
supabase init
supabase start
```

### 3. Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet :

```bash
# Windows (PowerShell)
Copy-Item env.example .env.local

# macOS/Linux
cp env.example .env.local
```

Éditez `.env.local` et remplacez par vos vraies valeurs :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votreprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

## 📝 Ajouter des données de test

### Méthode 1 : Via l'éditeur SQL Supabase

1. Allez dans **SQL Editor** sur Supabase
2. Copiez-collez le script de seed du fichier `SUPABASE_SETUP.md`
3. Exécutez

### Méthode 2 : Via l'interface Table Editor

1. Allez dans **Table Editor** > **categories**
2. Cliquez sur **Insert** > **Insert row**
3. Remplissez :
   - name: `Colliers`
   - slug: `colliers`
   - description: `Chaînes fines, pendentifs personnalisés`
4. Répétez pour les autres catégories

## 🖼️ Ajouter vos vraies images

### 1. Remplacer les images placeholder

Remplacez les fichiers SVG par vos vraies images JPG/PNG :

```
public/
├── hero/
│   ├── slide1.jpg  (1200x360px)
│   ├── slide2.jpg  (1200x360px)
│   └── slide3.jpg  (1200x360px)
├── cat/
│   ├── colliers.jpg  (400x500px)
│   ├── boucles.jpg   (400x500px)
│   ├── bagues.jpg    (400x500px)
│   └── bracelets.jpg (400x500px)
└── placeholder.jpg   (400x400px)
```

### 2. Upload des images produits sur Supabase

1. Allez dans **Storage** > **products**
2. Cliquez sur **Upload file**
3. Uploadez vos photos de produits
4. Copiez l'URL publique de chaque image
5. Ajoutez-les dans la table `product_images`

## 🎨 Personnalisation

### Modifier les couleurs

Éditez `src/app/globals.css` :

```css
@theme inline {
  --color-ivory: #F4EFEA;
  --color-champagne: #EED3BF;
  /* ... modifiez selon vos préférences */
}
```

### Modifier le logo

Éditez `src/components/Logo.tsx` :

```tsx
// Décommentez et ajoutez votre logo
<img src="/logo-eliatis.png" alt="EliAtis" className="h-8 w-auto"/>
```

### Modifier les textes

- **Slogan** : `src/app/page.tsx` (section "Bijoux pensés à quatre mains")
- **Footer** : `src/components/Footer.tsx`
- **Navigation** : `src/components/Header.tsx`

## 🔧 Commandes utiles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer le serveur de production
npm start

# Vérifier le code
npm run lint
```

## ❓ Problèmes courants

### Erreur : "Invalid API key"

- Vérifiez que votre `.env.local` contient les bonnes clés
- Redémarrez le serveur avec `npm run dev`

### Les images ne s'affichent pas

- Vérifiez que le bucket `products` est bien public
- Vérifiez les URLs dans la table `product_images`

### Erreur de connexion Supabase

- Vérifiez que votre projet Supabase est actif
- Vérifiez l'URL dans `.env.local`

## 📚 Prochaines étapes

1. ✅ Ajouter vos vraies images
2. ✅ Remplir la base de données avec vos produits
3. ✅ Personnaliser les couleurs et textes
4. 📦 Déployer sur Vercel (voir README.md)
5. 🛒 Ajouter un système de panier
6. 💳 Intégrer Stripe pour les paiements

## 🆘 Besoin d'aide ?

- 📖 [Documentation Next.js](https://nextjs.org/docs)
- 📖 [Documentation Supabase](https://supabase.com/docs)
- 📖 [Documentation Tailwind CSS](https://tailwindcss.com/docs)

---

**Bon développement ! 💎**

