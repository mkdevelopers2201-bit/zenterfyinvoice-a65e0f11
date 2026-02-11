import { Invoice } from "@/types/invoice";
import { numberToWords } from "./numberToWords";

export const generateInvoicePDF = (invoice: Invoice) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Calculate totals for the items table
  const totals = invoice.items.reduce((acc, item) => ({
    amount: acc.amount + (item.qty * item.rate),
    cgstAmount: acc.cgstAmount + (item.cgstAmount || 0),
    sgstAmount: acc.sgstAmount + (item.sgstAmount || 0)
  }), { amount: 0, cgstAmount: 0, sgstAmount: 0 });

  // Group items by GST rate for the tax table
  const gstSlabs = invoice.items.reduce((acc: any, item) => {
    const rate = item.cgstPercent + item.sgstPercent;
    if (!acc[rate]) {
      acc[rate] = { hsn: item.hsnCode, cgstRate: item.cgstPercent, cgstTax: 0, sgstRate: item.sgstPercent, sgstTax: 0, total: 0 };
    }
    acc[rate].cgstTax += item.cgstAmount || 0;
    acc[rate].sgstTax += item.sgstAmount || 0;
    acc[rate].total += (item.cgstAmount || 0) + (item.sgstAmount || 0);
    return acc;
  }, {});

  const gstSlabRowsHTML = Object.entries(gstSlabs).map(([rate, data]: [string, any]) => `
    <tr>
      <td>${data.hsn || '-'}</td>
      <td>${data.cgstRate}%</td>
      <td>${formatNumber(data.cgstTax)}</td>
      <td>${data.sgstRate}%</td>
      <td>${formatNumber(data.sgstTax)}</td>
      <td>${formatNumber(data.total)}</td>
    </tr>
  `).join('');

  const itemsRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td style="width: 40px;">${index + 1}</td>
      <td class="particulars-cell">${item.name}</td>
      <td>${item.hsnCode || '-'}</td>
      <td>${item.qty}</td>
      <td>${formatNumber(item.rate)}</td>
      <td class="amt">${formatNumber(item.qty * item.rate)}</td>
    </tr>
  `).join('');

  // Fixed Bank Account to String to avoid .00 decimals
  const bankAccountNumber = "2402212258785540";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: sans-serif; font-size: 11px; margin: 0; padding: 0; color: #000; }
        .invoice-container { width: 100%; border: 1px solid #000; }
        
        /* Header Section */
        .top-header { text-align: center; border-bottom: 1px solid #000; padding: 5px; }
        .company-name { font-size: 22px; font-weight: bold; margin: 0; }
        .company-address { font-size: 10px; margin: 2px 0; }
        
        .billing-header { display: flex; width: 100%; border-bottom: 1px solid #000; }
        .billing-box { width: 50%; padding: 5px; border-right: 1px solid #000; }
        .details-box { width: 50%; padding: 5px; }
        .details-box table { width: 100%; border: none !important; }
        .details-box td { border: none !important; text-align: left !important; padding: 2px !important; }

        /* Main Table Styles - Forced thin borders and vertical centering */
        table { width: 100%; border-collapse: collapse !important; table-layout: fixed; }
        th, td { 
          border: 1px solid #000 !important; 
          padding: 6px 4px !important; 
          vertical-align: middle !important; 
          text-align: center !important;
          word-wrap: break-word;
        }
        th { background-color: #f2f2f2; font-weight: bold; }
        .particulars-cell { text-align: left !important; padding-left: 8px !important; width: 40%; }
        .amt { text-align: right !important; padding-right: 8px !important; }

        /* Summary Section */
        .summary-wrapper { display: flex; width: 100%; border-top: 1px solid #000; }
        .words-section { width: 60%; padding: 8px; border-right: 1px solid #000; }
        .tax-section { width: 40%; }
        
        .bank-info { padding: 10px; border-top: 1px solid #000; font-size: 10px; line-height: 1.4; }
        .signature-box { text-align: right; padding: 10px; border-top: 1px solid #000; height: 80px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="top-header">
          <p style="margin:0; font-size: 10px;">GSTIN NO: 24CMAPK3117QIZZ</p>
          <h1 class="company-name">SK ENTERPRISE</h1>
          <p class="company-address">SHOP NO 28, SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</p>
          <h2 style="margin: 5px 0; font-size: 14px; text-decoration: underline;">TAX INVOICE</h2>
        </div>

        <div class="billing-header">
          <div class="billing-box">
            <strong>BILLED TO:</strong><br/>
            ${invoice.customerName}<br/>
            ${invoice.customerAddress || ''}<br/>
            GSTIN: ${invoice.customerGstin || '-'}
          </div>
          <div class="details-box">
            <table>
              <tr><td>Invoice No:</td><td><strong>${invoice.invoiceNumber}</strong></td></tr>
              <tr><td>Date:</td><td>${new Date(invoice.date).toLocaleDateString('en-GB')}</td></tr>
            </table>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">SR</th>
              <th class="particulars-cell">PARTICULARS</th>
              <th>HSN</th>
              <th>QTY</th>
              <th>RATE</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHTML}
            <tr>
              <td colspan="5" style="text-align: right !important; font-weight: bold;">TOTAL</td>
              <td class="amt" style="font-weight: bold;">${formatNumber(totals.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-wrapper">
          <div class="words-section">
            <p><strong>Grand Total in Words:</strong><br/>${numberToWords(invoice.grandTotal)}</p>
          </div>
          <div class="tax-section">
            <table>
              <thead>
                <tr>
                  <th>HSN</th>
                  <th colspan="2">CGST</th>
                  <th colspan="2">SGST</th>
                </tr>
                <tr>
                  <th style="font-size: 8px;"></th>
                  <th style="font-size: 8px;">Rate</th>
                  <th style="font-size: 8px;">Tax</th>
                  <th style="font-size: 8px;">Rate</th>
                  <th style="font-size: 8px;">Tax</th>
                </tr>
              </thead>
              <tbody>
                ${gstSlabRowsHTML}
              </tbody>
            </table>
            <div style="padding: 5px; text-align: right; font-weight: bold; border-top: 1px solid #000;">
              Total: ${formatNumber(invoice.grandTotal)}
            </div>
          </div>
        </div>

        <div class="bank-info">
          <strong>BANK DETAILS:</strong><br/>
          Bank Name: AU Small Finance Bank<br/>
          A/c No: ${bankAccountNumber}<br/>
          IFSC: AUBL0002142
        </div>

        <div class="signature-box">
          <p style="margin: 0;">For, <strong>SK ENTERPRISE</strong></p>
          <br/><br/>
          <p style="margin: 0;">Authorized Signatory</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
