/**
 * Offres de réduction — source unique partagée par la liste « Mes tickets
 * avantages » et les pins de la carte (rapprochés par `brand`).
 */
export type Offer = {
  id: string;
  brand: string;
  source: number;
  discount: number;
  distance: string;
};

export const OFFERS: Offer[] = [
  { id: 'biocoop', brand: 'Biocoop', source: require('@/assets/images/ticket_bleu.png'), discount: 30, distance: '200m' },
  { id: 'naturalia', brand: 'Naturalia', source: require('@/assets/images/ticket_rose.png'), discount: 20, distance: '450m' },
  { id: 'kusmi', brand: 'Kusmi Tea', source: require('@/assets/images/ticket_vert.png'), discount: 20, distance: '1,2km' },
];

export const offerForBrand = (brand: string) => OFFERS.find((o) => o.brand === brand);
