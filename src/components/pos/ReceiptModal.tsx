import React, { useState } from 'react';
import { Order, RestaurantSettings } from '../../types';
import { Printer, CheckCircle2, UtensilsCrossed, LayoutGrid, FileText, Image } from 'lucide-react';
import { triggerReceiptPrint, triggerKotPrint, triggerDualReceiptPrint, numberToWords } from '../../utils/printReceipt';

interface ReceiptModalProps {
  order: Order;
  settings: RestaurantSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  settings,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<'dual' | 'customer' | 'kot'>('dual');

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

  const handlePrintCustomer = () => {
    triggerReceiptPrint(order, settings);
  };

  const handlePrintKot = () => {
    triggerKotPrint(order, settings);
  };

  const handlePrintDual = () => {
    triggerDualReceiptPrint(order, settings);
  };

  return (
    <div className="modal show d-block bg-dark bg-opacity-60" tabIndex={-1}>
      <div className={`modal-dialog modal-dialog-centered ${viewMode === 'dual' ? 'modal-xl' : 'modal-md'}`} style={{ maxWidth: viewMode === 'dual' ? '860px' : '440px', transition: 'all 0.25s ease' }}>
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          
          {/* Modal Header */}
          <div className="modal-header bg-dark text-white py-2.5 px-3 d-flex align-items-center justify-content-between">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span>Thermal Receipt & Kitchen KOT Preview</span>
            </h6>

            <div className="d-flex align-items-center gap-2">
              <div className="btn-group btn-group-sm bg-secondary bg-opacity-20 p-0.5 rounded">
                <button
                  onClick={() => setViewMode('dual')}
                  className={`btn btn-xs fw-semibold px-2 py-1 ${viewMode === 'dual' ? 'btn-light text-dark shadow-sm' : 'btn-dark text-white-50'}`}
                  title="Side-by-Side Dual View (KOT + Receipt)"
                >
                  <LayoutGrid className="w-3.5 h-3.5 me-1 d-inline" />
                  <span>Dual View</span>
                </button>
                <button
                  onClick={() => setViewMode('customer')}
                  className={`btn btn-xs fw-semibold px-2 py-1 ${viewMode === 'customer' ? 'btn-light text-dark shadow-sm' : 'btn-dark text-white-50'}`}
                  title="Customer Receipt Only"
                >
                  <FileText className="w-3.5 h-3.5 me-1 d-inline" />
                  <span>Receipt</span>
                </button>
                <button
                  onClick={() => setViewMode('kot')}
                  className={`btn btn-xs fw-semibold px-2 py-1 ${viewMode === 'kot' ? 'btn-light text-dark shadow-sm' : 'btn-dark text-white-50'}`}
                  title="Kitchen Order Ticket Only"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 me-1 d-inline" />
                  <span>KOT Ticket</span>
                </button>
              </div>

              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
          </div>

          {/* Modal Body: Render Paper Rolls */}
          <div className="modal-body bg-secondary bg-opacity-10 p-3 p-md-4 overflow-auto" style={{ maxHeight: '80vh' }}>
            <div className={`d-flex flex-wrap justify-content-center gap-4 ${viewMode === 'dual' ? 'align-items-start' : ''}`}>

              {/* CUSTOMER RECEIPT TICKET PAPER ROLL */}
              {(viewMode === 'dual' || viewMode === 'customer') && (
                <div 
                  className="thermal-paper-roll shadow-sm rounded p-3 text-dark position-relative"
                  style={{
                    width: '340px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #000000',
                    fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
                    fontSize: `${settings.receiptFontSize || 12}px`,
                    fontWeight: 700,
                    lineHeight: '1.4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="badge bg-secondary position-absolute top-0 end-0 m-2 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                    Customer Receipt ({settings.receiptFontSize || 12}px)
                  </div>

                  {/* Store Logo */}
                  {settings.logo && (
                    <div className="text-center mb-2">
                      <img 
                        src={settings.logo} 
                        alt="Store Logo" 
                        style={{ maxHeight: '55px', maxWidth: '150px', objectFit: 'contain' }} 
                        className="d-block mx-auto"
                      />
                    </div>
                  )}

                  {/* Header Title */}
                  <div className="text-center fw-bold fs-5 text-uppercase mb-1" style={{ letterSpacing: '0px', fontWeight: 900, color: '#000' }}>
                    {settings.name || 'Restaurant'}
                  </div>

                  {/* Metadata Block */}
                  <div className="mb-1 fw-bold" style={{ fontSize: '12px', color: '#000' }}>
                    <div>Stock #: {stockNum}</div>
                    <div className="d-flex justify-content-between">
                      <span>Invoice #: {invoiceNum}</span>
                      <span>Order #: {orderNumOnly}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Cashier: {cashierName}</span>
                      <span>Date: {formattedDate}</span>
                    </div>
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Order Type Big Badge */}
                  <div className="text-center fw-bold fs-5 text-uppercase py-1" style={{ letterSpacing: '2px', fontWeight: 900, color: '#000' }}>
                    {order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Itemized Table */}
                  <div className="d-flex justify-content-between fw-bold mb-1" style={{ borderBottom: '2px solid #000', paddingBottom: '3px', fontSize: '13px' }}>
                    <span>Qty Items</span>
                    <span>Total</span>
                  </div>

                  {order.items.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between mb-1 fw-bold" style={{ fontSize: '13px' }}>
                      <span className="text-truncate" style={{ maxWidth: '240px' }}>
                        {item.quantity} {item.name} ({item.quantity})
                      </span>
                      <span className="fw-bold ms-2">${item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Financials */}
                  <div className="d-flex justify-content-between fw-bold fs-6">
                    <span>Sub Total</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5 text-dark mt-1" style={{ fontWeight: 900 }}>
                    <span>Grand Total</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* In Words */}
                  <div className="fst-italic fw-bold my-1" style={{ fontSize: '12px', color: '#000' }}>
                    {totalInWords}
                  </div>

                  <div className="d-flex justify-content-between fw-bold mt-1" style={{ fontSize: '13px' }}>
                    <span>Amount ({order.paymentMethod || 'Cash'})</span>
                    <span>${order.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Merchant Mobile Payment Details */}
                  <div className="text-center my-2 fw-bold" style={{ fontSize: '12px', color: '#000' }}>
                    {merchantCode && <div>{merchantCode}</div>}
                    {evcNumber && <div>EvcPlus: {evcNumber}</div>}
                    {edahabNumber && <div>Edahab: {edahabNumber}</div>}
                    {mycashNumber && <div>Mycash: {mycashNumber}</div>}
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Receipt Footer Note with Multiline support */}
                  <div className="text-center mt-2 fw-bold" style={{ fontSize: `${Math.max(10, (settings.receiptFontSize || 12) - 1)}px`, color: '#000' }}>
                    <div 
                      style={{ 
                        fontWeight: 900, 
                        whiteSpace: 'pre-line', 
                        wordBreak: 'break-word',
                        lineHeight: '1.4' 
                      }}
                    >
                      {settings.receiptFooter || 'Waad ku mahadsan tahay Mar labaad noo soo laabo!!'}
                    </div>
                  </div>
                </div>
              )}

              {/* KITCHEN ORDER TICKET (KOT) PAPER ROLL */}
              {(viewMode === 'dual' || viewMode === 'kot') && (
                <div 
                  className="thermal-paper-roll shadow-sm rounded p-3 text-dark position-relative"
                  style={{
                    width: '340px',
                    backgroundColor: '#ffffff',
                    border: '2px solid #000000',
                    fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
                    fontSize: `${settings.receiptFontSize || 12}px`,
                    fontWeight: 700,
                    lineHeight: '1.4',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  <div className="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1" style={{ fontSize: '0.65rem' }}>
                    Hot Kitchen KOT ({settings.receiptFontSize || 12}px)
                  </div>

                  {/* Store Logo */}
                  {settings.logo && (
                    <div className="text-center mb-1">
                      <img 
                        src={settings.logo} 
                        alt="Store Logo" 
                        style={{ maxHeight: '45px', maxWidth: '130px', objectFit: 'contain' }} 
                        className="d-block mx-auto"
                      />
                    </div>
                  )}

                  {/* Station Title */}
                  <div className="text-center fw-bold fs-5 mb-0" style={{ fontWeight: 900, color: '#000' }}>
                    Hot Kitchen
                  </div>
                  <div className="text-center fw-bold fs-4 mb-2 text-danger" style={{ fontWeight: 900 }}>
                    Order No: {orderNumOnly}
                  </div>

                  {/* Metadata */}
                  <div className="mb-1 fw-bold" style={{ fontSize: '12px', color: '#000' }}>
                    <div className="d-flex justify-content-between">
                      <span>Invoice #: {invoiceNum}</span>
                      <span>Date: {formattedDate}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Cashier: {cashierName}</span>
                      <span>Est.Time: </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Start Time: {startTime}</span>
                      <span>Print Time: {printTime}</span>
                    </div>
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* Order Type Big Badge */}
                  <div className="text-center fw-bold fs-5 text-uppercase py-1 text-danger" style={{ letterSpacing: '2px', fontWeight: 900 }}>
                    {order.orderType === 'Dine In' ? 'DINE IN' : 'TAKE AWAY'}
                  </div>

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  {/* QTY ITEMS Header */}
                  <div className="fw-bold mb-2" style={{ borderBottom: '2px solid #000', paddingBottom: '3px', fontSize: '13px', color: '#000' }}>
                    QTY ITEMS
                  </div>

                  {/* Preparation List */}
                  {order.items.map((item, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="d-flex align-items-start fs-6 fw-bold" style={{ color: '#000' }}>
                        <span style={{ width: '32px', minWidth: '32px', fontWeight: 900 }}>{item.quantity}</span>
                        <span style={{ fontWeight: 800 }}>{item.name}</span>
                      </div>
                      {item.kitchenNotes && (
                        <div className="ms-4 fw-bold" style={{ fontSize: '11px', color: '#000' }}>
                          * Note: {item.kitchenNotes}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="my-2 text-center" style={{ borderBottom: '2px dashed #000' }}></div>

                  <div className="text-center fw-bold" style={{ fontSize: '11px', fontWeight: 900, color: '#000' }}>
                    *** END OF KITCHEN ORDER ***
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer bg-light p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2 text-xs font-monospace flex-wrap">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle d-flex align-items-center gap-1">
                <Printer className="w-3 h-3" />
                <span>Receipt: {settings.receiptPrinterModel || 'Epson TM-T88VI'} ({settings.receiptPaperWidth || '80mm'})</span>
              </span>
              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle d-flex align-items-center gap-1">
                <Image className="w-3 h-3 text-secondary" />
                <span>Logo: {settings.logo ? 'Active Header Logo' : 'No Logo Uploaded'}</span>
              </span>
              {settings.kitchenPrinters && settings.kitchenPrinters.length > 0 && (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-flex align-items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" />
                  <span>KOT: {settings.kitchenPrinters[0]?.printerModel || 'Epson TM-T88VI'} ({settings.kitchenPrinters[0]?.paperWidth || '80mm'})</span>
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button className="btn btn-sm btn-outline-secondary px-3" onClick={onClose}>
                Close
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-danger fw-bold px-3 d-flex align-items-center gap-1.5 shadow-sm"
                onClick={handlePrintKot}
                title="Send ticket directly to Kitchen Printer (KOT)"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Print KOT</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-outline-primary fw-bold px-3 d-flex align-items-center gap-1.5 shadow-sm"
                onClick={handlePrintCustomer}
                title="Send customer receipt to Cashier Printer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-success fw-bold px-3 d-flex align-items-center gap-1.5 shadow-sm text-white"
                onClick={handlePrintDual}
                title="Print both KOT and Customer Receipt side-by-side"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Print Dual</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
