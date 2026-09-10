import { z } from 'zod';

// ==========================================
// VALIDATION - INSCRIPTION / CONNEXION
// ==========================================

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  email: z
    .string()
    .email('Adresse email invalide'),
  phone: z
    .string()
    .regex(/^\+?[0-9]{8,15}$/, 'Numéro de téléphone invalide')
    .optional(),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z
    .string(),
  role: z
    .enum(['ELEVEUR', 'ACHETEUR'], {
      message: 'Veuillez choisir un rôle valide',
    }),
  idCardNumber: z.string().optional(),
  idCardFront: z.string().url('URL invalide').optional(),
  idCardBack: z.string().url('URL invalide').optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Veuillez entrer votre mot de passe'),
});

// ==========================================
// VALIDATION - ANNONCES
// ==========================================

export const listingSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z
    .string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  price: z
    .number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(100000000, 'Le prix est trop élevé'),
  currency: z
    .string()
    .default('XOF'),
  categoryId: z
    .string()
    .min(1, 'Veuillez choisir une catégorie'),
  breed: z
    .string()
    .min(1, 'Veuillez préciser la race de l\'animal')
    .max(50, 'La race ne peut pas dépasser 50 caractères'),
  age: z
    .number()
    .min(0, 'L\'âge ne peut pas être négatif'),
  weight: z
    .number()
    .min(1, 'Le poids doit être supérieur à 0 kg'),
  sex: z
    .enum(['MALE', 'FEMELLE'])
    .optional(),
  quantity: z
    .number()
    .int()
    .min(1, 'La quantité minimale est 1')
    .default(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'Veuillez indiquer la localisation de l\'animal'),
  images: z.array(z.string()).optional(),
});

// ==========================================
// VALIDATION - ENCHÈRES
// ==========================================

export const auctionSchema = z.object({
  listingId: z.string().min(1, "Veuillez sélectionner une annonce"),
  startPrice: z.number().min(1, 'Le prix de départ doit être supérieur à 0'),
  minIncrement: z.number().min(100, "L'incrément minimum est de 100 FCFA").default(500),
  endDate: z.string().refine((date) => new Date(date) > new Date(), {
    message: "La date de fin doit être dans le futur",
  }),
});

export const bidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.number().min(1, 'Le montant doit être supérieur à 0'),
});

// ==========================================
// VALIDATION - MESSAGERIE
// ==========================================

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().max(2000).optional(),
  audioUrl: z.string().url().optional(),
}).refine((data) => data.content || data.audioUrl, {
  message: 'Un message doit contenir du texte ou un audio',
});

// ==========================================
// VALIDATION - AVIS
// ==========================================

export const reviewSchema = z.object({
  reviewedId: z.string().min(1),
  rating: z.number().int().min(1, 'Note minimale : 1').max(5, 'Note maximale : 5'),
  comment: z.string().max(1000, 'Le commentaire ne peut pas dépasser 1000 caractères').optional(),
});

// ==========================================
// TYPES INFÉRÉS
// ==========================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ListingInput = z.infer<typeof listingSchema>;
export type AuctionInput = z.infer<typeof auctionSchema>;
export type BidInput = z.infer<typeof bidSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
