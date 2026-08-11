import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, MenuItem, RestaurantSettings } from '../../types';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  Check,
  Utensils,
  BookOpen,
  Trash2,
  Printer,
  UtensilsCrossed
} from 'lucide-react';
import { triggerKotPrint } from '../../utils/printReceipt';

interface KitchenViewProps {
  orders: Order[];
  menuItems: MenuItem[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  enableSoundAlerts: boolean;
  isDarkMode: boolean;
  settings?: RestaurantSettings;
}

export const KitchenView: React.FC<KitchenViewProps> = ({
  orders,
  menuItems,
  onUpdateOrderStatus,
  onDeleteOrder,
  enableSoundAlerts,
  isDarkMode,
  settings
}) => {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(enableSoundAlerts);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItem | null>(null);

  // Filter Active Kitchen Tickets (Pending, Preparing, Ready)
  const kitchenTickets = orders.filter((o) => {
    if (filterStatus === 'active') {
      return ['Pending', 'Preparing', 'Ready'].includes(o.status);
    }
    return o.status === filterStatus;
  });

  // Synthesize Kitchen Sound Beep Chime
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('Audio Context error', e);
    }
  };

  const getUrgencyColor = (createdAt: string) => {
    const elapsedMinutes = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60);
    if (elapsedMinutes > 20) return 'border-danger bg-danger-subtle text-danger';
    if (elapsedMinutes > 10) return 'border-warning bg-warning-subtle text-dark';
    return 'border-success bg-success-subtle text-success';
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    switch (current) {
      case 'Pending': return 'Preparing';
      case 'Preparing': return 'Ready';
      case 'Ready': return 'Served';
      default: return null;
    }
  };

  return (
    <div className="container-fluid p-4">
      
      {/* KDS Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-warning text-dark rounded-3 shadow-sm">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Kitchen Display System (KDS)</h1>
            <p className="text-muted small mb-0">Live order queue for kitchen chefs and line cooks</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          
          {/* Status Filter Pills */}
          <div className="btn-group btn-group-sm">
            <button
              onClick={() => setFilterStatus('active')}
              className={`btn ${filterStatus === 'active' ? 'btn-dark' : 'btn-outline-secondary'}`}
            >
              Active Tickets ({orders.filter(o => ['Pending', 'Preparing', 'Ready'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setFilterStatus('Pending')}
              className={`btn ${filterStatus === 'Pending' ? 'btn-danger' : 'btn-outline-secondary'}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('Preparing')}
              className={`btn ${filterStatus === 'Preparing' ? 'btn-warning text-dark' : 'btn-outline-secondary'}`}
            >
              Preparing
            </button>
            <button
              onClick={() => setFilterStatus('Ready')}
              className={`btn ${filterStatus === 'Ready' ? 'btn-success' : 'btn-outline-secondary'}`}
            >
              Ready
            </button>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className={`btn btn-sm d-flex align-items-center gap-1.5 ${soundEnabled ? 'btn-success' : 'btn-outline-secondary'}`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="small">{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

        </div>
      </div>

      {/* Tickets Grid */}
      <div className="row g-3">
        {kitchenTickets.length === 0 ? (
          <div className="col-12 text-center py-5">
            <CheckCircle2 className="w-16 h-16 text-success opacity-50 mb-3" />
            <h5 className="fw-bold text-muted">All Kitchen Orders Clear!</h5>
            <p className="text-muted small">New incoming POS orders will appear here automatically.</p>
          </div>
        ) : (
          kitchenTickets.map((ord) => {
            const urgencyClass = getUrgencyColor(ord.createdAt);
            const nextStat = getNextStatus(ord.status);

            return (
              <div key={ord.id} className="col-12 col-md-6 col-lg-4">
                <div className={`card h-100 border shadow-sm rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
                  
                  {/* Ticket Header */}
                  <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-bold h6 mb-0 text-primary font-monospace">{ord.orderNumber}</span>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.72rem' }}>
                          {ord.orderType}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (settings) {
                              triggerKotPrint(ord, settings);
                            } else {
                              triggerKotPrint(ord, { name: 'Restaurant Kitchen' } as any);
                            }
                          }}
                          className="btn btn-xs btn-outline-warning text-dark fw-bold p-1 rounded-2 d-inline-flex align-items-center gap-1 shadow-sm"
                          title="Print Kitchen Order Ticket (KOT) to Kitchen Thermal Printer"
                          style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                        >
                          <Printer className="w-3.5 h-3.5 text-warning" />
                          <span>Print KOT</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete KOT ticket ${ord.orderNumber}?`)) {
                              if (onDeleteOrder) onDeleteOrder(ord.id);
                            }
                          }}
                          className="btn btn-xs btn-outline-danger p-1 rounded-2"
                          title="Delete Ticket"
                          style={{ padding: '1px 5px' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.85rem' }}>
                        {ord.tableName ? `Table: ${ord.tableName}` : 'Counter / To-Go'}
                      </div>
                    </div>

                    <div className="text-end">
                      <span className={`badge ${urgencyClass} border d-inline-flex align-items-center gap-1 mb-1 font-monospace`} style={{ fontSize: '0.72rem' }}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{Math.round((Date.now() - new Date(ord.createdAt).getTime()) / 60000)}m ago</span>
                      </span>
                      <div>
                        <span className={`badge px-2.5 py-1 rounded-pill ${
                          ord.status === 'Pending' ? 'bg-danger text-white' :
                          ord.status === 'Preparing' ? 'bg-warning text-dark' : 'bg-success text-white'
                        }`} style={{ fontSize: '0.75rem' }}>
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Items List */}
                  <div className="p-3 flex-grow-1" style={{ maxHeight: '260px', overflowY: 'auto', fontSize: '0.88rem' }}>
                    {ord.kitchenNotes && (
                      <div className="alert alert-warning py-1.5 px-2.5 mb-2 rounded-2 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                        <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />
                        <span>Note: <strong>{ord.kitchenNotes}</strong></span>
                      </div>
                    )}

                    <div className="list-group list-group-flush">
                      {ord.items.map((item) => (
                        <div key={item.id} className="list-group-item px-0 py-2 border-bottom bg-transparent d-flex align-items-start justify-content-between">
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.88rem' }}>
                              <span className="badge bg-primary text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.78rem' }}>{item.quantity}x</span>
                              <span>{item.name}</span>
                            </div>

                            {item.selectedVariant && (
                              <div className="text-muted ms-4 mt-0.5" style={{ fontSize: '0.78rem' }}>• Portion: {item.selectedVariant.name}</div>
                            )}

                            {item.selectedAddons && item.selectedAddons.length > 0 && (
                              <div className="text-muted ms-4" style={{ fontSize: '0.78rem' }}>
                                • Extras: {item.selectedAddons.map(a => a.name).join(', ')}
                              </div>
                            )}

                            {item.kitchenNotes && (
                              <div className="text-danger fw-bold ms-4 mt-0.5" style={{ fontSize: '0.78rem' }}>
                                ★ {item.kitchenNotes}
                              </div>
                            )}
                          </div>

                          {/* Recipe Inspector Link */}
                          <button
                            onClick={() => {
                              const mi = menuItems.find(m => m.id === item.menuItemId);
                              if (mi) setSelectedRecipeItem(mi);
                            }}
                            className="btn btn-sm btn-link p-0 text-muted ms-2"
                            title="Inspect Recipe & Ingredients"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>

                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Action Footer */}
                  <div className="p-2.5 bg-light border-top d-flex align-items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (settings) {
                          triggerKotPrint(ord, settings);
                        } else {
                          triggerKotPrint(ord, { name: 'Restaurant Kitchen' } as any);
                        }
                      }}
                      className="btn btn-outline-dark fw-bold d-flex align-items-center justify-content-center gap-1.5 shadow-sm py-2 px-3"
                      style={{ fontSize: '0.82rem' }}
                      title="Send Kitchen Order Ticket (KOT) to Designated Thermal Printer"
                    >
                      <Printer className="w-4 h-4 text-warning" />
                      <span>Print KOT</span>
                    </button>

                    {nextStat && (
                      <button
                        onClick={() => {
                          onUpdateOrderStatus(ord.id, nextStat);
                          playKitchenChime();
                        }}
                        className={`btn flex-grow-1 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm py-2 ${
                          nextStat === 'Preparing' ? 'btn-warning text-dark' :
                          nextStat === 'Ready' ? 'btn-success text-white' : 'btn-primary'
                        }`}
                        style={{ fontSize: '0.88rem' }}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Move to {nextStat}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Recipe Inspector Modal */}
      {selectedRecipeItem && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-dark text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <BookOpen className="w-5 h-5 text-warning" />
                  <span>Recipe & Ingredients: {selectedRecipeItem.name}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedRecipeItem(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <img src={selectedRecipeItem.image} alt="" className="rounded-3" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  <div>
                    <h6 className="fw-bold mb-1">{selectedRecipeItem.name}</h6>
                    <span className="badge bg-primary">Prep Time: {selectedRecipeItem.prepTimeMinutes} mins</span>
                  </div>
                </div>

                <h6 className="fw-bold small text-muted text-uppercase mb-2">Required Portion Recipe Ingredients</h6>
                {selectedRecipeItem.recipe && selectedRecipeItem.recipe.length > 0 ? (
                  <div className="list-group">
                    {selectedRecipeItem.recipe.map((rec, idx) => (
                      <div key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Ingredient Code: #{rec.ingredientId}</span>
                        <span className="fw-bold text-success font-monospace">{rec.quantityRequired} Portion Unit</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small">Standard recipe portion prepared per head chef specs.</p>
                )}
              </div>

              <div className="modal-footer bg-light p-2">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecipeItem(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
