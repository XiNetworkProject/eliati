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
