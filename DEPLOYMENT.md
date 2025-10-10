# 🚀 Guide de déploiement sur Vercel

Ce guide vous explique comment déployer votre boutique EliAtis sur Vercel.

## 📋 Prérequis

- ✅ Compte GitHub (gratuit)
- ✅ Compte Vercel (gratuit)
- ✅ Projet Supabase configuré
- ✅ Code testé localement avec `npm run dev`

## 🎯 Étape 1 : Préparer le repository GitHub

### 1. Créer un repository GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - EliAtis boutique"
```

### 2. Créer le repository sur GitHub

1. Allez sur [GitHub](https://github.com)
2. Cliquez sur **New repository**
3. Nom : `eliatisshop`
4. Visibilité : **Private** (recommandé pour un site e-commerce)
5. Cliquez sur **Create repository**

### 3. Pousser le code

```bash
# Ajouter le remote
git remote add origin https://github.com/votre-username/eliatisshop.git

# Pousser le code
git branch -M main
git push -u origin main
```

## 🚀 Étape 2 : Déployer sur Vercel

### 1. Connecter Vercel à GitHub

1. Allez sur [Vercel](https://vercel.com)
2. Cliquez sur **Sign Up** ou **Login**
3. Choisissez **Continue with GitHub**
4. Autorisez Vercel à accéder à vos repositories

### 2. Importer le projet

1. Cliquez sur **Add New** > **Project**
2. Trouvez votre repository `eliatisshop`
3. Cliquez sur **Import**

### 3. Configurer le projet

Vercel détecte automatiquement Next.js. Vérifiez :

- **Framework Preset** : Next.js
- **Root Directory** : `./`
- **Build Command** : `npm run build`
- **Output Directory** : `.next`

### 4. Ajouter les variables d'environnement

**Très important !** Ajoutez vos clés Supabase :

1. Cliquez sur **Environment Variables**
2. Ajoutez les variables suivantes :

| Nom | Valeur | Environnement |
|-----|--------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre clé anon Supabase | Production, Preview, Development |

3. Cliquez sur **Deploy**

### 5. Attendre le déploiement

Le déploiement prend généralement 2-3 minutes. Vercel :
- ✅ Clone votre code
- ✅ Installe les dépendances
- ✅ Build l'application
- ✅ Déploie sur le CDN global

## 🎉 Étape 3 : Vérifier le déploiement

### Accéder à votre site

Une fois le déploiement terminé :

1. Vercel vous donne une URL : `https://eliatisshop-xxx.vercel.app`
2. Cliquez dessus pour voir votre site en ligne ! 🎊

### Vérifications à faire

- [ ] La page d'accueil s'affiche correctement
- [ ] Les images placeholder apparaissent
- [ ] La navigation fonctionne
- [ ] Les pages catégories se chargent
- [ ] Pas d'erreur dans la console du navigateur

## 🌐 Étape 4 : Ajouter un domaine personnalisé (optionnel)

### 1. Acheter un nom de domaine

