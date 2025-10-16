# 🎛️ Guide d'Administration EliAti

## 📋 Vue d'ensemble

L'interface d'administration d'EliAti est conçue pour être **simple et intuitive**. Elle permet de gérer tous les aspects de votre boutique sans connaissances techniques.

### 🔗 Accès à l'administration

**URL** : `https://votre-site.com/admin`

> ⚠️ **Important** : Cette interface est sensible. Assurez-vous de la protéger avec un mot de passe ou une authentification.

---

## 🏠 Page d'accueil - Vue d'ensemble

### 📊 Tableaux de bord

- **Produits actifs** : Nombre de produits visibles sur le site
- **Catégories** : Nombre de catégories disponibles
- **Valeur catalogue** : Valeur totale de votre inventaire
- **Commandes du jour** : Nombre de commandes reçues aujourd'hui

---

## 🛍️ Gestion des Produits

### ➕ Ajouter un produit

1. Cliquez sur **"+ Ajouter un produit"**
2. Remplissez le formulaire :
   - **Nom** : Ex. "Collier Initiale Or Rose"
   - **Slug** : Généré automatiquement (URL du produit)
   - **Description** : Description détaillée
   - **Catégorie** : Sélectionnez dans la liste
   - **Prix** : Prix de vente en euros
   - **Prix barré** : Prix original (pour les promos)
   - **Statut** : Actif (visible) ou Brouillon (masqué)

3. Cliquez sur **"Créer le produit"**

### ✏️ Modifier un produit

1. Dans la liste des produits, cliquez sur **"Modifier"**
2. Modifiez les informations souhaitées
3. Cliquez sur **"Mettre à jour"**

### 🖼️ Gérer les images

1. Cliquez sur **"Images"** sur un produit
2. **Glissez-déposez** vos photos ou cliquez pour sélectionner
3. **Formats acceptés** : JPG, PNG, WebP (max 5MB)
4. **Première image** : Devient l'image principale automatiquement
5. **Supprimer** : Cliquez sur ✕ sur une image

### 🗑️ Supprimer un produit

1. Cliquez sur **"Supprimer"** (rouge)
2. Confirmez la suppression
3. ⚠️ **Attention** : Cette action supprime aussi toutes les images

---

## 📂 Gestion des Catégories

### ➕ Ajouter une catégorie

