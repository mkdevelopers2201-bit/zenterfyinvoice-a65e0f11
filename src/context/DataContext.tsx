import React, { createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Customer, Item, Invoice } from '@/types/invoice';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DataContextType {
  customers: Customer[];
  items: Item[];
  invoices: Invoice[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addItem: (item: Omit<Item, 'id' | 'createdAt'>) => Item;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getCustomerByName: (name: string) => Customer | undefined;
  getItemByName: (name: string) => Item | undefined;
  getNextInvoiceNumber: () => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('invoice-customers', []);
  const [items, setItems] = useLocalStorage<Item[]>('invoice-items', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoice-invoices', []);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCustomers(prev => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  const addItem = (item: Omit<Item, 'id' | 'createdAt'>): Item => {
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  const updateItem = (id: string, item: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice => {
    const now = new Date().toISOString();
    const newInvoice: Invoice = {
      ...invoice,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };
    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  };

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoice, updatedAt: new Date().toISOString() } : i));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const getCustomerByName = (name: string): Customer | undefined => {
    return customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  };

  const getItemByName = (name: string): Item | undefined => {
    return items.find(i => i.name.toLowerCase() === name.toLowerCase());
  };

  const getNextInvoiceNumber = (): string => {
    const currentYear = new Date().getFullYear();
    const yearInvoices = invoices.filter(inv => inv.invoiceNumber.includes(`INV-${currentYear}`));
    const nextNum = yearInvoices.length + 1;
    return `INV-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  };

  return (
    <DataContext.Provider value={{
      customers,
      items,
      invoices,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addItem,
      updateItem,
      deleteItem,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      getCustomerByName,
      getItemByName,
      getNextInvoiceNumber,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
