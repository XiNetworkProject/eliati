export type SiteConfig = {
  // Informations générales
  site_name: string
  slogan: string
  description: string
  logo_url: string | null
  favicon_url: string | null

  // Coordonnées
  contact_email: string
  contact_phone: string
  address: string
  city: string
  postal_code: string
  country: string

  // Réseaux sociaux
  instagram_url: string
  facebook_url: string
  tiktok_url: string
  pinterest_url: string
  youtube_url: string

  // SEO
  meta_title: string
  meta_description: string
  meta_keywords: string

  // Options
  show_promo_banner: boolean
  promo_banner_text: string
  maintenance_mode: boolean
  maintenance_message: string
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  site_name: 'EliAti',
  slogan: 'Bijoux pensés à quatre mains, faits pour durer.',
  description:
    'Bijoux pensés à quatre mains, faits pour durer. Des créations uniques qui accompagnent vos plus beaux moments.',
  logo_url: null,
  favicon_url: null,
  contact_email: 'Contacteliati@gmail.com',
  contact_phone: '',
  address: '',
  city: '',
  postal_code: '',
  country: 'France',
  instagram_url: 'https://www.instagram.com/eliati_creations/',
  facebook_url: 'https://www.facebook.com/profile.php?id=61583076211318',
  tiktok_url: 'https://www.tiktok.com/@eliati_creations',
  pinterest_url: '',
  youtube_url: '',
  meta_title: 'EliAti – Bijoux',
  meta_description: 'Bijoux faits main – colliers, boucles, bagues, bracelets.',
  meta_keywords: '',
  show_promo_banner: false,
  promo_banner_text: '',
  maintenance_mode: false,
  maintenance_message: 'Le site est en maintenance. Revenez bientôt !',
}

export type LegalTexts = {
  mentions_legales: string
  cgv: string
  politique_confidentialite: string
  politique_retour: string
  faq: string
}

