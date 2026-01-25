// Enums
export type DocumentType = "Cedula" | "Ruc";
export type PaymentType = "Efectivo" | "Transferencia";

// Request DTOs
export interface ClientRequestDto {
  name: string;
  documentNumber?: string | null;
  email?: string | null;
  address?: string | null;
  number?: string | null;
  documentType?: DocumentType;
}

export interface BarProductRequestDto {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface BarOrderRequestDto {
  transactionId?: string | null;
}

export interface BarOrderDetailCreateRequestDto {
  barProductId: string;
  unitPrice: number;
  qty: number;
}

export interface BarOrderDetailUpdateRequestDto {
  unitPrice?: number;
  qty?: number;
}

export interface OpenCashBoxRequestDto {
  openingBalance: number;
}

export interface CloseCashBoxRequestDto {
  closingBalance?: number | null;
  notes?: string | null;
}

export interface TransactionRequestDto {
  clientId: string;
}

export interface PaymentRequestDto {
  total: number;
  type: PaymentType;
  transactionId: string;
}

export interface AccessCardRequestDto {
  transactionId?: string | null;
  total?: number;
  uses?: number;
}

export interface KeyRequestDto {
  lastAssignedTo?: string | null;
  available?: boolean;
  notes?: string | null;
  lastAssignedAt?: string | null;
}

export interface ParkingRequestDto {
  transactionId?: string | null;
  entryTime?: string;
  exitTime?: string | null;
}

export interface EntranceTransactionRequestDto {
  transactionId?: string | null;
  entryTime?: string;
  exitTime?: string | null;
  numberAdults?: number;
  numberChildren?: number;
  numberSeniors?: number;
  numberDisabled?: number;
}

export interface EntranceAccessCardRequestDto {
  accessCardId?: string;
  entranceDate?: string;
  entranceEntryTime?: string;
  entranceExitTime?: string | null;
}

// Response types (inferred from backend domain)
export interface Client {
  id: string;
  name: string;
  documentNumber?: string | null;
  email?: string | null;
  address?: string | null;
  number?: string | null;
  documentType?: DocumentType;
}

export interface BarProduct {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface BarOrderDetail {
  barOrderId: string;
  barProductId: string;
  barProduct?: BarProduct;
  unitPrice: number;
  qty: number;
}

export interface BarOrder {
  id: string;
  transactionId?: string | null;
  total: number;
  createdAt: string;
  details?: BarOrderDetail[];
}

export interface CashBox {
  id: string;
  status: "Open" | "Closed";
  openingBalance: number;
  closingBalance?: number | null;
  openedAt: string;
  closedAt?: string | null;
  notes?: string | null;
}

export interface CashBoxSummary {
  cashBox: CashBox;
  totalTransactions: number;
  openTransactions: number;
  closedTransactions: number;
  totalPayments: number;
  paymentsByType: Record<PaymentType, number>;
}

export interface Transaction {
  id: string;
  clientId: string;
  client?: Client;
  cashBoxId: string;
  status: "Open" | "Closed";
  openedAt: string;
  closedAt?: string | null;
  payments?: Payment[];
  transactionItems?: TransactionItem[];
}

export interface Payment {
  id: string;
  total: number;
  type: PaymentType;
  transactionId: string;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  transactionId?: string | null;
  total: number;
  createdAt: string;
  transactionType: string;
}

export interface AccessCard extends TransactionItem {
  uses: number;
}

export interface Key {
  id: string;
  keyCode: string;
  lastAssignedTo?: string | null;
  lastAssignedAt?: string | null;
  available: boolean;
  notes?: string | null;
}

export interface Parking extends TransactionItem {
  entryTime: string;
  exitTime?: string | null;
}

export interface EntranceTransaction extends TransactionItem {
  entryTime: string;
  exitTime?: string | null;
  numberAdults: number;
  numberChildren: number;
  numberSeniors: number;
  numberDisabled: number;
}

export interface EntranceAccessCard {
  id: string;
  accessCardId: string;
  accessCard?: AccessCard;
  entranceDate: string;
  entranceEntryTime: string;
  entranceExitTime?: string | null;
}