1. Cliquez sur **"+ Ajouter une catégorie"**
2. Remplissez :
   - **Nom** : Ex. "Colliers"
   - **Slug** : Ex. "colliers" (pour l'URL)
   - **Description** : Description de la catégorie

### ✏️ Modifier une catégorie

1. Cliquez sur **"Modifier"** sur une catégorie
2. Modifiez les informations
3. Sauvegardez

---

## 🎠 Gestion du Carousel

### 📸 Ajouter une slide

1. Cliquez sur **"+ Ajouter une slide"**
2. Remplissez :
   - **Titre** : Ex. "Nouvelle collection"
   - **Légende** : Ex. "Or rose & perles"
   - **Image** : Uploadez une image (1200x360px recommandé)
   - **Lien** : URL vers une page (optionnel)
   - **Position** : Ordre d'affichage

### 🎯 Conseils pour le carousel

- **Maximum 5 slides** recommandé
- **Images** : Format paysage, haute qualité
- **Textes** : Courts et percutants
- **Couleurs** : Cohérentes avec votre charte graphique

---

## 🎫 Codes Promotionnels

### ➕ Créer un code promo

1. Cliquez sur **"+ Créer un code promo"**
2. Configurez :
   - **Code** : Ex. "ELIGOLD20" (en majuscules)
   - **Réduction** : En % ou montant fixe
   - **Montant minimum** : Commande minimum requise
   - **Limite d'utilisation** : Nombre max d'utilisations
   - **Date d'expiration** : Optionnelle
   - **Statut** : Actif/Inactif

### 📊 Types de réductions

- **Pourcentage** : Ex. 20% de réduction
- **Montant fixe** : Ex. 5€ de réduction
- **Montant minimum** : Ex. Commande de 50€ minimum

### 🔄 Gérer les codes

- **Activer/Désactiver** : Bouton toggle
- **Modifier** : Cliquez sur "Modifier"
- **Supprimer** : Bouton rouge (irréversible)

---

## 📦 Gestion des Commandes

### 📋 Vue des commandes

- **Liste complète** : Toutes les commandes
- **Statuts** : En attente, Payée, Expédiée, Livrée, Annulée
- **Détails** : Client, produits, montant, adresse
- **Paiement PayPal** : ID de transaction

### ✅ Traiter une commande

1. **Vérifier le paiement** : Confirmer sur PayPal
2. **Changer le statut** : "Payée" → "Expédiée"
3. **Notifier le client** : Email automatique (à configurer)

---

## 📈 Statistiques et Revenus

### 💰 Tableaux de bord

- **Revenus mensuels** : Chiffre d'affaires du mois
- **Produits populaires** : Meilleures ventes
- **Tendances** : Évolution des ventes
- **Clients** : Nombre de clients uniques

### 📊 Métriques importantes

- **Taux de conversion** : Visiteurs → Clients
- **Panier moyen** : Montant moyen des commandes
- **Codes promo** : Utilisation et efficacité

---

## ⚙️ Configuration PayPal

### 🔧 Configuration initiale

1. **Créer un compte** sur [developer.paypal.com](https://developer.paypal.com)
2. **Créer une application** dans votre compte
3. **Copier les identifiants** :
   - Client ID
   - Client Secret
4. **Coller dans l'admin** :
   - Mode : Sandbox (test) ou Live (production)
   - Client ID PayPal
   - Client Secret PayPal
   - Devise : EUR

### 🧪 Test de connexion

1. Cliquez sur **"Tester la connexion"**
2. ✅ **Succès** : PayPal est configuré correctement
3. ❌ **Erreur** : Vérifiez vos identifiants

### 🚀 Passage en production

1. **Testez d'abord** en mode Sandbox
2. **Créez une app Live** sur PayPal
3. **Changez le mode** vers "Live"
4. **Utilisez les nouveaux identifiants**

---

## 🔒 Sécurité et Bonnes Pratiques

### 🛡️ Sécurité

- **Mot de passe fort** pour l'accès admin
- **HTTPS obligatoire** en production
- **Sauvegardes régulières** de la base de données
- **Mise à jour** des dépendances

### 📋 Checklist quotidienne

- [ ] Vérifier les nouvelles commandes
- [ ] Traiter les commandes payées
- [ ] Mettre à jour les stocks
- [ ] Répondre aux emails clients

### 📋 Checklist hebdomadaire

- [ ] Analyser les statistiques
- [ ] Optimiser les codes promo
- [ ] Mettre à jour le carousel
- [ ] Vérifier les paiements PayPal

---

## 🆘 Dépannage

### ❌ Problèmes courants

**Les images ne s'affichent pas**
- Vérifiez que le bucket Supabase est public
- Vérifiez les URLs dans la base de données

**PayPal ne fonctionne pas**
- Vérifiez vos identifiants
- Testez d'abord en mode Sandbox
- Vérifiez que HTTPS est activé

**Les commandes n'apparaissent pas**
- Vérifiez la configuration PayPal
- Vérifiez les logs d'erreur
- Testez avec une commande test

### 📞 Support

- **Email** : Contacteliati@gmail.com
- **Documentation** : Ce guide
- **Logs** : Consultez la console du navigateur (F12)

---

## 🎯 Fonctionnalités Avancées

### 🔮 À venir

- **Gestion des stocks** : Suivi des quantités
- **Emails automatiques** : Confirmations de commande
- **Analytics avancées** : Google Analytics intégré
- **Multi-langues** : Support anglais
- **Mobile app** : Application mobile admin

### 💡 Conseils d'optimisation

- **Images** : Optimisez vos photos (WebP recommandé)
- **Descriptions** : Utilisez des mots-clés SEO
- **Prix** : Testez différents prix pour optimiser les ventes
- **Codes promo** : Créez des offres saisonnières

---

**🎉 Félicitations ! Vous maîtrisez maintenant l'administration d'EliAti !**

*Ce guide sera mis à jour au fur et à mesure des nouvelles fonctionnalités.*
