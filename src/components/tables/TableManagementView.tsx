import React, { useState } from 'react';
import { RestaurantTable, Order } from '../../types';
import {
  Grid,
  Users,
  QrCode,
  Plus,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  Utensils,
  Share2,
  Printer,
  Edit2,
  Trash2
} from 'lucide-react';

interface TableManagementViewProps {
  tables: RestaurantTable[];
  orders: Order[];
  onSelectTableForPOS: (table: RestaurantTable) => void;
  onUpdateTableStatus: (tableId: string, status: RestaurantTable['status']) => void;
  onMergeTables: (sourceTableId: string, targetTableId: string) => void;
  onAddTable?: (table: RestaurantTable) => void;
  onUpdateTable?: (table: RestaurantTable) => void;
  onDeleteTable?: (tableId: string) => void;
  isDarkMode: boolean;
}

export const TableManagementView: React.FC<TableManagementViewProps> = ({
  tables,
  orders,
  onSelectTableForPOS,
  onUpdateTableStatus,
  onMergeTables,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  isDarkMode
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [qrModalTable, setQrModalTable] = useState<RestaurantTable | null>(null);
  const [mergeModalSource, setMergeModalSource] = useState<RestaurantTable | null>(null);
  const [targetTableId, setTargetTableId] = useState<string>('');
  const [tableToDelete, setTableToDelete] = useState<{ id: string; number: string } | null>(null);

  // Table Modal State (Create / Edit)
  const [showTableModal, setShowTableModal] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [formNumber, setFormNumber] = useState<string>('');
  const [formArea, setFormArea] = useState<string>('Main Hall');
  const [formCapacity, setFormCapacity] = useState<number>(4);
  const [formStatus, setFormStatus] = useState<RestaurantTable['status']>('Available');

  const filteredTables = tables.filter(t => selectedArea === 'all' || t.area === selectedArea);

  const getStatusBadge = (status: RestaurantTable['status']) => {
    switch (status) {
      case 'Available': return 'bg-success text-white';
      case 'Occupied': return 'bg-danger text-white';
      case 'Reserved': return 'bg-warning text-dark';
      case 'Cleaning': return 'bg-info text-dark';
      default: return 'bg-secondary text-white';
    }
  };

  const handleOpenAddTable = () => {
    setEditingTable(null);
    setFormNumber(`T-${tables.length + 101}`);
    setFormArea('Main Hall');
    setFormCapacity(4);
    setFormStatus('Available');
    setShowTableModal(true);
  };

  const handleOpenEditTable = (table: RestaurantTable, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTable(table);
    setFormNumber(table.tableNumber);
    setFormArea(table.area);
    setFormCapacity(table.capacity);
    setFormStatus(table.status);
    setShowTableModal(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber.trim()) return;

    if (editingTable) {
      const updated: RestaurantTable = {
        ...editingTable,
        tableNumber: formNumber.trim(),
        area: formArea,
        capacity: Number(formCapacity) || 4,
        status: formStatus
      };
      if (onUpdateTable) onUpdateTable(updated);
    } else {
      const newTable: RestaurantTable = {
        id: 'tbl-' + Date.now(),
        tableNumber: formNumber.trim(),
        area: formArea,
        capacity: Number(formCapacity) || 4,
        status: formStatus
      };
      if (onAddTable) onAddTable(newTable);
    }
    setShowTableModal(false);
  };

  const handleDeleteTableClick = (tableId: string, tableNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setTableToDelete({ id: tableId, number: tableNumber });
  };

  const confirmDeleteTable = () => {
    if (tableToDelete && onDeleteTable) {
      onDeleteTable(tableToDelete.id);
    }
    setTableToDelete(null);
  };

  const handleExecuteMerge = () => {
    if (mergeModalSource && targetTableId) {
      onMergeTables(mergeModalSource.id, targetTableId);
      setMergeModalSource(null);
      alert(`Tables merged successfully!`);
    }
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Table & Floor Plan Management</h1>
            <p className="text-muted small mb-0">Real-time table status, floor layout, adding/editing tables, and QR ordering</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Add Table Button */}
          <button
            onClick={handleOpenAddTable}
            className="btn btn-primary d-flex align-items-center gap-1.5 shadow-sm fw-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Table</span>
          </button>

          {/* Dining Area Tabs */}
          <div className="btn-group btn-group-sm">
            {['all', 'Main Hall', 'VIP Lounge', 'Terrace', 'Bar Area'].map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`btn ${selectedArea === area ? 'btn-primary shadow-sm fw-semibold' : 'btn-outline-secondary'}`}
              >
                {area === 'all' ? 'All Areas' : area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Floor Plan Grid (Small Cards with Medium Font) */}
      <div className="row g-3">
        {filteredTables.map((tbl) => {
          const currentOrder = orders.find(o => o.id === tbl.currentOrderId);

          return (
            <div key={tbl.id} className="col-6 col-md-4 col-lg-3 col-xl-2">
              <div className={`card h-100 border shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
                
                {/* Table Header */}
                <div className="p-2.5 border-bottom d-flex align-items-center justify-content-between bg-light">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="fw-bold text-primary font-monospace" style={{ fontSize: '0.92rem' }}>{tbl.tableNumber}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditTable(tbl, e)}
                      className="btn btn-xs btn-outline-secondary p-1 rounded"
                      title="Edit Table"
                      style={{ padding: '2px 5px', fontSize: '0.7rem' }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTableClick(tbl.id, tbl.tableNumber, e)}
                      className="btn btn-xs btn-outline-danger p-1 rounded"
                      title="Delete Table"
                      style={{ padding: '2px 5px', fontSize: '0.7rem' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Table Body */}
                <div className="p-2.5 flex-grow-1" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex align-items-center justify-content-between mb-1.5">
                    <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.68rem' }}>{tbl.area}</span>
                    <span className={`badge ${getStatusBadge(tbl.status)} px-2 py-0.5 rounded-pill`} style={{ fontSize: '0.68rem' }}>
                      {tbl.status}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-1.5 text-muted mb-2" style={{ fontSize: '0.8rem' }}>
                    <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{tbl.capacity} Seats</span>
                  </div>

                  {currentOrder && (
                    <div className="alert alert-primary p-1.5 mb-1.5 rounded-2" style={{ fontSize: '0.72rem' }}>
                      <div className="fw-bold text-truncate">{currentOrder.orderNumber} (${currentOrder.totalAmount.toFixed(2)})</div>
                      <div className="text-truncate">{currentOrder.customerName}</div>
                    </div>
                  )}

                  {tbl.mergedWith && tbl.mergedWith.length > 0 && (
                    <div className="alert alert-warning p-1 mb-1 rounded-2" style={{ fontSize: '0.7rem' }}>
                      Merged: {tbl.mergedWith.join(', ')}
                    </div>
                  )}
                </div>

                {/* Table Action Footer */}
                <div className="p-2 bg-light border-top d-flex align-items-center justify-content-between gap-1">
                  
                  {tbl.status === 'Available' && (
                    <button
                      onClick={() => onSelectTableForPOS(tbl)}
                      className="btn btn-xs btn-primary fw-semibold flex-grow-1 d-flex align-items-center justify-content-center gap-1 py-1"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Utensils className="w-3 h-3" />
                      <span>POS</span>
                    </button>
                  )}

                  {tbl.status === 'Occupied' && (
                    <button
                      onClick={() => onUpdateTableStatus(tbl.id, 'Cleaning')}
                      className="btn btn-xs btn-outline-warning text-dark flex-grow-1 py-1"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Clean
                    </button>
                  )}

                  {tbl.status === 'Cleaning' && (
                    <button
                      onClick={() => onUpdateTableStatus(tbl.id, 'Available')}
                      className="btn btn-xs btn-success flex-grow-1 py-1"
                      style={{ fontSize: '0.72rem' }}
                    >
                      Available
                    </button>
                  )}

                  {/* Merge Button */}
                  <button
                    onClick={() => setMergeModalSource(tbl)}
                    className="btn btn-xs btn-outline-secondary p-1"
                    title="Merge Table"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>

                  {/* QR Code Button */}
                  <button
                    onClick={() => setQrModalTable(tbl)}
                    className="btn btn-xs btn-outline-dark p-1"
                    title="Generate QR Code"
                  >
                    <QrCode className="w-3 h-3" />
                  </button>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {showTableModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveTable}>
                <div className="modal-header bg-primary text-white p-3">
                  <h5 className="modal-title h6 fw-bold">
                    {editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Add New Table'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowTableModal(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Table Number / Identifier</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      required
                      placeholder="e.g. T-12 or VIP-1"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Dining Area</label>
                    <select
                      className="form-select form-select-sm"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                    >
                      <option value="Main Hall">Main Hall</option>
                      <option value="VIP Lounge">VIP Lounge</option>
                      <option value="Terrace">Terrace</option>
                      <option value="Bar Area">Bar Area</option>
                    </select>
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Seating Capacity (Guests)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="form-control form-control-sm"
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="mb-2.5">
                    <label className="form-label small fw-semibold mb-1">Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as RestaurantTable['status'])}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Cleaning">Cleaning</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer bg-light p-2.5">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowTableModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm fw-bold px-3">
                    {editingTable ? 'Update Table' : 'Create Table'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table QR Code Modal */}
      {qrModalTable && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title h6 fw-bold">Table {qrModalTable.tableNumber} QR Code</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setQrModalTable(null)}></button>
              </div>

              <div className="modal-body p-4 text-center">
                <p className="small text-muted mb-3">Guests can scan this QR code to view digital menu and self-order!</p>
                <img
                  src={qrModalTable.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Table-${qrModalTable.tableNumber}`}
                  alt="Table QR"
                  className="rounded border p-2 mb-3 shadow-sm"
                  style={{ width: '180px', height: '180px' }}
                />
                <div className="font-monospace fw-bold text-primary">{qrModalTable.tableNumber} - {qrModalTable.area}</div>
              </div>

              <div className="modal-footer bg-light p-2 d-flex justify-content-between">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setQrModalTable(null)}>Close</button>
                <button className="btn btn-sm btn-primary d-flex align-items-center gap-1" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" />
                  <span>Print QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merge Tables Modal */}
      {mergeModalSource && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold">Merge Table {mergeModalSource.tableNumber}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setMergeModalSource(null)}></button>
              </div>

              <div className="modal-body p-4">
                <p className="small text-muted mb-3">Select another table to merge seating and bill calculations with Table {mergeModalSource.tableNumber}:</p>
                
                <select
                  className="form-select font-monospace mb-3"
                  value={targetTableId}
                  onChange={(e) => setTargetTableId(e.target.value)}
                >
                  <option value="">Select Target Table...</option>
                  {tables.filter(t => t.id !== mergeModalSource.id).map(t => (
                    <option key={t.id} value={t.id}>
                      Table {t.tableNumber} ({t.area} - {t.capacity} seats)
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setMergeModalSource(null)}>Cancel</button>
                <button className="btn btn-primary btn-sm fw-bold" onClick={handleExecuteMerge}>
                  Confirm Merge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Confirmation Modal */}
      {tableToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Table</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTableToDelete(null)}></button>
              </div>
              <div className="modal-body p-3 text-center">
                <p className="mb-1 text-dark fw-semibold">Delete Table {tableToDelete.number}?</p>
                <p className="small text-muted mb-0">This action will remove the table from the floor plan.</p>
              </div>
              <div className="modal-footer bg-light p-2.5 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setTableToDelete(null)}>Cancel</button>
                <button type="button" className="btn btn-sm btn-danger fw-bold px-3" onClick={confirmDeleteTable}>
                  Delete Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
