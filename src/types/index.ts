export enum UserRole {
  ELEVEUR = 'ELEVEUR',
  ACHETEUR = 'ACHETEUR',
  ADMIN = 'ADMIN'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentProvider {
  WAVE = 'WAVE',
  ORANGE_MONEY = 'ORANGE_MONEY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum ListingStatus {
  ACTIVE = 'ACTIVE',
  VENDU = 'VENDU',
  EXPIRE = 'EXPIRE'
}

export enum AnimalSex {
  MALE = 'MALE',
  FEMELLE = 'FEMELLE'
}

export enum AuctionStatus {
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE',
  ANNULE = 'ANNULE'
}

export enum CategoryType {
  BOVINS = 'BOVINS',
  OVINS = 'OVINS',
  CAPRINS = 'CAPRINS',
  VOLAILLES = 'VOLAILLES',
  EQUINS = 'EQUINS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Category {
  id: string;
  type: CategoryType;
  name: string;
  icon?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  status: ListingStatus;
  userId: string;
  categoryId: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  sex?: AnimalSex;
  weight?: number;
  age?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Subscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  startDate: string | Date;
  endDate: string | Date;
  price: number;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string | Date;
}
