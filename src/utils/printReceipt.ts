import { Order, RestaurantSettings } from '../types';

/**
 * Converts numeric amount to spelled out words format.
 * E.g., 4.00 -> "Four point Zero Zero"
 */
export function numberToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);

  const convertLessThanThousand = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };

  if (whole === 0 && cents === 0) return 'Zero point Zero Zero';

  let result = '';
  if (whole === 0) {
    result = 'Zero';
  } else if (whole < 1000) {
    result = convertLessThanThousand(whole);
  } else {
    const thousands = Math.floor(whole / 1000);
    const remainder = whole % 1000;
    result = convertLessThanThousand(thousands) + ' Thousand ' + convertLessThanThousand(remainder);
  }

  const centsText = cents === 0 ? 'Zero Zero' : cents < 10 ? 'Zero ' + units[cents] : convertLessThanThousand(cents);

  return `${result.trim()} point ${centsText.trim()}`;
}

/**
 * High-definition, high-contrast thermal receipt CSS rules
 * Engineered for 80mm / 58mm ESC/POS thermal printers for max legibility & crisp printouts.
 */
export function getThermalPrintStyles(settings: RestaurantSettings): string {
  const paperWidth = settings.receiptPaperWidth || '80mm';
  const baseSize = settings.receiptFontSize || 12;

  return `
  @page {
    size: ${paperWidth} auto;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    font-family: 'Segoe UI', Arial, 'Helvetica Neue', Helvetica, 'Consolas', 'Courier New', sans-serif !important;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    color: #000000 !important;
  }
  body {
    width: ${paperWidth};
    max-width: 100%;
    margin: 0 auto;
    padding: 10px 8px;
    background: #ffffff;
    font-size: ${baseSize}px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 0.2px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .text-center { text-align: center; }
  .text-end { text-align: right; }
  .fw-normal { font-weight: 600; }
  .fw-bold { font-weight: 800; }
  .fw-heavy { font-weight: 900; }
  .text-uppercase { text-transform: uppercase; }

  .dashed-divider {
    border-bottom: 2px dashed #000000;
    margin: 8px 0;
  }

  .solid-divider {
    border-bottom: 2px solid #000000;
    margin: 8px 0;
  }

  .header-title {
    font-size: ${Math.round(baseSize * 1.55)}px;
    font-weight: 900;
    letter-spacing: 0px;
    text-align: center;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .header-station {
    font-size: ${Math.round(baseSize * 1.55)}px;
    font-weight: 900;
    text-align: center;
    margin-bottom: 2px;
    text-transform: uppercase;
  }

  .order-no-title {
    font-size: ${Math.round(baseSize * 1.8)}px;
    font-weight: 900;
    text-align: center;
    margin: 4px 0;
  }

  .order-type-box {
    font-size: ${Math.round(baseSize * 1.5)}px;
    font-weight: 900;
    text-align: center;
    letter-spacing: 2px;
    margin: 6px 0;
    text-transform: uppercase;
  }

  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: ${baseSize}px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .item-row {
    display: flex;
    justify-content: space-between;
    font-size: ${Math.round(baseSize * 1.08)}px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .total-section {
    font-size: ${Math.round(baseSize * 1.08)}px;
    margin-top: 6px;
  }

  .total-row {
    display: flex;
    justify-content: space-between;
    font-weight: 900;
    font-size: ${Math.round(baseSize * 1.15)}px;
    margin-bottom: 4px;
  }

  .grand-total-row {
    display: flex;
    justify-content: space-between;
    font-weight: 900;
    font-size: ${Math.round(baseSize * 1.38)}px;
    margin-bottom: 4px;
    padding: 2px 0;
  }

  .in-words-box {
    margin: 8px 0;
    font-style: italic;
    font-weight: 800;
    font-size: ${Math.round(baseSize * 0.95)}px;
  }

  .footer-note {
    text-align: center;
    font-size: ${Math.round(baseSize * 0.92)}px;
    margin-top: 10px;
    font-weight: 700;
  }

  @media print {
    body { padding: 0; width: 100%; }
  }
`;
}

/**
 * Helper function to trigger a browser print view for the POS Customer Receipt.
 */
