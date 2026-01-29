import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export function generateInvoicePDF(invoice: Invoice): void {
  // Calculate totals
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  // Generate item rows HTML
  const itemRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td class="border-r py-2 px-1 text-center">${index + 1}</td>
      <td class="border-r py-2 px-2">${item.name}</td>
      <td class="border-r py-2 px-1 text-center">${item.hsnCode || '-'}</td>
      <td class="border-r py-2 px-1 text-center">${item.qty}</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.rate)}</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.amount)}</td>
      <td class="border-r py-2 px-1 text-center">${item.cgstPercent}%</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.cgstAmount)}</td>
      <td class="border-r py-2 px-1 text-center">${item.sgstPercent}%</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.sgstAmount)}</td>
      <td class="py-2 px-1 text-right font-medium">${formatNumber(item.total)}</td>
    </tr>
  `).join('');

  // Increased to 24 rows to fill the A4 page height properly
  const emptyRowsCount = Math.max(0, 24 - invoice.items.length);
  const emptyRowsHTML = Array.from({ length: emptyRowsCount }).map(() => `
    <tr>
      <td class="border-r h-8">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm 10mm 15mm 10mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
    }
    
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #000;
      margin-bottom: 8px;
    }
    
    .company-name {
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    
    .company-tagline {
      text-align: center;
      font-size: 10px;
      margin-bottom: 2px;
    }
    
    .company-address {
      text-align: center;
      font-size: 9px;
    }
    
    .tax-invoice-title {
      text-align: center;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 6px 0;
      margin-bottom: 12px;
    }
    
    .tax-invoice-title h2 {
      font-size: 16px;
      font-weight: bold;
      text-transform: uppercase;
    }
    
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    
    .info-right { text-align: right; }
    .info-label { font-weight: bold; }
    
    .items-table-container {
      border: 1px solid #000;
      margin-bottom: 12px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    .items-table th, .items-table td {
      border: 1px solid #000;
      padding: 4px 3px;
    }
    
    .items-table thead tr { background-color: #f0f0f0; }
    
    .grand-total-row {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    .summary-section {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .gst-summary-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    
    .gst-summary-table td, .gst-summary-table th {
      border: 1px solid #000;
      padding: 4px;
    }
    
    .footer-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      border-top: 1px solid #000;
      padding-top: 12px;
    }
    
    .signature-section { text-align: right; }
    .company-for { font-weight: bold; margin-bottom: 40px; }
    
    @media print {
      body { margin: 0; }
      .invoice-container { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div class="header-top">
        <span>GSTIN - 24CMAPK3117Q1ZZ</span>
        <span>Mobile - 7990713846</span>
      </div>
      <div class="company-name">S. K. ENTERPRISE</div>
      <div class="company-tagline">TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS</div>
      <div class="company-address">SHOP NO 28, GOLDEN POINT, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005</div>
    </div>

    <div class="tax-invoice-title"><h2>Tax - Invoice</h2></div>

    <div class="info-section">
      <div class="info-left">
        <p><span class="info-label">M/s -</span> ${invoice.customerName}</p>
        <p><span class="info-label">Address -</span> ${invoice.address || '-'}</p>
        <p><span class="info-label">GSTIN No -</span> ${invoice.gstin || '-'}</p>
      </div>
      <div class="info-right">
        <p><span class="info-label">Invoice Number:</span> ${invoice.invoiceNumber}</p>
        <p><span class="info-label">Date:</span> ${format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
        <p><span class="info-label">Order No.:</span> ${invoice.po || '-'}</p>
      </div>
    </div>

    <div class="items-table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th rowspan="2">Sr.</th>
            <th rowspan="2">Particulars</th>
            <th rowspan="2">HSN</th>
            <th rowspan="2">QTY</th>
            <th rowspan="2">RATE</th>
            <th rowspan="2">AMOUNT</th>
            <th colspan="2">CGST</th>
            <th colspan="2">SGST</th>
            <th rowspan="2">TOTAL</th>
          </tr>
          <tr>
            <th>%</th><th>AMT</th><th>%</th><th>AMT</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHTML}
          ${emptyRowsHTML}
          <tr class="grand-total-row">
            <td colspan="5" style="text-align: right">Grand Total</td>
            <td style="text-align: right">${formatNumber(totals.amount)}</td>
            <td></td>
            <td style="text-align: right">${formatNumber(totals.cgstAmount)}</td>
            <td></td>
            <td style="text-align: right">${formatNumber(totals.sgstAmount)}</td>
            <td style="text-align: right">${formatNumber(totals.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary-section">
      <div>
        <p><strong>Amount (In words):</strong> RUPEES - ${numberToWords(totals.total)} ONLY</p>
      </div>
      <table class="gst-summary-table">
        <tr><td>CGST</td><td align="right">${formatCurrency(totals.cgstAmount)}</td></tr>
        <tr><td>SGST</td><td align="right">${formatCurrency(totals.sgstAmount)}</td></tr>
        <tr style="background:#f0f0f0"><td><strong>TOTAL TAX</strong></td><td align="right"><strong>${formatCurrency(invoice.gstAmount)}</strong></td></tr>
      </table>
    </div>

    <div class="footer-section">
      <div class="terms">
        <strong>Terms & Conditions:</strong>
        <p>1. Goods dispatched at buyer's risk.</p>
        <p>2. Interest @ 12% if not paid in 7 days.</p>
        <p>3. Subject to JAMNAGAR Jurisdiction.</p>
      </div>
      <div class="signature-section">
        <p class="company-for">For S. K. Enterprise</p>
        <br/><br/>
        <p>Authorised Signature</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
