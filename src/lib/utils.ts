import { type ClassValue, clsx } from 'clsx';

import { twMerge } from 'tailwind-merge';

/**
 * Combine des classes CSS avec gestion des conflits Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater un prix avec la devise
 */
export function formatPrice(price: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Formater une date en français
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formater une date relative (il y a X jours)
 */
export function formatRelativeDate(date: Date | string): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  return "à l'instant";
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Générer un slug à partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Vérifier si un abonnement est actif
 */
export function isSubscriptionActive(endDate: Date | string): boolean {
  return new Date(endDate) > new Date();
}

/**
 * Obtenir les initiales d'un nom
 */
export function getInitials(name: string | undefined): string {
  if (!name) return '??';
  
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Catégories d'animaux avec leurs métadonnées
 */
export const ANIMAL_CATEGORIES = [
  { name: 'Bovins', slug: 'bovins', icon: '🐄', description: 'Vaches, taureaux, veaux' },
  { name: 'Ovins', slug: 'ovins', icon: '🐑', description: 'Moutons, béliers, agneaux' },
  { name: 'Caprins', slug: 'caprins', icon: '🐐', description: 'Chèvres, boucs, chevreaux' },
  { name: 'Volailles', slug: 'volailles', icon: '🐔', description: 'Poulets, dindes, canards' },
  { name: 'Équins', slug: 'equins', icon: '🐴', description: 'Chevaux, ânes, poneys' },
] as const;

/**
 * Prix de l'abonnement en FCFA
 */
export const SUBSCRIPTION_PRICE = 2000;
export const SUBSCRIPTION_CURRENCY = 'XOF';
export const SUBSCRIPTION_DURATION_DAYS = 30;
