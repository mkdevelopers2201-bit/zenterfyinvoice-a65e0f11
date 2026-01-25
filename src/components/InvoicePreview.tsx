import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-card p-8 rounded-lg shadow-sm border" id="invoice-preview">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
          <p className="text-muted-foreground mt-1">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Date</p>
          <p className="font-medium">{format(new Date(invoice.date), 'dd MMM yyyy')}</p>
          {invoice.po && (
            <>
              <p className="text-sm text-muted-foreground mt-2">PO Number</p>
              <p className="font-medium">{invoice.po}</p>
            </>
          )}
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Bill To</p>
        <h2 className="text-xl font-semibold">{invoice.customerName}</h2>
        {invoice.gstin && (
          <p className="text-sm text-muted-foreground">GSTIN: {invoice.gstin}</p>
        )}
        {invoice.address && (
          <p className="text-sm text-muted-foreground mt-1">{invoice.address}</p>
        )}
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left py-3 px-2">#</th>
              <th className="text-left py-3 px-2">Item</th>
              <th className="text-left py-3 px-2">HSN</th>
              <th className="text-right py-3 px-2">Rate</th>
              <th className="text-right py-3 px-2">Qty</th>
              <th className="text-right py-3 px-2">Tax %</th>
              <th className="text-right py-3 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b">
                <td className="py-3 px-2">{index + 1}</td>
                <td className="py-3 px-2 font-medium">{item.name}</td>
                <td className="py-3 px-2">{item.hsnCode || '-'}</td>
                <td className="py-3 px-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 px-2 text-right">{item.qty}</td>
                <td className="py-3 px-2 text-right">{item.tax}%</td>
                <td className="py-3 px-2 text-right font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.withoutGst)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">GST</span>
            <span>{formatCurrency(invoice.gstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Grand Total</span>
            <span className="text-primary">{formatCurrency(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <p>Thank you for your business!</p>
      </div>
    </div>
  );
}
