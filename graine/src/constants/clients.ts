/** Clients scannés affichés sur la page « Compte pro ». */

export type Client = {
  id: string;
  name: string;
  /** Date/heure du scan, déjà formatée pour l'affichage. */
  scannedAt: string;
  discount: string;
  priceBefore: string;
  priceAfter: string;
  /** Couleur de l'avatar (placeholder, faute de photo). */
  avatarColor: string;
};

export const CLIENTS: Client[] = [
  {
    id: 'orlane',
    name: 'Orlane',
    scannedAt: '13/02/2025 à 12h05',
    discount: '10%',
    priceBefore: '20€',
    priceAfter: '2€',
    avatarColor: '#9FB3C8',
  },
  {
    id: 'mathieu',
    name: 'Mathieu',
    scannedAt: '12/02/2025 à 18h42',
    discount: '15%',
    priceBefore: '32€',
    priceAfter: '27€',
    avatarColor: '#5C8A7B',
  },
  {
    id: 'chris',
    name: 'Chris',
    scannedAt: '11/02/2025 à 09h17',
    discount: '5%',
    priceBefore: '14€',
    priceAfter: '13€',
    avatarColor: '#B0A8B9',
  },
  {
    id: 'chloe',
    name: 'Chloé',
    scannedAt: '10/02/2025 à 16h30',
    discount: '20%',
    priceBefore: '50€',
    priceAfter: '40€',
    avatarColor: '#C9A27E',
  },
  {
    id: 'lola',
    name: 'Lola',
    scannedAt: '09/02/2025 à 11h58',
    discount: '10%',
    priceBefore: '18€',
    priceAfter: '16€',
    avatarColor: '#8FA876',
  },
];
