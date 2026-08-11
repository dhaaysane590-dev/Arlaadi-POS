import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Copy,
  HardDrive,
  Printer,
  Trash2,
  Edit2,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowUpDown
} from 'lucide-react';
import { GoogleDriveModal } from '../drive/GoogleDriveModal';
import { db } from '../../utils/db';

export interface FloorRecord {
  id: string;
  sNo: number;
  name: string;
  status: 'Active' | 'Inactive';
  tableCount?: number;
}

interface FloorsViewProps {
  isDarkMode?: boolean;
  floorsList?: FloorRecord[];
  onAddFloor?: (floor: FloorRecord) => void;
  onUpdateFloor?: (floor: FloorRecord) => void;
  onDeleteFloor?: (id: string) => void;
}

export const FloorsView: React.FC<FloorsViewProps> = ({ isDarkMode = false }) => {
  const [floors, setFloors] = useState<FloorRecord[]>(() => {
    const saved = db.getFloors();
    if (saved && saved.length > 0) return saved as FloorRecord[];
    return [
      { id: 'floor-1', sNo: 1, name: 'Qeybta Hoose', status: 'Active', tableCount: 8 },
      { id: 'floor-2', sNo: 2, name: 'Qeybta Sare', status: 'Active', tableCount: 12 },
      { id: 'floor-3', sNo: 3, name: 'Dabaqa saddexaad', status: 'Active', tableCount: 6 }
    ];
  });

  useEffect(() => {
    db.saveFloors(floors as any);
  }, [floors]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortAscending, setSortAscending] = useState<boolean>(true);

  // Modal & Edit state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingFloor, setEditingFloor] = useState<FloorRecord | null>(null);
  const [floorNameInput, setFloorNameInput] = useState<string>('');
  const [floorStatusInput, setFloorStatusInput] = useState<'Active' | 'Inactive'>('Active');
  const [showDriveModal, setShowDriveModal] = useState<boolean>(false);

  // Search & Filter
  const filteredFloors = floors.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort
  const sortedFloors = [...filteredFloors].sort((a, b) => {
    if (sortAscending) {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  // Pagination
  const totalEntries = sortedFloors.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const startIndex = (currentPage - 1) * entriesPerPage;
  const displayedFloors = sortedFloors.slice(startIndex, startIndex + entriesPerPage);

  // CRUD Actions
  const handleSaveFloor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!floorNameInput.trim()) return;

    if (editingFloor) {
      setFloors(prev =>
        prev.map(f =>
          f.id === editingFloor.id
            ? { ...f, name: floorNameInput, status: floorStatusInput }
            : f
        )
      );
    } else {
      const newFloorRecord: FloorRecord = {
        id: 'floor-' + Date.now(),
        sNo: floors.length + 1,
        name: floorNameInput,
        status: floorStatusInput,
        tableCount: 0
      };
      setFloors(prev => [...prev, newFloorRecord]);
    }

    setShowAddModal(false);
    setEditingFloor(null);
    setFloorNameInput('');
  };

  const handleEdit = (floor: FloorRecord) => {
    setEditingFloor(floor);
    setFloorNameInput(floor.name);
    setFloorStatusInput(floor.status);
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this floor section?')) {
      setFloors(prev => {
        const remaining = prev.filter(f => f.id !== id);
        return remaining.map((f, idx) => ({ ...f, sNo: idx + 1 }));
      });
    }
  };

  const handleCopyTable = () => {
    const textData = floors.map(f => `${f.sNo}\t${f.name}\t${f.status}`).join('\n');
    navigator.clipboard.writeText(`S.NO\tNAME\tSTATUS\n` + textData);
    alert('Floors table copied to clipboard!');
  };

  const generateCSVContent = () => {
    const rows = ['S.NO,NAME,STATUS'];
    floors.forEach(f => {
      rows.push(`${f.sNo},"${f.name}",${f.status}`);
    });
    return rows.join('\n');
  };

  return (
    <div className={`container-fluid p-4 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
      
      {/* Top Header Title & Search bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="h3 fw-semibold text-primary mb-0">Floors</h1>

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
              setEditingFloor(null);
              setFloorNameInput('');
              setFloorStatusInput('Active');
              setShowAddModal(true);
            }}
            className="btn btn-primary rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Floor</span>
          </button>
        </div>
      </div>

      {/* Main Table Card Container matching screenshot */}
      <div className={`card border-0 shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark border-secondary' : 'bg-white'}`}>
        
        {/* Header Toolbar: Show entries left, Toolbar icons right */}
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
              onClick={() => alert(`Total ${floors.length} floor sections configured`)}
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
              title="Google Drive Backup"
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

        {/* Data Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary border-bottom">
              <tr>
                <th style={{ width: '80px' }} className="ps-4 fw-bold">S.NO</th>
                <th className="fw-bold cursor-pointer" onClick={() => setSortAscending(!sortAscending)}>
                  <div className="d-flex align-items-center gap-1">
                    <span>NAME</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                  </div>
                </th>
                <th className="fw-bold">
                  <div className="d-flex align-items-center gap-1">
                    <span>STATUS</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
                  </div>
                </th>
                <th style={{ width: '180px' }} className="text-center fw-bold">
                  <span className="fs-6">⚙</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedFloors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5 text-muted">
                    No floor records found.
                  </td>
                </tr>
              ) : (
                displayedFloors.map((floor, idx) => (
                  <tr key={floor.id} className="border-bottom">
                    <td className="ps-4 font-monospace text-secondary fw-semibold">
                      {startIndex + idx + 1}
                    </td>
                    <td className="fw-bold text-dark fs-6">{floor.name}</td>
                    <td>
                      <span className={`badge ${floor.status === 'Active' ? 'bg-success' : 'bg-secondary'} px-2.5 py-1 rounded-pill`}>
                        {floor.status}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex align-items-center justify-content-center gap-1.5">
                        <button
                          onClick={() => handleEdit(floor)}
                          className="btn btn-sm btn-outline-info p-1.5 rounded-2"
                          title="Edit floor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(floor.id)}
                          className="btn btn-sm btn-outline-danger p-1.5 rounded-2"
                          title="Delete floor"
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

      {/* Add / Edit Floor Modal */}
      {showAddModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className={`modal-content border-0 shadow-lg rounded-3 ${isDarkMode ? 'bg-dark text-white' : ''}`}>
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold">
                  {editingFloor ? 'Edit Floor' : 'Add New Floor'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
              </div>

              <form onSubmit={handleSaveFloor}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Floor Name *</label>
                    <input
                      type="text"
                      required
                      className="form-control form-control-lg fw-semibold"
                      placeholder="e.g. Qeybta Hoose / VIP Hall"
                      value={floorNameInput}
                      onChange={(e) => setFloorNameInput(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={floorStatusInput}
                      onChange={(e) => setFloorStatusInput(e.target.value as 'Active' | 'Inactive')}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-bold px-4">
                    {editingFloor ? 'Save Changes' : 'Create Floor'}
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
        exportDataName={`Floors_Backup_${new Date().toISOString().split('T')[0]}.csv`}
        exportDataContent={generateCSVContent()}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
