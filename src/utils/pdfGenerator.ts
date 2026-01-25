import { jsPDF } from 'jspdf';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [22, 163, 74]; // Green
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];

  // Header
  doc.setFontSize(28);
  doc.setTextColor(...primaryColor);
  doc.text('INVOICE', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text(invoice.invoiceNumber, 20, 38);

  // Date & PO
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text('Date:', pageWidth - 50, 25);
  doc.text(format(new Date(invoice.date), 'dd MMM yyyy'), pageWidth - 50, 32);
  
  if (invoice.po) {
    doc.text('PO:', pageWidth - 50, 42);
    doc.text(invoice.po, pageWidth - 50, 49);
  }

  // Line
  doc.setDrawColor(229, 231, 235);
  doc.line(20, 50, pageWidth - 20, 50);

  // Bill To
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text('Bill To:', 20, 62);
  
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.text(invoice.customerName, 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  let yPos = 78;
  if (invoice.gstin) {
    doc.text(`GSTIN: ${invoice.gstin}`, 20, yPos);
    yPos += 6;
  }
  if (invoice.address) {
    const addressLines = doc.splitTextToSize(invoice.address, 80);
    doc.text(addressLines, 20, yPos);
    yPos += addressLines.length * 6;
  }

  // Table Header
  yPos = Math.max(yPos + 10, 95);
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos, pageWidth - 40, 10, 'F');
  
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text('#', 22, yPos + 7);
  doc.text('Item', 30, yPos + 7);
  doc.text('HSN', 85, yPos + 7);
  doc.text('Rate', 105, yPos + 7);
  doc.text('Qty', 130, yPos + 7);
  doc.text('Tax', 148, yPos + 7);
  doc.text('Amount', 165, yPos + 7);

  // Table Rows
  yPos += 15;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  invoice.items.forEach((item, index) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setTextColor(...textColor);
    doc.text(String(index + 1), 22, yPos);
    doc.text(item.name.substring(0, 25), 30, yPos);
    doc.text(item.hsnCode || '-', 85, yPos);
    doc.text(formatCurrency(item.rate), 105, yPos);
    doc.text(String(item.qty), 130, yPos);
    doc.text(`${item.tax}%`, 148, yPos);
    doc.text(formatCurrency(item.amount), 165, yPos);
    
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos + 3, pageWidth - 20, yPos + 3);
    yPos += 10;
  });

  // Totals
  yPos += 10;
  const totalsX = pageWidth - 75;
  
  doc.setTextColor(...mutedColor);
  doc.text('Subtotal:', totalsX, yPos);
  doc.setTextColor(...textColor);
  doc.text(formatCurrency(invoice.withoutGst), totalsX + 35, yPos);
  
  yPos += 8;
  doc.setTextColor(...mutedColor);
  doc.text('GST:', totalsX, yPos);
  doc.setTextColor(...textColor);
  doc.text(formatCurrency(invoice.gstAmount), totalsX + 35, yPos);
  
  yPos += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(totalsX, yPos, pageWidth - 20, yPos);
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('Grand Total:', totalsX, yPos);
  doc.text(formatCurrency(invoice.grandTotal), totalsX + 35, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(...mutedColor);
  doc.text('Thank you for your business!', pageWidth / 2, 280, { align: 'center' });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