Achetez un domaine sur :
- [Namecheap](https://www.namecheap.com)
- [OVH](https://www.ovh.com)
- [Google Domains](https://domains.google)
- Ou via Vercel directement

### 2. Configurer le domaine sur Vercel

1. Dans votre projet Vercel, allez dans **Settings** > **Domains**
2. Cliquez sur **Add**
3. Entrez votre domaine : `eliatis.fr`
4. Vercel vous donne des instructions DNS

### 3. Configurer les DNS

Chez votre registrar (ex: OVH), ajoutez :

**Type A Record :**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Type CNAME (pour www) :**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

⏰ **Attention** : La propagation DNS peut prendre de 5 minutes à 48 heures.

## 🔄 Étape 5 : Déploiements automatiques

### Comment ça marche ?

Chaque fois que vous faites un `git push` sur GitHub :
- 🔵 **Production** : `main` branch → `eliatis.fr`
- 🟡 **Preview** : autres branches → URLs de preview

### Workflow de développement

```bash
# 1. Créer une branche pour une nouvelle fonctionnalité
git checkout -b feature/nouveau-panier

# 2. Faire vos modifications
# ... coder ...

# 3. Commiter et pousser
git add .
git commit -m "Ajout du panier d'achat"
git push origin feature/nouveau-panier

# 4. Vercel crée automatiquement un déploiement de preview
# Vous recevez un lien unique pour tester

# 5. Si tout est OK, merger dans main
git checkout main
git merge feature/nouveau-panier
git push origin main

# 6. Vercel déploie automatiquement en production
```

## ⚙️ Configuration avancée

### Optimisations recommandées

#### 1. Activer la compression d'images

Ajoutez dans `next.config.ts` :

```typescript
const config = {
  images: {
    domains: ['votreprojet.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

#### 2. Configurer les headers de sécurité

Créez un fichier `vercel.json` :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### 3. Activer Analytics (optionnel)

1. Dans Vercel, allez dans **Analytics**
2. Activez **Web Analytics**
3. Suivez les visites, performances, etc.

## 📊 Monitoring et logs

### Voir les logs de déploiement

1. Allez dans **Deployments**
2. Cliquez sur un déploiement
3. Onglet **Build Logs** pour voir les logs de build
4. Onglet **Functions** pour voir les logs runtime

### Activer les alertes

1. **Settings** > **Notifications**
2. Activez les notifications pour :
   - Déploiements échoués
   - Déploiements réussis (optionnel)

## 🐛 Dépannage

### Le déploiement échoue

**Erreur de build TypeScript**
```bash
# Testez localement d'abord
npm run build

# Corrigez les erreurs TypeScript
npm run lint
```

**Variables d'environnement manquantes**
- Vérifiez que `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont bien configurées
- Les variables doivent commencer par `NEXT_PUBLIC_` pour être accessibles côté client

### Le site est en ligne mais les données ne s'affichent pas

**Vérifier la connexion Supabase**
1. Ouvrez la console du navigateur (F12)
2. Regardez l'onglet **Network**
3. Cherchez les requêtes vers Supabase
4. Vérifiez les erreurs (401 = clé invalide, 404 = table introuvable)

**Vérifier les politiques RLS**
- Assurez-vous que les politiques de lecture publique sont activées dans Supabase
- Voir le fichier `SUPABASE_SETUP.md`

### Le domaine personnalisé ne fonctionne pas

1. Vérifiez la configuration DNS (peut prendre jusqu'à 48h)
2. Utilisez [DNS Checker](https://dnschecker.org) pour vérifier la propagation
3. Vérifiez dans Vercel que le domaine est bien validé (coche verte)

## 🔒 Sécurité en production

### Checklist de sécurité

- [ ] Les clés Supabase sont dans les variables d'environnement (pas dans le code)
- [ ] Le fichier `.env.local` est dans `.gitignore`
- [ ] Les politiques RLS sont activées sur Supabase
- [ ] HTTPS est activé (automatique avec Vercel)
- [ ] Les images sont servies depuis Supabase Storage (pas de liens externes non sécurisés)

### Protection contre les abus

Si vous ajoutez un système de panier/commandes :
- Ajoutez un rate limiting
- Validez les données côté serveur
- Utilisez Supabase Auth pour les utilisateurs

## 📈 Prochaines étapes

1. ✅ Remplacer les images placeholder par vos vraies photos
2. ✅ Remplir la base de données avec vos produits
3. ✅ Tester le site en conditions réelles
4. 🛒 Ajouter un système de panier
5. 💳 Intégrer Stripe pour les paiements
6. 📧 Configurer les emails de confirmation (avec Resend ou SendGrid)
7. 📊 Activer Google Analytics ou Vercel Analytics

## 💡 Ressources utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel + Next.js](https://vercel.com/docs/frameworks/nextjs)
- [Vercel + Supabase](https://vercel.com/guides/using-supabase-with-vercel)
- [Vercel Analytics](https://vercel.com/analytics)

---

**Félicitations ! Votre boutique est maintenant en ligne ! 🎊**

