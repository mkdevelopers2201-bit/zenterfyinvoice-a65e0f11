import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Item, Invoice } from '@/types/invoice';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

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
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;
  getItemById: (id: string) => Item | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getCustomerByName: (name: string) => Customer | undefined;
  getItemByName: (name: string) => Item | undefined;
  getNextInvoiceNumber: () => string;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>('invoice-customers', []);
  const [items, setItems] = useLocalStorage<Item[]>('invoice-items', []);
  const [invoices, setInvoices] = useLocalStorage<Invoice[]>('invoice-invoices', []);
  const [isLoading, setIsLoading] = useState(false);

  // Generate next invoice number based on existing invoices
  const getNextInvoiceNumber = () => {
    if (invoices.length === 0) {
      return 'INV-001';
    }
    
    // Extract numeric parts from invoice numbers and find max
    const numbers = invoices.map(inv => {
      const match = inv.invoiceNumber.match(/(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `INV-${String(nextNumber).padStart(3, '0')}`;
  };

  // Customer Actions
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setCustomers([newCustomer, ...customers]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updatedFields: Partial<Customer>) => {
    setCustomers(customers.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };

  // Item Actions
  const addItem = (item: Omit<Item, 'id' | 'createdAt'>): Item => {
    const newItem: Item = {
      ...item,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setItems([newItem, ...items]);
    return newItem;
  };

  const updateItem = (id: string, updatedFields: Partial<Item>) => {
    setItems(items.map(i => (i.id === id ? { ...i, ...updatedFields } : i)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Invoice Actions
  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoice,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setInvoices([newInvoice, ...invoices]);
    return newInvoice;
  };

  const updateInvoice = (id: string, updatedFields: Partial<Invoice>) => {
    setInvoices(invoices.map(inv => (inv.id === id ? { ...inv, ...updatedFields } : inv)));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  // Helper selectors
  const getCustomerById = (id: string) => customers.find(c => c.id === id);
  const getItemById = (id: string) => items.find(i => i.id === id);
  const getInvoiceById = (id: string) => invoices.find(inv => inv.id === id);
  const getCustomerByName = (name: string) => 
    customers.find(c => c.name.toLowerCase() === name.toLowerCase());
  const getItemByName = (name: string) => 
    items.find(i => i.name.toLowerCase() === name.toLowerCase());

  return (
    <DataContext.Provider value={{
      customers, items, invoices,
      addCustomer, updateCustomer, deleteCustomer,
      addItem, updateItem, deleteItem,
      addInvoice, updateInvoice, deleteInvoice,
      getCustomerById, getItemById, getInvoiceById,
      getCustomerByName, getItemByName,
      getNextInvoiceNumber,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