export const triggerReceiptPrint = (order: Order, settings: RestaurantSettings) => {
  const orderDateObj = new Date(order.createdAt);
  const formattedDate = `${String(orderDateObj.getDate()).padStart(2, '0')}-${String(orderDateObj.getMonth() + 1).padStart(2, '0')}-${orderDateObj.getFullYear()}`;
  const cashierName = order.waiterName || 'Ahmed';
  const invoiceNum = order.orderNumber.replace(/[^0-9]/g, '') || '367';
  const stockNum = invoiceNum;
  const orderNumOnly = invoiceNum.slice(-3) || '4';
  const totalInWords = numberToWords(order.totalAmount);

  const evcNumber = settings.evcMerchantId;
  const edahabNumber = settings.edahabMerchantId || settings.sahalMerchantId;
  const mycashNumber = settings.mycashMerchantId;
  const merchantCode = settings.merchantCode || 'merchant : *789*693364*$$#';

  const printWindow = window.open('', '_blank', 'width=420,height=800,top=50,left=50');

  const receiptHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Receipt_${order.orderNumber}</title>
        <style>
          ${getThermalPrintStyles(settings)}
        </style>
      </head>
      <body>
        <!-- STORE HEADER -->
        ${settings.logo ? `<div class="text-center" style="margin-bottom: 6px;"><img src="${settings.logo}" alt="Logo" style="max-height: 55px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto;" /></div>` : ''}
        <div class="header-title">${settings.name || 'Restaurant'}</div>
        
        <div class="meta-row">
          <span>Stock #: ${stockNum}</span>
        </div>
        <div class="meta-row">
          <span>Invoice #: ${invoiceNum}</span>
          <span>Order #: ${orderNumOnly}</span>
        </div>
        <div class="meta-row">
          <span>Cashier: ${cashierName}</span>
          <span>Date: ${formattedDate}</span>
        </div>

        <div class="dashed-divider"></div>

        <!-- ORDER TYPE -->
        <div class="order-type-box">${order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}</div>

        <div class="dashed-divider"></div>

        <!-- ITEMS BREAKDOWN TABLE HEADER -->
        <div class="item-row fw-heavy" style="border-bottom: 2px solid #000; padding-bottom: 4px; font-size: 14px;">
          <span>Qty Items</span>
          <span class="text-end">Total</span>
        </div>

        <!-- ITEMS LIST -->
        ${order.items.map(item => `
          <div class="item-row">
            <span>${item.quantity} ${item.name} (${item.quantity})</span>
            <span class="text-end fw-heavy">${item.subtotal.toFixed(2)}</span>
          </div>
        `).join('')}

        <div class="dashed-divider"></div>

        <!-- TOTALS -->
        <div class="total-section">
          <div class="total-row">
            <span>Sub Total</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div class="grand-total-row">
            <span>Grand Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <!-- IN WORDS -->
        <div class="in-words-box">
          ${totalInWords}
        </div>

        <div class="meta-row" style="margin-top: 6px; font-size: 14px;">
          <span>Amount (${order.paymentMethod || 'Cash'})</span>
          <span class="fw-heavy">${order.totalAmount.toFixed(2)}</span>
        </div>

        <div class="dashed-divider"></div>

        <!-- MERCHANT DETAILS & MOBILE MONEY -->
        <div class="text-center" style="font-size: 13px; margin-bottom: 6px; font-weight: 800;">
          ${merchantCode ? `<div>${merchantCode}</div>` : ''}
          ${evcNumber ? `<div>EvcPlus: ${evcNumber}</div>` : ''}
          ${edahabNumber ? `<div>Edahab: ${edahabNumber}</div>` : ''}
          ${mycashNumber ? `<div>Mycash: ${mycashNumber}</div>` : ''}
        </div>

        <div class="dashed-divider"></div>

        <!-- APPRECIATION FOOTER -->
        <div class="footer-note" style="text-align: center; margin-top: 8px;">
          <div style="font-size: ${Math.round((settings.receiptFontSize || 12) * 0.95)}px; font-weight: 900; white-space: pre-line; word-break: break-word; line-height: 1.4;">${settings.receiptFooter || 'Waad ku mahadsan tahay Mar labaad noo soo laabo!!'}</div>
        </div>

        <script>
          function doAutoPrint() {
            try { window.focus(); window.print(); } catch (e) {}
          }
          if (document.readyState === 'complete') {
            setTimeout(doAutoPrint, 150);
          } else {
            window.addEventListener('load', function() { setTimeout(doAutoPrint, 150); });
          }
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  } else {
    window.print();
  }
};

/**
 * Helper function to trigger a Kitchen Order Ticket (KOT) print view.
 */
