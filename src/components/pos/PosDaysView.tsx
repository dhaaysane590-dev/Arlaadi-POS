import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  StopCircle,
  Play,
  History,
  Eye,
  Copy,
  HardDrive,
  Printer,
  Trash2,
  Edit2,
  ArrowUpDown,
  Download,
  Plus
} from 'lucide-react';
import { GoogleDriveModal } from '../drive/GoogleDriveModal';

export interface PosDayRecord {
  id: string;
  tenantId?: string;
  sNo: number;
  date: string;
  openingCash: number;
  closingCash?: number;
  totalSales: number;
  startedAt: string;
  startedBy: string;
  closedAt?: string;
  closedBy?: string;
  status: 'Open' | 'Closed';
  notes?: string;
}

interface PosDaysViewProps {
  posDayState: {
    isOpen: boolean;
    date: string;
    openingCash: number;
    startedAt: string;
    startedBy: string;
    notes?: string;
  };
  posDayHistory: PosDayRecord[];
  onStartDay: (date: string, openingCash: number, notes?: string) => void;
  onCloseDay: (closingCash: number) => void;
  isDarkMode?: boolean;
  totalSalesToday?: number;
}

export const PosDaysView: React.FC<PosDaysViewProps> = ({
  posDayState,
  posDayHistory,
  onStartDay,
  onCloseDay,
  isDarkMode = false,
  totalSalesToday = 0
}) => {
  const [closeDayDateInput, setCloseDayDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [startDayDateInput, setStartDayDateInput] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [openingCashInput, setOpeningCashInput] = useState<number>(100);
  const [startDayNotes, setStartDayNotes] = useState<string>('');

  const [historyList, setHistoryList] = useState<PosDayRecord[]>(() => {
    if (posDayHistory && posDayHistory.length > 0) {
      return posDayHistory.map((item, index) => ({ ...item, sNo: item.sNo || index + 1 }));
    }
    return [
      {
        id: 'posday-1',
        sNo: 1,
        date: new Date().toISOString().split('T')[0],
        openingCash: 100,
        totalSales: 340.5,
        startedAt: '08:00 AM',
        startedBy: 'Super Admin',
        status: 'Open'
      },
      {
        id: 'posday-2',
        sNo: 2,
        date: '17-04-2026',
        openingCash: 150,
        closingCash: 980,
        totalSales: 830,
        startedAt: '08:00 AM',
        closedAt: '10:30 PM',
        startedBy: 'Manager',
        status: 'Closed'
      }
    ];
  });

  useEffect(() => {
    if (posDayHistory && posDayHistory.length > 0) {
      setHistoryList(posDayHistory.map((item, index) => ({ ...item, sNo: item.sNo || index + 1 })));
    }
  }, [posDayHistory]);

  const [entriesPerPage, setEntriesPerPage] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortAscending, setSortAscending] = useState<boolean>(false);
  const [showCloseModal, setShowCloseModal] = useState<boolean>(false);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PosDayRecord | null>(null);

  // Form states for manual Add / Edit POS Day
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formOpeningCash, setFormOpeningCash] = useState<number>(100);
  const [formSales, setFormSales] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'Open' | 'Closed'>('Closed');

  const [closingCashInput, setClosingCashInput] = useState<number>(
    posDayState.openingCash + totalSalesToday
  );

  const handleStartDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartDay(startDayDateInput, openingCashInput, startDayNotes);
    setShowStartModal(false);
  };

  const handleCloseDaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseDay(closingCashInput);
    setShowCloseModal(false);
  };

  const handleSaveAddEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRecord) {
      setHistoryList(prev =>
        prev.map(item =>
          item.id === editingRecord.id
            ? {
                ...item,
                date: formDate,
                openingCash: formOpeningCash,
                totalSales: formSales,
                status: formStatus
              }
            : item
        )
      );
    } else {
      const newRec: PosDayRecord = {
        id: 'posday-' + Date.now(),
        sNo: historyList.length + 1,
        date: formDate,
        openingCash: formOpeningCash,
        totalSales: formSales,
        startedAt: '08:00 AM',
        startedBy: 'Admin',
        status: formStatus
      };
      setHistoryList(prev => [newRec, ...prev]);
    }
    setShowAddModal(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this POS day record?')) {
      setHistoryList(prev => {
        const remaining = prev.filter(r => r.id !== id);
        return remaining.map((r, idx) => ({ ...r, sNo: idx + 1 }));
      });
    }
  };

  const handleCopyTable = () => {
    const textData = historyList
      .map(r => `${r.sNo}\t${r.date}\t$${r.openingCash}\t$${r.totalSales}\t${r.status}`)
      .join('\n');
    navigator.clipboard.writeText(`S.NO\tDATE\tOPENING CASH\tTOTAL SALES\tSTATUS\n` + textData);
    alert('POS Days table copied to clipboard!');
  };

  const generateCSVContent = () => {
    const rows = ['S.NO,DATE,OPENING_CASH,TOTAL_SALES,STATUS'];
    historyList.forEach(r => {
      rows.push(`${r.sNo},"${r.date}",${r.openingCash},${r.totalSales},${r.status}`);
    });
    return rows.join('\n');
  };

  // Sort & Pagination
  const sortedList = [...historyList].sort((a, b) => {
    if (sortAscending) return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });

  const totalEntries = sortedList.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedList = sortedList.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className={`container-fluid p-4 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
      
      {/* Header matching Image 2 style */}
      <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
        <div>
          <h1 className="h4 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
            <span className="fs-3">📝</span>
            <span>POS Days</span>
          </h1>
          <span className={`badge px-2.5 py-1.5 fw-bold font-monospace border ${posDayState.isOpen ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'}`}>
            • CURRENT POS DAY STATUS: {posDayState.isOpen ? `OPEN (${posDayState.date})` : 'CLOSED'}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => {
              setEditingRecord(null);
              setFormDate(new Date().toISOString().split('T')[0]);
              setFormOpeningCash(100);
              setFormSales(0);
              setFormStatus('Closed');
              setShowAddModal(true);
            }}
            className="btn btn-primary rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add POS Day Record</span>
          </button>
        </div>
      </div>

      {/* Dynamic Start Day / Close Day Form Section */}
      <div className={`card border-0 shadow-sm p-4 rounded-3 mb-4 ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        {!posDayState.isOpen ? (
          /* WHEN POS DAY IS CLOSED -> DISPLAY START DAY CONTROLS */
          <div className="row align-items-end g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-semibold text-success small mb-1 d-flex align-items-center gap-1">
                <Play className="w-4 h-4 text-success" />
                <span>Start Day Date</span>
              </label>
              <input
                type="date"
                className="form-control form-control-lg font-monospace fw-bold border-success-subtle"
                value={startDayDateInput}
                onChange={(e) => setStartDayDateInput(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-semibold text-secondary small mb-1">Opening Cash Float ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control form-control-lg font-monospace fw-bold text-success border-secondary-subtle"
                value={openingCashInput}
                onChange={(e) => setOpeningCashInput(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="col-12 col-md-12 col-lg-4">
              <button
                type="button"
                onClick={() => setShowStartModal(true)}
                className="btn btn-success btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START DAY</span>
              </button>
            </div>
          </div>
        ) : (
          /* WHEN POS DAY IS OPEN -> DISPLAY CLOSE DAY CONTROLS */
          <div className="row align-items-end g-3">
            <div className="col-12 col-md-6 col-lg-4">
              <label className="form-label fw-semibold text-danger small mb-1 d-flex align-items-center gap-1">
                <StopCircle className="w-4 h-4 text-danger" />
                <span>Close Day Date</span>
              </label>
              <input
                type="date"
                className="form-control form-control-lg font-monospace fw-bold border-secondary-subtle"
                value={closeDayDateInput}
                onChange={(e) => setCloseDayDateInput(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-4">
              <button
                type="button"
                onClick={() => setShowCloseModal(true)}
                className="btn btn-danger btn-lg w-100 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
              >
                <StopCircle className="w-5 h-5 fill-current" />
                <span>CLOSE DAY</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POS Days History & Audit Table matching toolbar in screenshot */}
      <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        
        {/* Table Header Toolbar */}
        <div className="p-3 bg-light border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3">
          
          <div className="d-flex align-items-center gap-2">
            <span className="small text-secondary fw-semibold">Show</span>
            <select
              className="form-select form-select-sm rounded-2 w-auto border-secondary-subtle font-monospace fw-bold"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="small text-secondary fw-semibold">entries</span>
          </div>

          {/* Action Icon Buttons: Eye, Copy, Database/Drive, Print */}
          <div className="btn-group bg-white rounded-3 shadow-sm border p-1">
            <button
              onClick={() => alert(`Active POS Day Status: ${posDayState.isOpen ? 'OPEN' : 'CLOSED'}`)}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="View Info"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyTable}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Copy Table"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDriveModal(true)}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Google Drive Sync"
            >
              <HardDrive className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Print Table"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary border-bottom">
              <tr>
                <th style={{ width: '80px' }} className="ps-4 fw-bold">S.NO</th>
                <th className="fw-bold cursor-pointer" onClick={() => setSortAscending(!sortAscending)}>
                  <div className="d-flex align-items-center gap-1">
                    <span>DATE</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                  </div>
                </th>
                <th className="fw-bold">OPENING CASH</th>
                <th className="fw-bold">TOTAL SALES</th>
                <th className="fw-bold">STATUS</th>
                <th style={{ width: '180px' }} className="text-center fw-bold">
                  <span className="fs-6">⚙</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-5 text-muted">
                    No POS day records available.
                  </td>
                </tr>
              ) : (
                displayedList.map((item, idx) => (
                  <tr key={item.id} className="border-bottom">
                    <td className="ps-4 font-monospace text-secondary fw-semibold">
                      {startIndex + idx + 1}
                    </td>
                    <td className="fw-bold font-monospace text-dark">{item.date}</td>
                    <td className="font-monospace text-success fw-bold">${item.openingCash.toFixed(2)}</td>
                    <td className="font-monospace text-primary fw-bold">${item.totalSales.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${item.status === 'Open' ? 'bg-success' : 'bg-secondary'} px-2.5 py-1 rounded-pill`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRecord(item);
                            setFormDate(item.date);
                            setFormOpeningCash(item.openingCash);
                            setFormSales(item.totalSales);
                            setFormStatus(item.status);
                            setShowAddModal(true);
                          }}
                          className="btn btn-sm btn-outline-info p-1.5 rounded-2"
                          title="Edit POS Day"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(item.id)}
                          className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
                          title="Delete POS Day"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Toolbar */}
        <div className="p-3 bg-light border-top d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="small text-secondary fw-semibold">
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
          </div>

          <div className="d-flex align-items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline-secondary px-3 rounded-2"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-primary text-white rounded-2 font-monospace fw-bold small">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="btn btn-sm btn-outline-secondary px-3 rounded-2"
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* Start Day Confirmation Modal */}
      {showStartModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-success text-white p-3">
                <h5 className="modal-title h6 fw-bold">Start POS Day ({startDayDateInput})</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowStartModal(false)} />
              </div>
              <form onSubmit={handleStartDaySubmit}>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">
                    Specify opening register cash float to initiate POS transactions for <strong>{startDayDateInput}</strong>.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Opening Cash Float ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control form-control-lg font-monospace fw-bold text-success"
                      value={openingCashInput}
                      onChange={(e) => setOpeningCashInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Opening Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Morning shift opened"
                      value={startDayNotes}
                      onChange={(e) => setStartDayNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStartModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success fw-bold px-4">Confirm Start Day</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Close Day Confirmation Modal */}
      {showCloseModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold">Close POS Day ({closeDayDateInput})</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCloseModal(false)} />
              </div>
              <form onSubmit={handleCloseDaySubmit}>
                <div className="modal-body p-4">
                  <p className="small text-muted mb-3">
                    Reconcile drawer cash and confirm closing of POS register for {closeDayDateInput}.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Counted Cash ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control form-control-lg font-monospace fw-bold text-success"
                      value={closingCashInput}
                      onChange={(e) => setClosingCashInput(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger fw-bold px-4">Confirm Close</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit POS Day Modal */}
      {showAddModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold">{editingRecord ? 'Edit POS Day Record' : 'Add POS Day Record'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleSaveAddEdit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Business Date *</label>
                    <input
                      type="text"
                      required
                      className="form-control font-monospace"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Opening Cash ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control font-monospace"
                      value={formOpeningCash}
                      onChange={(e) => setFormOpeningCash(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Total Sales ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control font-monospace"
                      value={formSales}
                      onChange={(e) => setFormSales(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Open' | 'Closed')}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Integration Modal */}
      <GoogleDriveModal
        isOpen={showDriveModal}
        onClose={() => setShowDriveModal(false)}
        exportDataName={`POS_Days_Backup_${new Date().toISOString().split('T')[0]}.csv`}
        exportDataContent={generateCSVContent()}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