export const DEFAULT_LEGAL_TEXTS: LegalTexts = {
  mentions_legales: `Mentions légales

Éditeur du site
Raison sociale : Leniept Atlantis
Forme juridique : Entrepreneur individuel
SIREN : 933 348 914
SIRET : 933 348 914 00013
Numéro de TVA intracommunautaire : FR37933348914
Code NAF / APE : 8121Z (Nettoyage courant des bâtiments)
Date d'immatriculation : 01/09/2024
Adresse du siège : Rue de Dublin, 59760 Grande-Synthe, France
Contact : contateliati@gmail.com

Hébergement
Hébergeur : Vercel Inc.
Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
Site web : https://vercel.com

Prestataire base de données & stockage
Service : Supabase Inc.
Adresse : 970 Toa Payoh North, #07-04, Singapore 318992
Site web : https://supabase.com
Supabase est utilisé pour l'authentification, la base de données, le stockage des médias et la gestion des formulaires.

Propriété intellectuelle
L'ensemble du contenu présent sur ce site (textes, images, graphismes, logo, icônes, vidéos, etc.) est la propriété exclusive de Leniept Atlantis, sauf mention contraire. Toute reproduction, représentation, modification ou adaptation, même partielle, est interdite sans accord préalable.
Les marques et logos cités demeurent la propriété de leurs détenteurs respectifs. L'utilisation de ces éléments sans autorisation est susceptible de constituer une contrefaçon engageant la responsabilité civile et pénale de son auteur.

Responsabilité
Les informations diffusées sur ce site sont fournies à titre indicatif. Leniept Atlantis met tout en œuvre pour assurer l'exactitude des contenus mais ne peut garantir l'absence totale d'erreurs. En cas de doute, n'hésitez pas à nous contacter à l'adresse mentionnée ci-dessus.
Le site peut contenir des liens vers des sites externes. Leniept Atlantis ne peut être tenue responsable du contenu de ces sites tiers, sur lesquels elle n'exerce aucun contrôle.`,
  cgv: `Conditions Générales de Vente

Champ d’application
Les présentes conditions générales de vente (CGV) régissent les commandes passées sur la boutique EliAti. Elles précisent les droits et obligations des parties dans le cadre de la vente de bijoux et accessoires proposés sur le site.

Produits
Les descriptions, photos et vidéos sont fournies à titre indicatif. Chaque création est réalisée à la main et peut présenter de légères variations, sans incidence sur la qualité ou l'usage.

Prix et paiement
Les prix sont exprimés en euros TTC. Le paiement s’effectue via PayPal et les moyens de paiement acceptés sur cette plateforme. La commande est validée après confirmation du règlement.

Livraison
Les envois sont effectués via Colissimo. Les délais moyens communiqués sont indicatifs. Les frais de port et l’estimation du délai apparaissent avant la confirmation de la commande.

Rétractation et retours
Conformément à la loi, l’acheteur dispose de 14 jours à réception pour se rétracter. Les bijoux personnalisés ne peuvent faire l’objet d’un retour. Contactez-nous à l’adresse ci-dessous pour organiser le renvoi.

Garanties et responsabilité
EliAti garantit la conformité des produits. La responsabilité de la marque ne saurait être engagée en cas d’usage inapproprié. Pour toute question, un service client reste disponible par email.

Service client
Pour toute demande d’information, SAV ou réclamation, écrivez à l’adresse : contateliati@gmail.com. Réponse sous 48h ouvrées.`,
  politique_confidentialite: `Politique de confidentialité

Commandes et paiement
Nous collectons vos coordonnées (nom, email, adresse) pour préparer les commandes et vous tenir informés de l'avancement. Le paiement est assuré via PayPal ; aucune donnée bancaire n'est stockée sur nos serveurs.

Gestion du compte client
Lorsque vous créez un compte ou passez une commande, vos informations sont gérées sur notre espace Supabase sécurisé. Vous pouvez à tout moment demander leur suppression ou rectification.

Communication
Votre adresse e-mail est utilisée pour vous envoyer les confirmations, les notifications liées à votre commande et répondre à vos demandes. Aucun message promotionnel n'est envoyé sans votre consentement explicite.

Prestataires et sous-traitants
Supabase Inc. : Base de données, authentification, stockage de fichiers (images produits, documents). Adresse : 970 Toa Payoh North, #07-04, Singapore 318992. Site : https://supabase.com
Vercel Inc. : Hébergement et diffusion du site web. Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Site : https://vercel.com
PayPal (Europe) S.à.r.l. et Cie, S.C.A. : Traitement des paiements. Adresse : 22-24 Boulevard Royal, L-2449 Luxembourg. Site : https://www.paypal.com

Vos droits
Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité concernant vos données. Pour exercer ces droits, écrivez-nous à contateliati@gmail.com.
Nous répondons à toute demande sous 30 jours. Vous pouvez également déposer une plainte auprès de la CNIL si vous estimez que vos droits ne sont pas respectés.

Sécurité
Nous mettons en œuvre des mesures techniques (chiffrement HTTPS, accès restreints) et organisationnelles pour protéger vos données. Malgré tout, aucun système n'est totalement sécurisé ; restez vigilants et contactez-nous en cas de suspicion d'usage frauduleux.`,
  politique_retour: `Politique de retour

Délai de rétractation
Vous disposez de 14 jours après réception pour exercer votre droit de rétractation.

Produits personnalisés
Les bijoux personnalisés ne peuvent pas être retournés.

Procédure
Contactez-nous à contateliati@gmail.com en indiquant votre numéro de commande. Nous vous indiquerons la marche à suivre.

Remboursement
Le remboursement est effectué après réception et contrôle des produits retournés.`,
  faq: `FAQ

Quels sont les délais de livraison ?
Les délais sont indiqués au moment du paiement et dépendent du transporteur choisi.

Puis-je modifier ma commande ?
Contactez-nous rapidement à contateliati@gmail.com et nous ferons le nécessaire si la commande n'est pas déjà expédiée.

Comment entretenir les bijoux ?
Évitez le contact avec l'eau et les parfums, et rangez vos bijoux à l'abri de l'humidité.`,
}
