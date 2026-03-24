export type OrderStatus = 'new' | 'preparing' | 'done';
export type UserRole = 'saas_owner' | 'admin' | 'bar';

export interface Establishment {
  id: string;
  name: string;
  isActive: boolean;
  settings: {
    whatsappNumber: string;
  };
  createdAt: any;
}

export interface Product {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  category: string;
}

export interface Camarote {
  id: string;
  establishmentId: string;
  name: string;
  slug: string;
  totalSpent: number;
  isActive: boolean;
  createdAt: any;
  lastOrderAt?: any;
}

export interface Challenge {
  id: string;
  establishmentId: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  type: 'value' | 'product';
  value?: number;
  productName?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: any;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  establishmentId: string;
  camaroteId: string;
  camaroteName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  notes?: string;
  createdAt: any;
}

export interface Promotion {
  id: string;
  establishmentId: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: any;
}

export interface Staff {
  id: string;
  establishmentId: string;
  name: string;
  role: string;
  whatsapp: string;
  responsibility: string;
  isActive: boolean;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  establishmentId?: string; // Optional for saas_owner
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
