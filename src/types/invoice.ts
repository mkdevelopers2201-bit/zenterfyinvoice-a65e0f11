export interface Customer {
  id: string;
  name: string;
  gstin: string;
  address: string;
  createdAt: string;
}

export interface Item {
  id: string;
  name: string;
  hsnCode: string;
  rate: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  itemId?: string;
  name: string;
  hsnCode: string;
  rate: number;
  qty: number;
  tax: number;
  amount: number;
}

export interface Invoice {
  id: string;
  customerId?: string;
  customerName: string;
  gstin: string;
  address: string;
  invoiceNumber: string;
  date: string;
  po: string;
  items: InvoiceItem[];
  withoutGst: number;
  gstAmount: number;
  grandTotal: number;
  status: 'paid' | 'pending';
  createdAt: string;
  updatedAt: string;
}