export const triggerKotPrint = (order: Order, settings: RestaurantSettings) => {
  const orderDateObj = new Date(order.createdAt);
  const formattedDate = `${String(orderDateObj.getDate()).padStart(2, '0')}-${String(orderDateObj.getMonth() + 1).padStart(2, '0')}-${orderDateObj.getFullYear()}`;
  
  const startTime = orderDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const printTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const invoiceNum = order.orderNumber.replace(/[^0-9]/g, '') || '367';
  const orderNumOnly = invoiceNum.slice(-3) || '4';
  const cashierName = order.waiterName || 'Ahmed';

  const printWindow = window.open('', '_blank', 'width=420,height=800,top=50,left=50');

  const kotHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>KOT_${order.orderNumber}</title>
        <style>
          ${getThermalPrintStyles(settings)}
        </style>
      </head>
      <body>
        <!-- KITCHEN HEADER -->
        <div class="header-station">Hot Kitchen</div>
        <div class="order-no-title">Order No: ${orderNumOnly}</div>

        <div class="meta-row">
          <span>Invoice #: ${invoiceNum}</span>
          <span>Date: ${formattedDate}</span>
        </div>
        <div class="meta-row">
          <span>Cashier: ${cashierName}</span>
          <span>Est.Time: </span>
        </div>
        <div class="meta-row">
          <span>Start Time: ${startTime}</span>
          <span>Print Time: ${printTime}</span>
        </div>

        <div class="dashed-divider"></div>

        <!-- ORDER TYPE -->
        <div class="order-type-box">${order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}</div>

        <div class="dashed-divider"></div>

        <!-- ITEMS HEADER -->
        <div class="meta-row fw-heavy" style="border-bottom: 2px solid #000; padding-bottom: 4px; font-size: 14px; margin-bottom: 8px;">
          <span>QTY ITEMS</span>
        </div>

        <!-- PREPARATION ITEMS -->
        ${order.items.map(item => `
          <div class="item-row" style="font-size: 15px; margin-bottom: 6px;">
            <span style="width: 32px; font-weight: 900;">${item.quantity}</span>
            <span style="font-weight: 800;">${item.name}</span>
          </div>
          ${item.kitchenNotes ? `<div style="padding-left: 32px; font-size: 12px; font-weight: 700;">* NOTE: ${item.kitchenNotes}</div>` : ''}
        `).join('')}

        <div class="dashed-divider"></div>

        <div class="text-center" style="font-size: 12px; font-weight: 900; margin-top: 12px;">
          *** END OF KITCHEN ORDER ***
        </div>

        <script>
          function doAutoPrint() {
            try { window.focus(); window.print(); } catch (e) {}
          }
          if (document.readyState === 'complete') {
            setTimeout(doAutoPrint, 150);
          } else {
            window.addEventListener('load', function() { setTimeout(doAutoPrint, 150); });
          }
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.write(kotHtml);
    printWindow.document.close();
  } else {
    window.print();
  }
};

/**
 * Triggers a combined print view with both Customer Receipt and Kitchen Order Ticket (KOT)
 * side-by-side or stacked on a single page.
 */
