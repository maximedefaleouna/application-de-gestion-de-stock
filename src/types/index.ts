export type UserRole = 'admin' | 'seller';

export type PaymentMethod = 'cash' | 'mobile_money' | 'card' | 'credit';

export type SaleStatus = 'completed' | 'credit' | 'partial' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  reference: string;
  description: string;
  category: string;
  brand: string;
  compatibleVehicles: string[];
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  imageUrl: string;
  available: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  clientId: string;
  clientName: string;
  clientPhone: string;
  isCredit: boolean;
  seller: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalCredit: number;
  totalPaid: number;
  createdAt: Date;
}

export interface CreditPayment {
  id: string;
  clientId: string;
  saleId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: Date;
}

export interface User {
  id: string;
  name: string; // Kept for backward compatibility (computed from firstName + lastName)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  active: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface Notification {
  id: string;
  type: 'sale' | 'stock' | 'credit' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  totalRevenue: number;
  todayRevenue: number;
  lowStockCount: number;
  totalCredits: number;
  pendingCredits: number;
  topProducts: { name: string; count: number }[];
}
