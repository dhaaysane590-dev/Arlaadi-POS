import React, { useState } from 'react';
import { Ingredient, Supplier } from '../../types';
import {
  Package,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Truck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface InventoryViewProps {
  ingredients: Ingredient[];
  suppliers: Supplier[];
  onRestockIngredient: (ingredientId: string, addedQuantity: number) => void;
  isDarkMode: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  ingredients,
  suppliers,
  onRestockIngredient,
  isDarkMode
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedIngredientForRestock, setSelectedIngredientForRestock] = useState<Ingredient | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmRestock = () => {
    if (selectedIngredientForRestock && restockQty > 0) {
      onRestockIngredient(selectedIngredientForRestock.id, restockQty);
      alert(`Restocked ${restockQty} ${selectedIngredientForRestock.unit} of ${selectedIngredientForRestock.name}!`);
      setSelectedIngredientForRestock(null);
    }
  };

  return (
    <div className="container-fluid p-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-warning text-dark rounded-3 shadow-sm">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Raw Ingredients & Stock Inventory</h1>
            <p className="text-muted small mb-0">Automated POS recipe stock deductions, reorder triggers, and supplier POs</p>
          </div>
        </div>

        <div className="badge bg-success-subtle text-success border border-success-subtle p-2">
          ★ Auto Recipe Stock Deduction Enabled
        </div>
      </div>

      {/* Stock Cards */}
      <div className={`card border-0 shadow-sm rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
        <div className="card-header bg-transparent p-3 d-flex align-items-center justify-content-between">
          <div className="input-group style-badge" style={{ maxWidth: '320px' }}>
            <span className="input-group-text bg-transparent"><Search className="w-4 h-4 text-muted" /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search ingredient or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="small text-muted fw-semibold">
            {ingredients.filter(i => i.stockQuantity <= i.minThreshold).length} Low Stock Alerts
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code & Ingredient</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Reorder Level</th>
                <th>Unit Cost</th>
                <th>Total Value</th>
                <th>Supplier</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ing) => {
                const isLow = ing.stockQuantity <= ing.minThreshold;
                const totalValue = ing.stockQuantity * ing.unitCost;

                return (
                  <tr key={ing.id} className={isLow ? 'table-danger' : ''}>
                    <td className="fw-bold font-monospace">
                      <div>{ing.name}</div>
                      <span className="text-muted style-badge">{ing.code}</span>
                    </td>

                    <td>
                      <span className="badge bg-light text-dark border">{ing.category}</span>
                    </td>

                    <td>
                      <div className="fw-bold font-monospace h6 mb-0">
                        {ing.stockQuantity} <span className="small text-muted">{ing.unit}</span>
                      </div>
                      {isLow && (
                        <span className="badge bg-danger text-white style-badge d-inline-flex align-items-center gap-1 mt-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </span>
                      )}
                    </td>

                    <td className="font-monospace text-muted">{ing.minThreshold} {ing.unit}</td>
                    <td className="font-monospace">${ing.unitCost.toFixed(2)} / {ing.unit}</td>
                    <td className="fw-bold font-monospace text-primary">${totalValue.toFixed(2)}</td>
                    <td className="small">{ing.supplierName}</td>

                    <td className="text-end">
                      <button
                        onClick={() => {
                          setSelectedIngredientForRestock(ing);
                          setRestockQty(20);
                        }}
                        className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Stock In</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedIngredientForRestock && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold">Stock In / Purchase Restock</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedIngredientForRestock(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="fw-bold h5 mb-1">{selectedIngredientForRestock.name}</div>
                <p className="small text-muted mb-3">Supplier: {selectedIngredientForRestock.supplierName}</p>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Quantity to Add ({selectedIngredientForRestock.unit})</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control form-control-lg font-monospace fw-bold"
                    value={restockQty}
                    onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="p-3 bg-light rounded-3 font-monospace small">
                  <div>New Quantity: <strong>{selectedIngredientForRestock.stockQuantity + restockQty} {selectedIngredientForRestock.unit}</strong></div>
                  <div>Purchase Cost: <strong>${(restockQty * selectedIngredientForRestock.unitCost).toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="modal-footer bg-light p-3">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIngredientForRestock(null)}>Cancel</button>
                <button className="btn btn-success btn-sm fw-bold" onClick={handleConfirmRestock}>Confirm Restock</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