export const triggerDualReceiptPrint = (order: Order, settings: RestaurantSettings) => {
  const orderDateObj = new Date(order.createdAt);
  const formattedDate = `${String(orderDateObj.getDate()).padStart(2, '0')}-${String(orderDateObj.getMonth() + 1).padStart(2, '0')}-${orderDateObj.getFullYear()}`;
  
  const startTime = orderDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const printTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const cashierName = order.waiterName || 'Ahmed';
  const invoiceNum = order.orderNumber.replace(/[^0-9]/g, '') || '367';
  const stockNum = invoiceNum;
  const orderNumOnly = invoiceNum.slice(-3) || '4';
  const totalInWords = numberToWords(order.totalAmount);

  const evcNumber = settings.evcMerchantId;
  const edahabNumber = settings.edahabMerchantId || settings.sahalMerchantId;
  const mycashNumber = settings.mycashMerchantId;
  const merchantCode = settings.merchantCode || 'merchant : *789*693364*$$#';

  const printWindow = window.open('', '_blank', 'width=850,height=800,top=50,left=50');

  const dualHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Dual_Receipt_KOT_${order.orderNumber}</title>
        <style>
          ${getThermalPrintStyles(settings)}
          body {
            width: 100%;
            margin: 0;
            padding: 15px;
          }
          .dual-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            align-items: flex-start;
          }
          .ticket-strip {
            width: 80mm;
            border: 2px solid #000;
            padding: 12px;
            background: #fff;
          }
          @media print {
            body { padding: 0; }
            .ticket-strip { border: none; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="dual-container">
          
          <!-- LEFT TICKET: CUSTOMER RECEIPT -->
          <div class="ticket-strip">
            ${settings.logo ? `<div class="text-center" style="margin-bottom: 6px;"><img src="${settings.logo}" alt="Logo" style="max-height: 55px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto;" /></div>` : ''}
            <div class="header-title">${settings.name || 'Restaurant'}</div>
            
            <div class="meta-row">
              <span>Stock #: ${stockNum}</span>
            </div>
            <div class="meta-row">
              <span>Invoice #: ${invoiceNum}</span>
              <span>Order #: ${orderNumOnly}</span>
            </div>
            <div class="meta-row">
              <span>Cashier: ${cashierName}</span>
              <span>Date: ${formattedDate}</span>
            </div>

            <div class="dashed-divider"></div>

            <div class="order-type-box">${order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}</div>

            <div class="dashed-divider"></div>

            <div class="item-row fw-heavy" style="border-bottom: 2px solid #000; padding-bottom: 4px; font-size: 14px;">
              <span>Qty Items</span>
              <span class="text-end">Total</span>
            </div>

            ${order.items.map(item => `
              <div class="item-row">
                <span>${item.quantity} ${item.name} (${item.quantity})</span>
                <span class="text-end fw-heavy">${item.subtotal.toFixed(2)}</span>
              </div>
            `).join('')}

            <div class="dashed-divider"></div>

            <div class="total-section">
              <div class="total-row">
                <span>Sub Total</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div class="grand-total-row">
                <span>Grand Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="in-words-box">
              ${totalInWords}
            </div>

            <div class="meta-row" style="margin-top: 6px; font-size: 14px;">
              <span>Amount (${order.paymentMethod || 'Cash'})</span>
              <span class="fw-heavy">${order.totalAmount.toFixed(2)}</span>
            </div>

            <div class="dashed-divider"></div>

            <div class="text-center" style="font-size: 13px; margin-bottom: 6px; font-weight: 800;">
              ${merchantCode ? `<div>${merchantCode}</div>` : ''}
              ${evcNumber ? `<div>EvcPlus: ${evcNumber}</div>` : ''}
              ${edahabNumber ? `<div>Edahab: ${edahabNumber}</div>` : ''}
              ${mycashNumber ? `<div>Mycash: ${mycashNumber}</div>` : ''}
            </div>

            <div class="dashed-divider"></div>

            <div class="footer-note" style="text-align: center; margin-top: 8px;">
              <div style="font-size: ${Math.round((settings.receiptFontSize || 12) * 0.95)}px; font-weight: 900; white-space: pre-line; word-break: break-word; line-height: 1.4;">${settings.receiptFooter || 'Waad ku mahadsan tahay Mar labaad noo soo laabo!!'}</div>
            </div>
          </div>

          <!-- RIGHT TICKET: KITCHEN ORDER TICKET (KOT) -->
          <div class="ticket-strip">
            <div class="header-station">Hot Kitchen</div>
            <div class="order-no-title">Order No: ${orderNumOnly}</div>

            <div class="meta-row">
              <span>Invoice #: ${invoiceNum}</span>
              <span>Date: ${formattedDate}</span>
            </div>
            <div class="meta-row">
              <span>Cashier: ${cashierName}</span>
              <span>Est.Time: </span>
            </div>
            <div class="meta-row">
              <span>Start Time: ${startTime}</span>
              <span>Print Time: ${printTime}</span>
            </div>

            <div class="dashed-divider"></div>

            <div class="order-type-box">${order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}</div>

            <div class="dashed-divider"></div>

            <div class="meta-row fw-heavy" style="border-bottom: 2px solid #000; padding-bottom: 4px; font-size: 14px; margin-bottom: 8px;">
              <span>QTY ITEMS</span>
            </div>

            ${order.items.map(item => `
              <div class="item-row" style="font-size: 15px; margin-bottom: 6px;">
                <span style="width: 32px; font-weight: 900;">${item.quantity}</span>
                <span style="font-weight: 800;">${item.name}</span>
              </div>
              ${item.kitchenNotes ? `<div style="padding-left: 32px; font-size: 12px; font-weight: 700;">* NOTE: ${item.kitchenNotes}</div>` : ''}
            `).join('')}

            <div class="dashed-divider"></div>

            <div class="text-center" style="font-size: 12px; font-weight: 900; margin-top: 12px;">
              *** END OF KITCHEN ORDER ***
            </div>
          </div>

        </div>

        <script>
          function doAutoPrint() {
            try { window.focus(); window.print(); } catch (e) {}
          }
          if (document.readyState === 'complete') {
            setTimeout(doAutoPrint, 150);
          } else {
            window.addEventListener('load', function() { setTimeout(doAutoPrint, 150); });
          }
        </script>
      </body>
    </html>
  `;

  if (printWindow) {
    printWindow.document.write(dualHtml);
    printWindow.document.close();
  } else {
    window.print();
  }
};
