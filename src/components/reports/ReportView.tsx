import React, { useState } from 'react';
import { Order, MenuItem, Expense, RestaurantSettings } from '../../types';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

interface ReportViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  expenses: Expense[];
  settings: RestaurantSettings;
  isDarkMode: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({
  orders,
  menuItems,
  expenses,
  settings,
  isDarkMode
}) => {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'tax' | 'profit'>('sales');

  const totalSalesRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);
  const totalTaxCollected = orders.reduce((s, o) => s + o.taxAmount, 0);
  const totalExpensesAmt = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalSalesRevenue - totalExpensesAmt;

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,OrderNumber,Type,Customer,Total,Status,Date\n";
    orders.forEach(o => {
      csvContent += `${o.orderNumber},${o.orderType},${o.customerName},${o.totalAmount},${o.status},${o.createdAt}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Arlaadi_POS_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Executive Analytics & Printable Reports</h1>
            <p className="text-muted small mb-0">Sales analytics, tax summary, product performance, and P&L exports</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button onClick={handleExportCSV} className="btn btn-outline-success d-flex align-items-center gap-1.5 fw-semibold">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={handlePrintReport} className="btn btn-primary d-flex align-items-center gap-1.5 fw-semibold">
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* Report Selector Bar */}
      <div className="btn-group w-100 mb-4 shadow-sm">
        <button
          onClick={() => setReportType('sales')}
          className={`btn py-2.5 fw-semibold ${reportType === 'sales' ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          Daily & Monthly Sales
        </button>
        <button
          onClick={() => setReportType('products')}
          className={`btn py-2.5 fw-semibold ${reportType === 'products' ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          Product Performance
        </button>
        <button
          onClick={() => setReportType('tax')}
          className={`btn py-2.5 fw-semibold ${reportType === 'tax' ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          Tax Audit Report
        </button>
        <button
          onClick={() => setReportType('profit')}
          className={`btn py-2.5 fw-semibold ${reportType === 'profit' ? 'btn-primary' : 'btn-outline-secondary'}`}
        >
          Profit & Loss Statement
        </button>
      </div>

      {/* Report Content */}
      <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
        
        <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
          <div>
            <h5 className="fw-bold mb-1">{settings.name} - Official Report</h5>
            <div className="text-muted small">Generated on {new Date().toLocaleString()}</div>
          </div>
          <span className="badge bg-light text-dark border p-2">Tax ID: {settings.taxNumber}</span>
        </div>

        {reportType === 'sales' && (
          <div className="row g-4">
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="text-muted small fw-semibold">TOTAL REVENUE</div>
                <h3 className="fw-bold text-primary mb-0">${totalSalesRevenue.toFixed(2)}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="text-muted small fw-semibold">TOTAL ORDERS PROCESSED</div>
                <h3 className="fw-bold text-dark mb-0">{orders.length}</h3>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-light rounded-3 mb-3">
                <div className="text-muted small fw-semibold">AVERAGE CHECK SIZE</div>
                <h3 className="fw-bold text-success mb-0">${(totalSalesRevenue / (orders.length || 1)).toFixed(2)}</h3>
              </div>
            </div>
          </div>
        )}

        {reportType === 'profit' && (
          <div className="p-3 bg-light rounded-3 font-monospace">
            <div className="d-flex justify-content-between mb-2"><span>(+) Total Gross Sales:</span><span className="fw-bold">${totalSalesRevenue.toFixed(2)}</span></div>
            <div className="d-flex justify-content-between mb-2 text-danger"><span>(-) Total Operating Expenses:</span><span className="fw-bold">-${totalExpensesAmt.toFixed(2)}</span></div>
            <div className="d-flex justify-content-between fw-bold h5 border-top pt-3 mt-2 text-dark">
              <span>NET PROFIT / LOSS:</span>
              <span className={netProfit >= 0 ? 'text-success' : 'text-danger'}>${netProfit.toFixed(2)}</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
