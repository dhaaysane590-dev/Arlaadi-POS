import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Copy,
  HardDrive,
  Printer,
  Download,
  Mail,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { GoogleDriveModal } from '../drive/GoogleDriveModal';
import { db } from '../../utils/db';

export interface ClosedDateRecord {
  id: string;
  sNo: number;
  date: string; // e.g. "17-04-2026"
  reason?: string;
  status?: string;
}

interface ClosedDatesViewProps {
  isDarkMode?: boolean;
}

export const ClosedDatesView: React.FC<ClosedDatesViewProps> = ({ isDarkMode = false }) => {
  const [closedDates, setClosedDates] = useState<ClosedDateRecord[]>(() => {
    const saved = db.getClosedDates();
    if (saved && saved.length > 0) {
      return saved.map((item: any, idx: number) => {
        if (typeof item === 'string') {
          return { id: `cd-${idx}`, sNo: idx + 1, date: item };
        }
        return { ...item, sNo: idx + 1 };
      });
    }
    return [
      { id: 'cd-1', sNo: 1, date: '17-04-2026', reason: 'National Holiday' },
      { id: 'cd-2', sNo: 2, date: '16-04-2026', reason: 'Maintenance & Renovations' },
      { id: 'cd-3', sNo: 3, date: '02-02-2026', reason: 'Staff Training Day' },
      { id: 'cd-4', sNo: 4, date: '21-01-2026', reason: 'Annual Stock Counting' }
    ];
  });

  useEffect(() => {
    db.saveClosedDates(closedDates as any);
  }, [closedDates]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortAscending, setSortAscending] = useState<boolean>(false);

  // Modal States
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ClosedDateRecord | null>(null);
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [newReasonInput, setNewReasonInput] = useState<string>('');
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);
  const [copyNotification, setCopyNotification] = useState<boolean>(false);

  // Filter & Search
  const filteredDates = closedDates.filter(item =>
    item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.reason && item.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort
  const sortedDates = [...filteredDates].sort((a, b) => {
    if (sortAscending) {
      return a.date.localeCompare(b.date);
    } else {
      return b.date.localeCompare(a.date);
    }
  });

  // Pagination
  const totalEntries = sortedDates.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedDates = sortedDates.slice(startIndex, startIndex + entriesPerPage);

  // CRUD Actions
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateInput) return;

    // Convert date string YYYY-MM-DD to DD-MM-YYYY format if needed
    let formattedDate = newDateInput;
    if (newDateInput.includes('-') && newDateInput.split('-')[0].length === 4) {
      const parts = newDateInput.split('-');
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    if (editingRecord) {
      setClosedDates(prev =>
        prev.map(item =>
          item.id === editingRecord.id
            ? { ...item, date: formattedDate, reason: newReasonInput }
            : item
        )
      );
    } else {
      const newRecord: ClosedDateRecord = {
        id: 'cd-' + Date.now(),
        sNo: closedDates.length + 1,
        date: formattedDate,
        reason: newReasonInput || 'Closed Day'
      };
      setClosedDates(prev => [newRecord, ...prev]);
    }

    setShowAddModal(false);
    setEditingRecord(null);
    setNewDateInput('');
    setNewReasonInput('');
  };

  const handleEdit = (record: ClosedDateRecord) => {
    setEditingRecord(record);
    // Format DD-MM-YYYY back to YYYY-MM-DD for date input
    if (record.date.includes('-')) {
      const parts = record.date.split('-');
      if (parts[2].length === 4) {
        setNewDateInput(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        setNewDateInput(record.date);
      }
    } else {
      setNewDateInput(record.date);
    }
    setNewReasonInput(record.reason || '');
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to remove this closed date record?')) {
      setClosedDates(prev => {
        const remaining = prev.filter(item => item.id !== id);
        return remaining.map((item, index) => ({ ...item, sNo: index + 1 }));
      });
    }
  };

  const handleCopyToClipboard = () => {
    const textData = closedDates.map(item => `${item.sNo}\t${item.date}\t${item.reason || ''}`).join('\n');
    navigator.clipboard.writeText(`S.NO\tDATE\tREASON\n` + textData);
    setCopyNotification(true);
    setTimeout(() => setCopyNotification(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateCSVContent = () => {
    const rows = ['S.NO,DATE,REASON'];
    closedDates.forEach(item => {
      rows.push(`${item.sNo},"${item.date}","${item.reason || ''}"`);
    });
    return rows.join('\n');
  };

  const handleDownloadSingle = (record: ClosedDateRecord) => {
    const blob = new Blob([`S.NO,DATE,REASON\n${record.sNo},"${record.date}","${record.reason || ''}"`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Closed_Date_${record.date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = (record: ClosedDateRecord) => {
    const mailtoUrl = `mailto:?subject=Closed Date Notice: ${record.date}&body=Notice: The restaurant will be closed on ${record.date}. Reason: ${record.reason || 'N/A'}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className={`container-fluid p-4 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
      
      {/* Top Header: Title Left, Search Right */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="h3 fw-semibold text-primary mb-0">Closed Dates</h1>

        <div className="d-flex align-items-center gap-2">
          <div className="position-relative" style={{ width: '280px' }}>
            <input
              type="text"
              className="form-control rounded-pill ps-4 pe-5 border-secondary-subtle shadow-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-muted position-absolute end-0 top-50 translate-middle-y me-3" />
          </div>

          <button
            onClick={() => {
              setEditingRecord(null);
              setNewDateInput('');
              setNewReasonInput('');
              setShowAddModal(true);
            }}
            className="btn btn-primary rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Closed Date</span>
          </button>
        </div>
      </div>

      {copyNotification && (
        <div className="alert alert-success py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Closed dates table copied to clipboard!</span>
        </div>
      )}

      {/* Main Table Card Container matching screenshot */}
      <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        
        {/* Header Toolbar matching Image 1: Show entries left, Toolbar icons right */}
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

          {/* Action Icons Group: Eye, Copy, Database/Drive, Print */}
          <div className="btn-group bg-white rounded-3 shadow-sm border p-1">
            <button
              onClick={() => alert(`Showing total ${closedDates.length} closed dates records`)}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="View Info"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Copy Table"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDriveModal(true)}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Google Drive Cloud Sync"
            >
              <HardDrive className="w-4 h-4 text-primary" />
            </button>
            <button
              onClick={handlePrint}
              className="btn btn-sm btn-light border-0 text-secondary hover:text-primary px-2.5 py-1"
              title="Print Table"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Data Table */}
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
                <th style={{ width: '220px' }} className="text-center fw-bold">
                  <span className="fs-6">⚙</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedDates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-muted">
                    No closed dates records found.
                  </td>
                </tr>
              ) : (
                displayedDates.map((item, idx) => (
                  <tr key={item.id} className="border-bottom">
                    <td className="ps-4 font-monospace text-secondary fw-semibold">
                      {startIndex + idx + 1}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="fw-bold font-monospace text-dark fs-6">{item.date}</span>
                        {item.reason && (
                          <span className="badge bg-light text-secondary border ms-2 font-normal small">
                            {item.reason}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button
                          onClick={() => handleDownloadSingle(item)}
                          className="btn btn-sm btn-outline-secondary p-1.5 rounded-2"
                          title="Download record CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(item)}
                          className="btn btn-sm btn-outline-primary p-1.5 rounded-2"
                          title="Email notification"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn btn-sm btn-outline-info p-1.5 rounded-2"
                          title="Edit closed date"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
                          title="Delete closed date"
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

        {/* Footer Toolbar: Showing entries left, Pagination right */}
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

      {/* Add / Edit Closed Date Modal */}
      {showAddModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content border-0 shadow-lg rounded-3 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
              
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold mb-0">
                  {editingRecord ? 'Edit Closed Date' : 'Add New Closed Date'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
              </div>

              <form onSubmit={handleAddSubmit}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Select Closed Date *</label>
                    <input
                      type="date"
                      required
                      className="form-control form-control-lg font-monospace fw-bold"
                      value={newDateInput}
                      onChange={(e) => setNewDateInput(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Reason / Description (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. National Holiday / Maintenance"
                      value={newReasonInput}
                      onChange={(e) => setNewReasonInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">
                    {editingRecord ? 'Save Changes' : 'Add Closed Date'}
                  </button>
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
        exportDataName={`Closed_Dates_Backup_${new Date().toISOString().split('T')[0]}.csv`}
        exportDataContent={generateCSVContent()}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
