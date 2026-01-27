// lib/api/types.ts

// Enums
export type DocumentType = "Cedula" | "Ruc";
export type PaymentType = "Efectivo" | "Transferencia";

// Auth types
export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface RefreshTokenRequestDto {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  username: string;
  roles: string[];
}

export interface AuthUser {
  username: string;
  roles: string[];
  expiresAt: Date;
}

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

/**
 * ✅ FIX: el backend requiere CashBoxId para crear Transacciones.
 * Si tu backend lo hace obligatorio, mantenlo obligatorio aquí también.
 */
export interface TransactionRequestDto {
  clientId: string;
  cashBoxId: string; // ✅ agregar
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
  transactionId?: string | null;
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
  qty?: number;
}

// Response types
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
  totalCharges: number;
  totalPayments: number;
  cash: number;
  transfer: number;
  openTransactions: number;
  closedTransactions: number;
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
  transactionId?: string | null;
  transaction?: Transaction | null;
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
  qty?: number;
  entryTime?: string;
  exitTime?: string | null;
}

// Transaction Detail (for POS view)
export interface TransactionDetail {
  transaction: Transaction;
  entrances: EntranceTransaction[];
  parkings: Parking[];
  barOrders: BarOrder[];
  accessCards: AccessCard[];
  keys: Key[];
  totalCharges: number;
  totalPayments: number;
  pendingBalance: number;
}

// Analyst bot service types
export interface AnalystAnalysisRequestDto {
  prompt: string;
  exclude_tables?: string[] | null;
  max_queries?: number | null;
}

export interface QueryResult {
  query_id: string;
  purpose: string;
  sql_query: string;
  data: Record<string, unknown>[];
  row_count: number;
  error: string | null;
}

export interface AnalysisMetadata {
  total_queries: number;
  successful_queries: number;
  total_rows: number;
  execution_time_ms: number;
}

export interface MultiQueryAnalysisResponse {
  analysis: string;
  queries: QueryResult[];
  metadata: AnalysisMetadata;
}
