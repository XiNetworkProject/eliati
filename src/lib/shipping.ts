type WeightBracket = {
  max: number
  price: number
}

export type ShippingOption = {
  id: string
  label: string
  description: string
  delay: string
  weightBrackets: WeightBracket[]
  insurance?: string
  freeAbove?: number
}

export const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'colissimo',
    label: 'Colissimo Suivi',
    description: 'Tarifs officiels Colissimo La Poste (France métropolitaine).',
    delay: '48h ouvrées',
    weightBrackets: [
      { max: 250, price: 4.18 },
      { max: 500, price: 6.68 },
      { max: 750, price: 7.57 },
      { max: 1000, price: 8.1 },
      { max: 2000, price: 9.35 },
      { max: 5000, price: 14.1 },
      { max: 10000, price: 21.2 },
      { max: 30000, price: 32.7 },
      { max: Number.MAX_SAFE_INTEGER, price: 32.7 },
    ],
    freeAbove: 100,
    insurance: "Assurance Colissimo incluse jusqu'à 200 €",
  },
  {
    id: 'mondial_relay_point',
    label: 'Mondial Relay – Point Relais',
    description: 'Retrait en point relais partenaire Mondial Relay.',
    delay: '3 à 5 jours ouvrés',
    weightBrackets: [
      { max: 500, price: 4.4 },
      { max: 1000, price: 5.2 },
      { max: 2000, price: 6.0 },
      { max: 3000, price: 6.9 },
      { max: 5000, price: 8.1 },
      { max: 7000, price: 10.4 },
      { max: 10000, price: 12.9 },
      { max: 15000, price: 16.4 },
      { max: 20000, price: 19.9 },
      { max: 30000, price: 24.9 },
      { max: Number.MAX_SAFE_INTEGER, price: 24.9 },
    ],
    freeAbove: 100,
    insurance: 'Assurance jusqu’à 25 € comprise (options supplémentaires disponibles).',
  },
  {
    id: 'mondial_relay_locker',
    label: 'Mondial Relay – Locker',
    description: 'Retrait en consigne automatique (Locker) Mondial Relay.',
    delay: '3 à 5 jours ouvrés',
    weightBrackets: [
      { max: 500, price: 4.6 },
      { max: 1000, price: 5.4 },
      { max: 2000, price: 6.2 },
      { max: 3000, price: 7.1 },
      { max: 5000, price: 8.3 },
      { max: 7000, price: 10.6 },
      { max: 10000, price: 13.1 },
      { max: 15000, price: 16.6 },
      { max: 20000, price: 20.1 },
      { max: 30000, price: 25.1 },
      { max: Number.MAX_SAFE_INTEGER, price: 25.1 },
    ],
    freeAbove: 100,
    insurance: 'Assurance jusqu’à 25 € comprise (options supplémentaires disponibles).',
  },
  {
    id: 'mondial_relay_home',
    label: 'Mondial Relay – Domicile',
    description: 'Livraison à domicile avec remise contre signature.',
    delay: '2 à 4 jours ouvrés',
    weightBrackets: [
      { max: 500, price: 7.18 },
      { max: 1000, price: 8.0 },
      { max: 2000, price: 9.5 },
      { max: 3000, price: 11.5 },
      { max: 5000, price: 13.5 },
      { max: 7000, price: 15.5 },
      { max: 10000, price: 19.0 },
      { max: 15000, price: 23.0 },
      { max: 20000, price: 28.0 },
      { max: 30000, price: 35.0 },
      { max: Number.MAX_SAFE_INTEGER, price: 35.0 },
    ],
    freeAbove: 100,
    insurance: 'Assurance jusqu’à 25 € comprise (options supplémentaires disponibles).',
  },
]

export function findWeightBracket(option: ShippingOption, weightGrams: number): WeightBracket {
  const safeWeight = Number.isFinite(weightGrams) && weightGrams > 0 ? weightGrams : 0
  return (
    option.weightBrackets.find((bracket) => safeWeight <= bracket.max) ||
    option.weightBrackets[option.weightBrackets.length - 1]
  )
}

export function calculateShippingPrice(
  option: ShippingOption,
  subtotal: number,
  weightGrams: number
) {
  if (!option) return 0
  if (option.freeAbove !== undefined && subtotal >= option.freeAbove) {
    return 0
  }
  const bracket = findWeightBracket(option, weightGrams)
  return Number(bracket.price.toFixed(2))
}
