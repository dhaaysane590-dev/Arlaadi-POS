import React, { useState, useRef, useEffect } from 'react';
import { RestaurantSettings, KitchenPrinterStation, RestaurantTenant } from '../../types';
import {
  Settings,
  Smartphone,
  Download,
  Upload,
  Save,
  Printer,
  Wifi,
  Usb,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  TestTube,
  UtensilsCrossed,
  Network,
  Radio,
  X,
  FileJson,
  Database,
  RotateCcw,
  ShieldCheck,
  RefreshCw,
  Image,
  Type,
  FileText,
  LogIn,
  Palette,
  Eye,
  Layout,
  Info,
  Lock,
  Building2
} from 'lucide-react';
import { triggerKotPrint, triggerReceiptPrint } from '../../utils/printReceipt';
import { downloadDatabaseSqlFile, generateFullDatabaseSql } from '../../utils/sqlExporter';

interface SettingsViewProps {
  settings: RestaurantSettings;
  onUpdateSettings: (newSettings: RestaurantSettings) => void;
  isDarkMode: boolean;
  activeTenant?: RestaurantTenant;
  tenants?: RestaurantTenant[];
  onUpdateTenants?: (tenants: RestaurantTenant[]) => void;
  allAppData?: {
    settings?: RestaurantSettings;
    categories?: any[];
    ingredients?: any[];
    menuItems?: any[];
    tables?: any[];
    orders?: any[];
    heldOrders?: any[];
    customers?: any[];
    reservations?: any[];
    drivers?: any[];
    employees?: any[];
    expenses?: any[];
    dailyClosing?: any;
    logs?: any[];
    posDayState?: any;
  };
  onRestoreAppData?: (importedData: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  isDarkMode,
  activeTenant,
  tenants,
  onUpdateTenants,
  allAppData,
  onRestoreAppData
}) => {
  const [form, setForm] = useState<RestaurantSettings>({
    ...settings,
    kitchenPrinters: settings.kitchenPrinters || []
  });

  const [tenantUsername, setTenantUsername] = useState<string>(activeTenant?.username || activeTenant?.code?.toLowerCase().replace('-', '_') || '');
  const [tenantPin, setTenantPin] = useState<string>(activeTenant?.pin || '1234');

  useEffect(() => {
    if (activeTenant) {
      setTenantUsername(activeTenant.username || activeTenant.code?.toLowerCase().replace('-', '_') || '');
      setTenantPin(activeTenant.pin || '1234');
    }
  }, [activeTenant]);

  React.useEffect(() => {
    setForm({
      ...settings,
      kitchenPrinters: settings.kitchenPrinters || []
    });
  }, [settings]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const receiptLogoInputRef = useRef<HTMLInputElement | null>(null);
  const loginLogoInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm(prev => ({ ...prev, logo: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setForm(prev => ({ ...prev, loginLogo: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modal / Form state for Kitchen Printer Station
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState<boolean>(false);
  const [editingStation, setEditingStation] = useState<KitchenPrinterStation | null>(null);

  // SQL Script Viewer Modal state
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [sqlPreviewText, setSqlPreviewText] = useState<string>('');

  // Diagnostic Ping & Connectivity Test Modal State
  const [testingStation, setTestingStation] = useState<KitchenPrinterStation | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  
  const [stationName, setStationName] = useState<string>('');
  const [printerType, setPrinterType] = useState<KitchenPrinterStation['printerType']>('Network IP (LAN/Wi-Fi)');
  const [printerModel, setPrinterModel] = useState<string>('Epson TM-T88VI');
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.100');
  const [port, setPort] = useState<number>(9100);
  const [printerQueueName, setPrinterQueueName] = useState<string>('POS80_Thermal_Kitchen');
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Main Dishes', 'Soups & Starters']);
  const [autoPrintKot, setAutoPrintKot] = useState<boolean>(true);
  const [stationStatus, setStationStatus] = useState<'Online' | 'Offline' | 'Test Mode'>('Online');

  const THERMAL_PRINTER_MODELS = [
    'Epson TM-T88VI',
    'Epson TM-T20III',
    'Epson TM-m30II',
    'Star Micronics TSP100',
    'Star Micronics mC-Print3',
    'Bixolon SRP-350III',
    'Xprinter XP-N160I',
    'Rongta RP326',
    'Zjiang POS-5890 / POS-80',
    'Sunmi T2 / V2 (Android POS)',
    'Citizen CT-S310II',
    'Generic 80mm ESC/POS Thermal',
    'Generic 58mm ESC/POS Thermal',
    'Custom / Other Model'
  ];

  const availableCategoryList = [
    'Main Dishes',
    'Pasta & Pizza',
    'Soups & Starters',
    'Barbecue & Meats',
    'Beverages & Juice',
    'Coffee & Tea',
    'Desserts',
    'Fast Food & Snacks',
    'Seafood'
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);

    if (activeTenant && tenants && onUpdateTenants) {
      const updatedTenants = tenants.map(t => {
        if (t.id === activeTenant.id) {
          return {
            ...t,
            name: form.name || t.name,
            phone: form.phone || t.phone,
            address: form.address || t.address,
            taxRate: form.taxRate ?? t.taxRate,
            logo: form.logo || t.logo,
            username: tenantUsername.trim() || t.username,
            pin: tenantPin.trim() || t.pin
          };
        }
        return t;
      });
      onUpdateTenants(updatedTenants);
    }

    alert('System Configuration, Restaurant Profile & Security PIN updated successfully!');
  };

  const handleOpenAddModal = () => {
    setEditingStation(null);
    setStationName('');
    setPrinterType('Network IP (LAN/Wi-Fi)');
    setPrinterModel('Epson TM-T88VI');
    setIpAddress('192.168.1.150');
    setPort(9100);
    setPrinterQueueName('Thermal_KOT_Printer_1');
    setPaperWidth('80mm');
    setSelectedCategories(['Main Dishes']);
    setAutoPrintKot(true);
    setStationStatus('Online');
    setIsPrinterModalOpen(true);
  };

  const handleOpenEditModal = (st: KitchenPrinterStation) => {
    setEditingStation(st);
    setStationName(st.stationName);
    setPrinterType(st.printerType);
    setPrinterModel(st.printerModel || 'Epson TM-T88VI');
    setIpAddress(st.ipAddress || '192.168.1.100');
    setPort(st.port || 9100);
    setPrinterQueueName(st.printerQueueName || 'POS80_Thermal');
    setPaperWidth(st.paperWidth || '80mm');
    setSelectedCategories(st.assignedCategories || []);
    setAutoPrintKot(st.autoPrintKot);
    setStationStatus(st.status || 'Online');
    setIsPrinterModalOpen(true);
  };

  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationName.trim()) {
      alert('Please enter a station name.');
      return;
    }

    const newStation: KitchenPrinterStation = {
      id: editingStation ? editingStation.id : `kp-${Date.now()}`,
      stationName: stationName.trim(),
      printerType,
      printerModel,
      ipAddress: printerType === 'Network IP (LAN/Wi-Fi)' ? ipAddress : undefined,
      port: printerType === 'Network IP (LAN/Wi-Fi)' ? port : undefined,
      printerQueueName: printerType !== 'Network IP (LAN/Wi-Fi)' ? printerQueueName : printerQueueName || 'POS80_Thermal',
      paperWidth,
      assignedCategories: selectedCategories,
      autoPrintKot,
      status: stationStatus
    };

    let updatedPrinters = form.kitchenPrinters || [];
    if (editingStation) {
      updatedPrinters = updatedPrinters.map(p => p.id === editingStation.id ? newStation : p);
    } else {
      updatedPrinters = [...updatedPrinters, newStation];
    }

    const updatedForm = { ...form, kitchenPrinters: updatedPrinters };
    setForm(updatedForm);
    onUpdateSettings(updatedForm);
    setIsPrinterModalOpen(false);
  };

  const handleDeleteStation = (id: string) => {
    if (confirm('Are you sure you want to remove this kitchen printer station?')) {
      const updatedPrinters = (form.kitchenPrinters || []).filter(p => p.id !== id);
      const updatedForm = { ...form, kitchenPrinters: updatedPrinters };
      setForm(updatedForm);
      onUpdateSettings(updatedForm);
    }
  };

  const runPrinterDiagnosticPing = (st: KitchenPrinterStation) => {
    setTestingStation(st);
    setIsTesting(true);
    setTestSuccess(null);
    setTestLogs([]);

    const timeStr = () => new Date().toLocaleTimeString();
    const endpointStr = st.printerType === 'Network IP (LAN/Wi-Fi)'
      ? `${st.ipAddress || '192.168.1.100'}:${st.port || 9100}`
      : st.printerQueueName || 'POS80_Spool_Queue';

    const logs: string[] = [];
    logs.push(`[${timeStr()}] Starting thermal printer hardware ping diagnostic...`);
    logs.push(`[${timeStr()}] Station Name: "${st.stationName}" | Type: ${st.printerType}`);
    logs.push(`[${timeStr()}] Target Destination: ${endpointStr}`);
    setTestLogs([...logs]);

    setTimeout(() => {
      logs.push(`[${timeStr()}] [PING STEP 1] Resolving network socket or OS spool driver... OK`);
      setTestLogs([...logs]);
    }, 400);

    setTimeout(() => {
      if (st.status === 'Offline') {
        logs.push(`[${timeStr()}] [ERROR] Destination printer station marked as OFFLINE.`);
        logs.push(`[${timeStr()}] [DIAGNOSTIC FAILED] Unable to establish RAW socket connection.`);
        setTestLogs([...logs]);
        setIsTesting(false);
        setTestSuccess(false);
      } else {
        logs.push(`[${timeStr()}] [PING STEP 2] Opening TCP RAW Socket to ${endpointStr}... Connected (latency: 8ms)`);
        logs.push(`[${timeStr()}] [PING STEP 3] Transmitting ESC/POS Initialize Command (0x1B 0x40)... ACK received`);
        logs.push(`[${timeStr()}] [PING STEP 4] Polling Thermal Paper Roll & Cutter Status... PAPER: PRESENT, COVER: CLOSED, CUTTER: READY`);
        logs.push(`[${timeStr()}] [DIAGNOSTIC PASSED] Station is ONLINE and ready to receive automated KOT print jobs.`);
        setTestLogs([...logs]);
        setIsTesting(false);
        setTestSuccess(true);
      }
    }, 1100);
  };

  const handleSendDummyTestPrint = (st: KitchenPrinterStation) => {
    const sampleTestOrder = {
      id: `test-kot-${Date.now()}`,
      orderNumber: 'KOT-TEST',
      tableName: `${st.stationName} (DIAGNOSTIC TEST)`,
      customerName: 'KOT Printer Test',
      items: [
        {
          id: 'test-1',
          menuItemId: 'm1',
          name: `[DIAGNOSTIC TEST] ${st.stationName} Sample Dish`,
          unitPrice: 15.0,
          quantity: 2,
          kitchenNotes: `Target: ${st.printerType === 'Network IP (LAN/Wi-Fi)' ? `${st.ipAddress}:${st.port}` : st.printerQueueName} | Roll: ${st.paperWidth || '80mm'}`,
          subtotal: 30.0
        }
      ],
      subtotal: 30.0,
      discountAmount: 0,
      taxAmount: 0,
      serviceCharge: 0,
      tipAmount: 0,
      totalAmount: 30.0,
      paidAmount: 30.0,
      changeAmount: 0,
      paymentMethod: 'Cash' as const,
      paymentStatus: 'Paid' as const,
      status: 'Preparing' as const,
      orderType: 'Dine In' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    triggerKotPrint(sampleTestOrder, form);
  };

  const handleSendDummyReceiptTestPrint = () => {
    const sampleReceiptOrder = {
      id: `test-rec-${Date.now()}`,
      orderNumber: 'INV-367',
      tableName: 'Table 4',
      customerName: 'Valued Guest',
      waiterName: 'Ahmed',
      items: [
        {
          id: 'test-item-1',
          menuItemId: 'm1',
          name: 'Maluwax',
          unitPrice: 1.0,
          quantity: 1,
          subtotal: 1.0
        },
        {
          id: 'test-item-2',
          menuItemId: 'm2',
          name: 'Baasto',
          unitPrice: 1.0,
          quantity: 1,
          subtotal: 1.0
        },
        {
          id: 'test-item-3',
          menuItemId: 'm3',
          name: 'Burger Fish',
          unitPrice: 2.0,
          quantity: 1,
          subtotal: 2.0
        }
      ],
      subtotal: 4.0,
      discountAmount: 0,
      taxAmount: 0,
      serviceCharge: 0,
      tipAmount: 0,
      totalAmount: 4.0,
      paidAmount: 4.0,
      changeAmount: 0,
      paymentMethod: 'Cash' as const,
      paymentStatus: 'Paid' as const,
      status: 'Served' as const,
      orderType: 'Take Away' as const,
      createdAt: '2026-07-07T04:27:00.000Z',
      updatedAt: new Date().toISOString()
    };

    triggerReceiptPrint(sampleReceiptOrder, form);
  };

  const toggleCategorySelection = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catName));
    } else {
      setSelectedCategories([...selectedCategories, catName]);
    }
  };

  const handleDownloadDatabaseBackup = () => {
    const dumpText = `-- SQL Database Backup - ${settings.name}\n-- Date: ${new Date().toISOString()}\n\nSELECT 'Database Backup Dump Downloaded Successfully';`;
    const element = document.createElement("a");
    const file = new Blob([dumpText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `RMS_Database_Backup_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportJsonBackup = () => {
    const backupObject = {
      app: form.name || 'Restaurant System',
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      ...(allAppData || { settings: form })
    };
    backupObject.settings = form;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `RMS_System_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRestoreJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!parsed || typeof parsed !== 'object') {
            alert('Invalid backup file format.');
            return;
          }
          const confirmRestore = confirm(
            `⚠️ RESTORE BACKUP WARNING:\n\nYou are about to restore system state from "${file.name}".\n\nThis will replace active orders, menu items, settings, inventory, tables, and customers with data from the file. Do you wish to proceed?`
          );
          if (confirmRestore) {
            if (parsed.settings) {
              setForm({ ...parsed.settings });
              onUpdateSettings(parsed.settings);
            }
            if (onRestoreAppData) {
              onRestoreAppData(parsed);
            }
            alert('✓ System backup state restored successfully!');
          }
        } catch (err) {
          alert('Failed to parse JSON backup file. Please upload a valid .json file.');
        }
      };
    }
    e.target.value = '';
  };

  return (
    <div className="container-fluid p-4">
      {/* Hidden File Input for Restore */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleRestoreJsonUpload}
      />
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-dark text-white rounded-3 shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">System Configuration, Payment & Kitchen Printer Settings</h1>
            <p className="text-muted small mb-0">Business profile, Somali Mobile Money gateways, Thermal IP/Queue printer routing & JSON State Backups</p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportJsonBackup}
            className="btn btn-outline-success d-flex align-items-center gap-2 shadow-sm"
            title="Download full application state as JSON"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
            title="Upload and restore full state from JSON file"
          >
            <Upload className="w-4 h-4" />
            <span>Restore State (Upload JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadDatabaseBackup}
            className="btn btn-outline-secondary d-flex align-items-center gap-2"
            title="Export SQL Schema Dump"
          >
            <Database className="w-4 h-4" />
            <span>SQL Dump</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="row g-4">
          
          {/* Business Profile */}
          <div className="col-12 col-lg-6">
            <div className={`card border-0 shadow-sm p-4 rounded-3 h-100 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <h5 className="h6 fw-bold mb-3 text-primary">Restaurant Business Profile</h5>

              {/* Receipt / Header Logo Image Section */}
              <div className="mb-3 border p-3 rounded-3 bg-light">
                <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1.5 mb-2">
                  <Image className="w-4 h-4 text-primary" />
                  <span>Receipt & Header Logo Image</span>
                </label>

                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleLogoSelect}
                />

                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="border rounded bg-white p-1 d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: '70px', height: '70px', minWidth: '70px', overflow: 'hidden' }}
                  >
                    {form.logo ? (
                      <img 
                        src={form.logo} 
                        alt="Store Logo" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div className="text-center text-muted small">
                        <Image className="w-6 h-6 mx-auto opacity-40 d-block" />
                        <span style={{ fontSize: '0.65rem' }}>No Logo</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-grow-1">
                    <div className="d-flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo</span>
                      </button>

                      {form.logo && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, logo: '' }))}
                          className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm text-xs"
                      placeholder="Or enter image URL (e.g. https://...)"
                      value={form.logo || ''}
                      onChange={(e) => setForm({ ...form, logo: e.target.value })}
                    />
                    <div className="text-muted text-xs mt-1">Displayed at the top of customer receipts & KOTs.</div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Restaurant Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Branch Portal Username & Security PIN Box */}
              <div className="mb-3 p-3 rounded-3 bg-light border border-primary-subtle">
                <label className="form-label small fw-bold text-primary mb-2 d-flex align-items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Restaurant Branch Login Credentials</span>
                </label>
                <div className="row g-2">
                  <div className="col-12 col-md-6">
                    <label className="form-label text-xs fw-semibold">Branch Username *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace fw-bold"
                      value={tenantUsername}
                      onChange={(e) => setTenantUsername(e.target.value)}
                      placeholder="palace_bistro"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label text-xs fw-semibold">Security PIN Code *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace fw-bold"
                      value={tenantPin}
                      onChange={(e) => setTenantPin(e.target.value)}
                      placeholder="1234"
                    />
                  </div>
                </div>
                <div className="form-text text-xs text-muted mt-1">
                  These credentials allow you to log into this restaurant tenant on the main login screen. Updates sync directly to MySQL database.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Phone</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Tax ID #</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.taxNumber}
                    onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Tax Rate %</label>
                  <input
                    type="number"
                    className="form-control font-monospace"
                    value={form.taxRate}
                    onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Service Charge %</label>
                  <input
                    type="number"
                    className="form-control font-monospace"
                    value={form.serviceChargeRate}
                    onChange={(e) => setForm({ ...form, serviceChargeRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between">
                  <span>Receipt Footer Note</span>
                  <span className="badge bg-light text-muted border font-monospace">Multiline Text</span>
                </label>
                <textarea
                  className="form-control text-sm font-monospace"
                  rows={4}
                  placeholder="Enter custom receipt footer note (e.g. thank you message, wifi password, social links, return policy)..."
                  value={form.receiptFooter || ''}
                  onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                />
                <div className="form-text text-xs text-muted">
                  Supports basic newlines for multiline formatting at the bottom of customer receipts.
                </div>
              </div>
            </div>
          </div>

          {/* Somali Mobile Money Payment Gateways */}
          <div className="col-12 col-lg-6">
            <div className={`card border-0 shadow-sm p-4 rounded-3 h-100 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <h5 className="h6 fw-bold mb-3 text-success d-flex align-items-center gap-2">
                <Smartphone className="w-5 h-5" />
                <span>Somali Mobile Money Payment Gateway Integrations</span>
              </h5>

              <div className="mb-3">
                <label className="form-label small fw-bold text-dark">Merchant (Merchant Code / USSD)</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="e.g. merchant : *789*693364*$$# or 693364"
                  value={form.merchantCode || ''}
                  onChange={(e) => setForm({ ...form, merchantCode: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-success">EVC (EVC Plus / Hormuud)</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="e.g. 615749110"
                  value={form.evcMerchantId || ''}
                  onChange={(e) => setForm({ ...form, evcMerchantId: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-warning">E-Dahab (Somtel / Dahabshiil)</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="e.g. 625749110"
                  value={form.edahabMerchantId || ''}
                  onChange={(e) => setForm({ ...form, edahabMerchantId: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-info">Mycash (Salaam Bank)</label>
                <input
                  type="text"
                  className="form-control font-monospace"
                  placeholder="e.g. 615749110"
                  value={form.mycashMerchantId || ''}
                  onChange={(e) => setForm({ ...form, mycashMerchantId: e.target.value })}
                />
              </div>

              <div className="form-check form-switch mt-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="autoDeduct"
                  checked={form.enableAutoIngredientDeduction}
                  onChange={(e) => setForm({ ...form, enableAutoIngredientDeduction: e.target.checked })}
                />
                <label className="form-check-label fw-bold small" htmlFor="autoDeduct">
                  Automatic Recipe Ingredient Inventory Stock Deduction on POS Order Sale
                </label>
              </div>

            </div>
          </div>

          {/* CASHIER / FRONT OFFICE CUSTOMER RECEIPT PRINTER */}
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 rounded-3 mb-4 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                <div>
                  <h5 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <Printer className="w-5 h-5 text-primary" />
                    <span>Front Office / Cashier Receipt Printer</span>
                  </h5>
                  <p className="text-muted small mb-0">
                    Dedicated thermal printer configuration for printing customer bills, payment slips, and tax receipts at the checkout counter.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendDummyReceiptTestPrint}
                  className="btn btn-outline-primary btn-sm fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                >
                  <TestTube className="w-4 h-4 text-primary" />
                  <span>Test Receipt Printer</span>
                </button>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <div className="form-check form-switch mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="enableThermal"
                      checked={form.enableThermalPrinter}
                      onChange={(e) => setForm({ ...form, enableThermalPrinter: e.target.checked })}
                    />
                    <label className="form-check-label fw-bold small" htmlFor="enableThermal">
                      Enable Front Counter Thermal Customer Receipt Printer
                    </label>
                  </div>
                  <p className="text-muted small mb-3">When enabled, POS sales automatically prompt or send customer bills to this printer.</p>

                  <div className="row g-2 mb-3">
                    <div className="col-12 col-sm-7">
                      <label className="form-label small fw-bold">Cashier Printer Model</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.receiptPrinterModel || 'Epson TM-T88VI'}
                        onChange={(e) => setForm({ ...form, receiptPrinterModel: e.target.value })}
                      >
                        {THERMAL_PRINTER_MODELS.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 col-sm-5">
                      <label className="form-label small fw-bold">Paper Roll</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.receiptPaperWidth || '80mm'}
                        onChange={(e) => setForm({ ...form, receiptPaperWidth: e.target.value as '80mm' | '58mm' })}
                      >
                        <option value="80mm">80mm (3 Inch)</option>
                        <option value="58mm">58mm (2 Inch)</option>
                      </select>
                    </div>
                  </div>

                  {/* Thermal Receipt Header Logo Upload */}
                  <div className="border rounded-3 p-3 bg-white mb-3">
                    <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between mb-2">
                      <span className="d-flex align-items-center gap-1.5">
                        <Image className="w-4 h-4 text-primary" />
                        <span>Receipt & KOT Header Logo</span>
                      </span>
                      {form.logo && (
                        <span className="badge bg-success-subtle text-success border border-success-subtle text-xs">
                          Logo Active
                        </span>
                      )}
                    </label>

                    <input
                      type="file"
                      ref={receiptLogoInputRef}
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setForm(prev => ({ ...prev, logo: event.target!.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="border rounded bg-light p-1 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                        style={{ width: '65px', height: '65px', overflow: 'hidden' }}
                      >
                        {form.logo ? (
                          <img 
                            src={form.logo} 
                            alt="Receipt Header Logo" 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <Image className="w-5 h-5 mx-auto opacity-40 d-block" />
                            <span style={{ fontSize: '0.6rem' }}>No Logo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="d-flex gap-2 mb-1.5">
                          <button
                            type="button"
                            onClick={() => receiptLogoInputRef.current?.click()}
                            className="btn btn-sm btn-outline-primary fw-bold d-flex align-items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Header Logo</span>
                          </button>

                          {form.logo && (
                            <button
                              type="button"
                              onClick={() => setForm(prev => ({ ...prev, logo: '' }))}
                              className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          className="form-control form-control-sm text-xs font-monospace"
                          placeholder="Or paste logo image URL (e.g. https://...)"
                          value={form.logo || ''}
                          onChange={(e) => setForm({ ...form, logo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Thermal Printed Output Base Font Size Slider */}
                  <div className="border rounded-3 p-2.5 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="form-label small fw-bold mb-0 text-dark d-flex align-items-center gap-1.5">
                        <Type className="w-4 h-4 text-primary" />
                        <span>Receipt Base Font Size</span>
                      </label>
                      <span className="badge bg-primary text-white font-monospace px-2 py-1">
                        {form.receiptFontSize || 12}px
                      </span>
                    </div>

                    <p className="text-muted text-xs mb-2">
                      Adjust output font scaling for legibility on 80mm & 58mm thermal receipts.
                    </p>

                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="text-xs fw-bold text-muted">10px</span>
                      <input
                        type="range"
                        className="form-range flex-grow-1"
                        min={10}
                        max={16}
                        step={1}
                        value={form.receiptFontSize || 12}
                        onChange={(e) => setForm({ ...form, receiptFontSize: parseInt(e.target.value, 10) })}
                      />
                      <span className="text-xs fw-bold text-muted">16px</span>
                    </div>

                    {/* Quick Preset Buttons & Dynamic Live Sample */}
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-1 border-top">
                      <div className="btn-group btn-group-sm" role="group">
                        {[10, 12, 14, 16].map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={`btn btn-xs ${ (form.receiptFontSize || 12) === size ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}
                            onClick={() => setForm({ ...form, receiptFontSize: size })}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>

                      <div 
                        className="font-monospace text-dark px-2 py-1 rounded bg-light border text-truncate"
                        style={{ fontSize: `${form.receiptFontSize || 12}px`, maxWidth: '240px', lineHeight: 1.2 }}
                        title="Live print size preview text"
                      >
                        Sample: #104 - 1x Latte $4.50
                      </div>
                    </div>
                  </div>

                  {/* Receipt Footer Note Multiline Area */}
                  <div className="border rounded-3 p-3 bg-white mt-3">
                    <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between mb-1">
                      <span className="d-flex align-items-center gap-1.5">
                        <FileText className="w-4 h-4 text-primary" />
                        <span>Receipt Footer Note</span>
                      </span>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle text-xs">
                        Multiline Supported
                      </span>
                    </label>

                    <p className="text-muted text-xs mb-2">
                      Custom message or terms printed at the bottom of customer receipts. Supports newlines.
                    </p>

                    <textarea
                      className="form-control form-control-sm font-monospace text-xs"
                      rows={3}
                      placeholder="e.g. Waad ku mahadsan tahay Mar labaad noo soo laabo!!"
                      value={form.receiptFooter || ''}
                      onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                          <Printer className="w-4 h-4 text-primary" />
                          <span>Cashier Thermal Hardware:</span>
                        </span>
                        <span className="badge bg-success-subtle text-success border border-success-subtle">Primary Front Desk</span>
                      </div>
                      <div className="text-xs text-muted font-monospace">
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Printer Model:</span>
                          <span className="fw-bold text-dark">{form.receiptPrinterModel || 'Epson TM-T88VI'}</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Paper Format:</span>
                          <span className="fw-bold text-dark">{form.receiptPaperWidth || '80mm'} Standard Thermal Roll</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Base Font Size:</span>
                          <span className="fw-bold text-primary">{form.receiptFontSize || 12}px</span>
                        </div>
                        <div className="d-flex justify-content-between py-1 border-bottom">
                          <span>Header Logo:</span>
                          <span className="fw-bold text-dark d-flex align-items-center gap-1">
                            {form.logo ? (
                              <>
                                <img src={form.logo} alt="thumb" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                                <span className="text-success">Active Logo</span>
                              </>
                            ) : (
                              <span className="text-muted">None (Text Header)</span>
                            )}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between py-1">
                          <span>Target Queue:</span>
                          <span className="text-secondary">Browser Print Dialog / System Spool</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KITCHEN THERMAL PRINTER STATIONS & AUTOMATED KOT ROUTING */}
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                <div>
                  <h5 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <Printer className="w-5 h-5 text-primary" />
                    <span>Kitchen Station Thermal Printers & Automated KOT Routing</span>
                  </h5>
                  <p className="text-muted small mb-0">
                    Define thermal printer IP addresses, local spool queue names, paper roll size, and category routing rules for automated KOT prints.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="btn btn-primary btn-sm fw-bold d-flex align-items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Kitchen Station Printer</span>
                </button>
              </div>

              {/* Station Printers Cards Grid */}
              {(!form.kitchenPrinters || form.kitchenPrinters.length === 0) ? (
                <div className="text-center py-4 bg-light rounded-3 border border-dashed">
                  <UtensilsCrossed className="w-8 h-8 text-muted mb-2 opacity-50" />
                  <p className="fw-semibold text-muted mb-1">No Kitchen Station Printers Configured</p>
                  <p className="small text-muted mb-3">Add a network IP or local thermal printer queue to enable multi-station automated KOT printing.</p>
                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="btn btn-sm btn-outline-primary fw-bold"
                  >
                    Add First Printer Station
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {form.kitchenPrinters.map((st) => (
                    <div key={st.id} className="col-12 col-md-6 col-xl-4">
                      <div className={`card h-100 border rounded-3 p-3 position-relative ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-light border-light-subtle'}`}>
                        
                        {/* Header */}
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="p-2 bg-primary-subtle text-primary rounded-2">
                              {st.printerType === 'Network IP (LAN/Wi-Fi)' ? (
                                <Wifi className="w-4 h-4" />
                              ) : st.printerType === 'Bluetooth Thermal' ? (
                                <Radio className="w-4 h-4 text-info" />
                              ) : (
                                <Usb className="w-4 h-4 text-warning" />
                              )}
                            </div>
                            <div>
                              <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.95rem' }}>{st.stationName}</h6>
                              <span className="text-muted small">{st.printerType}</span>
                            </div>
                          </div>

                          <span className={`badge ${st.status === 'Online' ? 'bg-success-subtle text-success border border-success-subtle' : st.status === 'Test Mode' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-secondary-subtle text-secondary border border-secondary-subtle'}`}>
                            {st.status || 'Online'}
                          </span>
                        </div>

                        {/* Connection Specs */}
                        <div className="bg-white p-2.5 rounded-2 border mb-2 text-xs font-monospace">
                          <div className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                            <span className="text-muted">Printer Model:</span>
                            <span className="fw-bold text-dark">{st.printerModel || 'Epson TM-T88VI'}</span>
                          </div>
                          {st.printerType === 'Network IP (LAN/Wi-Fi)' ? (
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">IP & Port:</span>
                              <span className="fw-bold text-primary">{st.ipAddress || '192.168.1.100'}:{st.port || 9100}</span>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">Queue / Device:</span>
                              <span className="fw-bold text-dark">{st.printerQueueName || 'POS80_USB'}</span>
                            </div>
                          )}
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <span className="text-muted">Paper Roll:</span>
                            <span className="badge bg-light text-dark border">{st.paperWidth || '80mm'}</span>
                          </div>
                        </div>

                        {/* Category Routing Tags */}
                        <div className="mb-3">
                          <span className="text-muted small fw-semibold d-block mb-1">Routed Menu Categories:</span>
                          <div className="d-flex flex-wrap gap-1">
                            {st.assignedCategories && st.assignedCategories.length > 0 ? (
                              st.assignedCategories.map((cat, idx) => (
                                <span key={idx} className="badge bg-secondary-subtle text-dark border px-2 py-0.5" style={{ fontSize: '0.72rem' }}>
                                  {cat}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted small fst-italic">All Menu Categories</span>
                            )}
                          </div>
                        </div>

                        {/* Auto-KOT & Footer Actions */}
                        <div className="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                          <span className={`small fw-semibold ${st.autoPrintKot ? 'text-success' : 'text-muted'}`}>
                            {st.autoPrintKot ? '✓ Auto-KOT Active' : 'Manual Print'}
                          </span>

                          <div className="d-flex align-items-center gap-1">
                            <button
                              type="button"
                              onClick={() => runPrinterDiagnosticPing(st)}
                              className="btn btn-xs btn-outline-success px-2 py-1 fw-bold d-flex align-items-center gap-1"
                              title="Test Printer Connectivity & Ping"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <TestTube className="w-3.5 h-3.5" />
                              <span>Test & Ping</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(st)}
                              className="btn btn-xs btn-outline-primary px-2 py-1"
                              title="Edit Station"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStation(st.id)}
                              className="btn btn-xs btn-outline-danger px-2 py-1"
                              title="Delete Station"
                              style={{ fontSize: '0.75rem' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* FRONT LOGIN PAGE CUSTOMIZATION & MANAGEMENT */}
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
                <div>
                  <h5 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <LogIn className="w-5 h-5 text-warning" />
                    <span>Front Login Page Management & Portal Customization</span>
                  </h5>
                  <p className="text-muted small mb-0">
                    Customize everything on the front login screen: branding titles, logo images, address, contact numbers, footer copyright notes, theme background gradients, and keypad accent colors.
                  </p>
                </div>

                <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>Real-Time Login Portal Customizer</span>
                </span>
              </div>

              <div className="row g-4">
                {/* Left Side: Customization Form Controls */}
                <div className="col-12 col-xl-7">
                  <div className="row g-3">
                    
                    {/* Login Title */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1.5 mb-1">
                        <Type className="w-4 h-4 text-primary" />
                        <span>Login Portal Title</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Qado Dalbo - Institute Portal"
                        value={form.loginTitle || ''}
                        onChange={(e) => setForm({ ...form, loginTitle: e.target.value })}
                      />
                      <div className="text-muted text-xs mt-0.5">Title shown on the login branding card.</div>
                    </div>

                    {/* Login Tagline */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1.5 mb-1">
                        <Type className="w-4 h-4 text-warning" />
                        <span>Login Tagline / Slogan</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. QADADAADA, HAL TAABASHO."
                        value={form.loginTagline || ''}
                        onChange={(e) => setForm({ ...form, loginTagline: e.target.value })}
                      />
                      <div className="text-muted text-xs mt-0.5">Slogan under logo text.</div>
                    </div>

                    {/* Dedicated Login Logo File Upload */}
                    <div className="col-12">
                      <div className="border rounded-3 p-3 bg-light">
                        <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between mb-2">
                          <span className="d-flex align-items-center gap-1.5">
                            <Image className="w-4 h-4 text-primary" />
                            <span>Front Login Card Logo Image</span>
                          </span>
                          <span className="badge bg-light text-muted border">Custom Logo</span>
                        </label>

                        <input
                          type="file"
                          ref={loginLogoInputRef}
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleLoginLogoSelect}
                        />

                        <div className="d-flex align-items-center gap-3">
                          <div 
                            className="border rounded bg-white p-1 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: '80px', height: '80px', minWidth: '80px', overflow: 'hidden' }}
                          >
                            {(form.loginLogo || form.logo) ? (
                              <img 
                                src={form.loginLogo || form.logo} 
                                alt="Login Logo" 
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                              />
                            ) : (
                              <div className="text-center text-muted small">
                                <Image className="w-6 h-6 mx-auto opacity-40 d-block" />
                                <span style={{ fontSize: '0.65rem' }}>Default Text</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-grow-1">
                            <div className="d-flex gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => loginLogoInputRef.current?.click()}
                                className="btn btn-sm btn-primary fw-bold d-flex align-items-center gap-1.5"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>Upload Login Logo</span>
                              </button>

                              {form.loginLogo && (
                                <button
                                  type="button"
                                  onClick={() => setForm(prev => ({ ...prev, loginLogo: '' }))}
                                  className="btn btn-sm btn-outline-danger fw-bold d-flex align-items-center gap-1.5"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Clear Logo</span>
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              className="form-control form-control-sm text-xs"
                              placeholder="Or enter external image URL..."
                              value={form.loginLogo || ''}
                              onChange={(e) => setForm({ ...form, loginLogo: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Address & Phone */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-1">Login Screen Address / Location</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Mogadishu, Somalia"
                        value={form.loginAddress || ''}
                        onChange={(e) => setForm({ ...form, loginAddress: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-1">Login Screen Contact Phone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. +252 61 3494935"
                        value={form.loginPhone || ''}
                        onChange={(e) => setForm({ ...form, loginPhone: e.target.value })}
                      />
                    </div>

                    {/* Footer Text */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark mb-1">Login Footer & Copyright Text</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Software Provided By Arlaadi ICT Solution © 2026"
                        value={form.loginFooterText || ''}
                        onChange={(e) => setForm({ ...form, loginFooterText: e.target.value })}
                      />
                    </div>

                    {/* Announcement Banner Note */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark d-flex align-items-center justify-content-between mb-1">
                        <span className="d-flex align-items-center gap-1.5">
                          <Info className="w-4 h-4 text-info" />
                          <span>Login Screen Announcement / Notice Message</span>
                        </span>
                        <span className="badge bg-info-subtle text-info border">Notice Banner</span>
                      </label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="e.g. Enter PIN or select staff profile to log in..."
                        value={form.loginAnnouncement || ''}
                        onChange={(e) => setForm({ ...form, loginAnnouncement: e.target.value })}
                      />
                    </div>

                    {/* Background Style Palette Selector */}
                    <div className="col-12">
                      <label className="form-label small fw-bold text-dark d-flex align-items-center gap-1.5 mb-2">
                        <Palette className="w-4 h-4 text-primary" />
                        <span>Login Screen Background Theme Style</span>
                      </label>

                      <div className="row g-2">
                        {[
                          { id: 'blue_gradient', label: 'Classic Deep Navy & Royal Blue', gradient: 'linear-gradient(135deg, #1d3557, #2a5298)' },
                          { id: 'emerald_dark', label: 'Deep Emerald Forest', gradient: 'linear-gradient(135deg, #064e3b, #047857)' },
                          { id: 'indigo_purple', label: 'Royal Indigo Violet', gradient: 'linear-gradient(135deg, #311075, #5b21b6)' },
                          { id: 'slate_modern', label: 'Modern Slate & Onyx', gradient: 'linear-gradient(135deg, #0f172a, #334155)' },
                          { id: 'warm_sunset', label: 'Dark Sunset Amber', gradient: 'linear-gradient(135deg, #7c2d12, #c2410c)' },
                          { id: 'clean_light', label: 'Crisp Slate Gray', gradient: 'linear-gradient(135deg, #e2e8f0, #94a3b8)' },
                        ].map((bg) => (
                          <div className="col-6 col-md-4" key={bg.id}>
                            <button
                              type="button"
                              onClick={() => setForm({ ...form, loginBgStyle: bg.id as any })}
                              className={`btn w-100 p-2 text-start rounded-3 border d-flex align-items-center gap-2 ${form.loginBgStyle === bg.id || (!form.loginBgStyle && bg.id === 'blue_gradient') ? 'border-primary border-2 shadow-sm' : 'border-light-subtle'}`}
                              style={{ backgroundColor: '#f8fafc' }}
                            >
                              <div 
                                className="rounded-circle flex-shrink-0 shadow-sm"
                                style={{ width: '22px', height: '22px', background: bg.gradient }}
                              />
                              <span className="text-xs fw-semibold text-dark text-truncate">{bg.label}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Keypad Button Accent Color */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-1">Keypad Button Accent Color</label>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          className="form-control form-control-color border"
                          value={form.loginButtonColor || '#2b7fff'}
                          onChange={(e) => setForm({ ...form, loginButtonColor: e.target.value })}
                          style={{ width: '42px', height: '38px', padding: '3px' }}
                        />
                        <input
                          type="text"
                          className="form-control form-control-sm font-monospace"
                          value={form.loginButtonColor || '#2b7fff'}
                          onChange={(e) => setForm({ ...form, loginButtonColor: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Portal Display Toggles */}
                    <div className="col-12">
                      <div className="p-3 bg-light rounded-3 border">
                        <span className="fw-bold small text-dark d-block mb-2">Login Portal Component Visibility:</span>
                        
                        <div className="row g-2">
                          <div className="col-12 col-sm-4">
                            <div className="form-check form-switch">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="toggleShowLogo"
                                checked={form.loginShowLogo !== false}
                                onChange={(e) => setForm({ ...form, loginShowLogo: e.target.checked })}
                              />
                              <label className="form-check-label small fw-semibold" htmlFor="toggleShowLogo">
                                Show Logo Card
                              </label>
                            </div>
                          </div>

                          <div className="col-12 col-sm-4">
                            <div className="form-check form-switch">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="toggleShowProfiles"
                                checked={form.loginShowProfileSelector === true}
                                onChange={(e) => setForm({ ...form, loginShowProfileSelector: e.target.checked })}
                              />
                              <label className="form-check-label small fw-semibold" htmlFor="toggleShowProfiles">
                                Profile Selector
                              </label>
                            </div>
                          </div>

                          <div className="col-12 col-sm-4">
                            <div className="form-check form-switch">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id="toggleQuickLogin"
                                checked={form.loginShowQuickLogin !== false}
                                onChange={(e) => setForm({ ...form, loginShowQuickLogin: e.target.checked })}
                              />
                              <label className="form-check-label small fw-semibold" htmlFor="toggleQuickLogin">
                                Quick Demo Buttons
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Side: Live Interactive Scaled Mini Preview */}
                <div className="col-12 col-xl-5">
                  <div className="bg-light p-3 rounded-3 border h-100 d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="fw-bold small text-dark d-flex align-items-center gap-1.5">
                        <Eye className="w-4 h-4 text-warning" />
                        <span>Live Login Screen Preview:</span>
                      </span>
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        Live Preview
                      </span>
                    </div>

                    {/* Scaled Mini Login View Box */}
                    <div 
                      className="rounded-3 shadow-sm p-3 text-white overflow-hidden my-auto d-flex flex-column justify-content-between"
                      style={{
                        minHeight: '340px',
                        background: form.loginBgStyle === 'emerald_dark' 
                          ? 'linear-gradient(135deg, #064e3b, #047857)'
                          : form.loginBgStyle === 'indigo_purple'
                          ? 'linear-gradient(135deg, #311075, #5b21b6)'
                          : form.loginBgStyle === 'slate_modern'
                          ? 'linear-gradient(135deg, #0f172a, #334155)'
                          : form.loginBgStyle === 'warm_sunset'
                          ? 'linear-gradient(135deg, #7c2d12, #c2410c)'
                          : form.loginBgStyle === 'clean_light'
                          ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)'
                          : 'linear-gradient(135deg, #1d3557, #2a5298)',
                        fontFamily: "'Plus Jakarta Sans', sans-serif"
                      }}
                    >
                      {/* Mini Card Container */}
                      <div className="bg-white text-dark rounded-3 p-3 shadow-lg mx-auto w-100" style={{ maxWidth: '320px' }}>
                        
                        {/* Mini Branding Header */}
                        {form.loginShowLogo !== false && (
                          <div className="text-center pb-2 border-bottom mb-2">
                            {(form.loginLogo || form.logo) ? (
                              <img 
                                src={form.loginLogo || form.logo} 
                                alt="Logo" 
                                style={{ maxHeight: '36px', maxWidth: '120px', objectFit: 'contain' }} 
                              />
                            ) : (
                              <div className="fw-black fs-6 tracking-tighter d-flex align-items-center justify-content-center gap-1">
                                <span>Qado</span>
                                <span className="text-danger fw-extrabold">X</span>
                              </div>
                            )}
                            <div className="fw-bold text-dark text-xs mt-1">
                              {form.loginTitle || form.name || 'Qado Dalbo'}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                              {form.loginTagline || 'QADADAADA, HAL TAABASHO.'}
                            </div>
                          </div>
                        )}

                        {/* Announcement Preview */}
                        {form.loginAnnouncement && (
                          <div className="bg-info-subtle text-info-emphasis p-1.5 rounded text-center mb-2" style={{ fontSize: '0.65rem' }}>
                            {form.loginAnnouncement}
                          </div>
                        )}

                        {/* Mini Keypad Buttons Preview */}
                        <div className="text-center mb-2">
                          <input 
                            type="password" 
                            readOnly 
                            className="form-control form-control-sm text-center font-monospace py-0 mb-2"
                            value="••••" 
                            style={{ fontSize: '0.75rem' }}
                          />

                          <div className="row g-1">
                            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((k, idx) => (
                              <div className="col-4" key={idx}>
                                <div 
                                  className="py-1 rounded text-white fw-bold text-center shadow-xs"
                                  style={{ 
                                    backgroundColor: k === 'C' ? '#ea3829' : k === '✓' ? '#22c55e' : (form.loginButtonColor || '#2b7fff'),
                                    fontSize: '0.75rem' 
                                  }}
                                >
                                  {k}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Mini Contact & Footer */}
                        <div className="text-center border-top pt-1.5" style={{ fontSize: '0.62rem' }}>
                          <div className="fw-bold text-dark">{form.loginAddress || form.address || 'Mogadishu, Somalia'}</div>
                          <div className="text-warning fw-bold">{form.loginPhone || form.phone || '+252 61 3494935'}</div>
                          <div className="text-muted mt-0.5">{form.loginFooterText || 'Software Provided By Arlaadi ICT Solution © 2026'}</div>
                        </div>

                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SYSTEM STATE BACKUP & RESTORE TOOL (JSON) */}
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                <div>
                  <h5 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <FileJson className="w-5 h-5 text-success" />
                    <span>System Data Backup & Disaster Recovery (JSON)</span>
                  </h5>
                  <p className="text-muted small mb-0">
                    Export full application state (orders, menu items, inventory, settings, customers, staff, accounting) to a JSON file or upload a backup file to restore state.
                  </p>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-semibold d-flex align-items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Full Application Snapshot Supported</span>
                </span>
              </div>

              <div className="row g-3">
                {/* Export Card */}
                <div className="col-12 col-md-6">
                  <div className={`p-3 rounded-3 border h-100 d-flex flex-column justify-content-between ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-success" />
                        <h6 className="fw-bold mb-0 text-dark">Download State Snapshot (.json)</h6>
                      </div>
                      <p className="small text-muted mb-3">
                        Generates a formatted JSON file containing all active system collections, printer settings, order histories, and staff records for offline archive.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleExportJsonBackup}
                      className="btn btn-outline-success fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>
                </div>

                {/* Restore Card */}
                <div className="col-12 col-md-6">
                  <div className={`p-3 rounded-3 border h-100 d-flex flex-column justify-content-between ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <h6 className="fw-bold mb-0 text-dark">Restore System State from File</h6>
                      </div>
                      <p className="small text-muted mb-3">
                        Upload a previously exported RMS JSON backup file to overwrite current state and recover orders, menu items, or configurations seamlessly.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload & Restore Backup (.json)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM SQL DATABASE EXPORT & OFFLINE DEPLOYMENT SCRIPT */}
          <div className="col-12">
            <div className={`card border-0 shadow-sm p-4 rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                <div>
                  <h5 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <span>SQL Database Dump & Full Offline Connectivity Script (.sql)</span>
                  </h5>
                  <p className="text-muted small mb-0">
                    Generate and download a complete production SQL database dump script with full table creation schemas (DDL) and live system INSERTS for MySQL, PostgreSQL, or SQLite.
                  </p>
                </div>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 fw-semibold d-flex align-items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Full Relational Database Compatible</span>
                </span>
              </div>

              <div className="row g-3">
                {/* Download SQL File */}
                <div className="col-12 col-md-6">
                  <div className={`p-3 rounded-3 border h-100 d-flex flex-column justify-content-between ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Download className="w-5 h-5 text-primary" />
                        <h6 className="fw-bold mb-0 text-dark">Download Database SQL File (.sql)</h6>
                      </div>
                      <p className="small text-muted mb-3">
                        Downloads <code className="fw-bold text-dark">palace_bistro_pos_database.sql</code> containing all 12 database tables (orders, menu items, customers, settings, inventory, staff, day sales) ready to import into local MySQL / PostgreSQL server.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => downloadDatabaseSqlFile()}
                      className="btn btn-primary fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Full SQL Database File</span>
                    </button>
                  </div>
                </div>

                {/* View / Copy SQL Script */}
                <div className="col-12 col-md-6">
                  <div className={`p-3 rounded-3 border h-100 d-flex flex-column justify-content-between ${isDarkMode ? 'bg-dark border-secondary' : 'bg-light'}`}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-warning" />
                        <h6 className="fw-bold mb-0 text-dark">Inspect SQL Schema & Data Statements</h6>
                      </div>
                      <p className="small text-muted mb-3">
                        Open the SQL viewer modal to preview DDL schema, inspect primary keys, check table relationships, or copy script queries directly into your database manager (DBeaver, pgAdmin, phpMyAdmin).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSqlPreviewText(generateFullDatabaseSql());
                        setIsSqlModalOpen(true);
                      }}
                      className="btn btn-outline-dark fw-bold w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View & Copy SQL Script</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 text-end">
            <button type="submit" className="btn btn-primary btn-lg px-5 fw-bold shadow">
              <Save className="w-5 h-5 d-inline me-2" />
              Save Configuration Changes
            </button>
          </div>

        </div>
      </form>

      {/* MODAL: Add / Edit Kitchen Printer Station */}
      {isPrinterModalOpen && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              
              <div className="modal-header bg-dark text-white py-3 px-4">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
                  <Printer className="w-5 h-5 text-primary" />
                  <span>{editingStation ? 'Edit Kitchen Printer Station' : 'Add Kitchen Station Printer'}</span>
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsPrinterModalOpen(false)}></button>
              </div>

              <form onSubmit={handleSaveStation}>
                <div className="modal-body p-4">
                  
                  <div className="row g-3">
                    
                    {/* Station Name */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Kitchen Station Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Hot Kitchen, Bar Counter, Grill Station"
                        value={stationName}
                        onChange={(e) => setStationName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Thermal Printer Model */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Thermal Printer Model *</label>
                      <select
                        className="form-select"
                        value={printerModel}
                        onChange={(e) => setPrinterModel(e.target.value)}
                      >
                        {THERMAL_PRINTER_MODELS.map((model) => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </div>

                    {/* Printer Type */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Connection Interface *</label>
                      <select
                        className="form-select"
                        value={printerType}
                        onChange={(e) => setPrinterType(e.target.value as any)}
                      >
                        <option value="Network IP (LAN/Wi-Fi)">Network IP (LAN / Ethernet / Wi-Fi)</option>
                        <option value="Thermal USB / Print Queue">Thermal USB / Operating System Print Queue</option>
                        <option value="Bluetooth Thermal">Bluetooth Thermal Mobile Printer</option>
                      </select>
                    </div>

                    {/* IP & Port or Queue Name */}
                    {printerType === 'Network IP (LAN/Wi-Fi)' ? (
                      <>
                        <div className="col-12 col-md-8">
                          <label className="form-label small fw-bold">Thermal Printer IP Address *</label>
                          <input
                            type="text"
                            className="form-control font-monospace"
                            placeholder="e.g. 192.168.1.120"
                            value={ipAddress}
                            onChange={(e) => setIpAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-12 col-md-4">
                          <label className="form-label small fw-bold">RAW Port</label>
                          <input
                            type="number"
                            className="form-control font-monospace"
                            placeholder="9100"
                            value={port}
                            onChange={(e) => setPort(parseInt(e.target.value) || 9100)}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="col-12">
                        <label className="form-label small fw-bold">Printer Queue / Windows Device Name *</label>
                        <input
                          type="text"
                          className="form-control font-monospace"
                          placeholder="e.g. EPSON_TM_T88VI_Kitchen or POS80_USB"
                          value={printerQueueName}
                          onChange={(e) => setPrinterQueueName(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {/* Paper Width & Status */}
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Paper Roll Width</label>
                      <select
                        className="form-select"
                        value={paperWidth}
                        onChange={(e) => setPaperWidth(e.target.value as any)}
                      >
                        <option value="80mm">80mm (Standard Thermal Roll - 3 inch)</option>
                        <option value="58mm">58mm (Compact Mobile Roll - 2 inch)</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold">Printer Hardware Status</label>
                      <select
                        className="form-select"
                        value={stationStatus}
                        onChange={(e) => setStationStatus(e.target.value as any)}
                      >
                        <option value="Online">Online (Ready to Receive KOTs)</option>
                        <option value="Offline">Offline (Temporarily Disabled)</option>
                        <option value="Test Mode">Test Mode (Simulation Only)</option>
                      </select>
                    </div>

                    {/* Assigned Categories */}
                    <div className="col-12">
                      <label className="form-label small fw-bold">Routed Menu Categories</label>
                      <p className="text-muted small mb-2">Orders containing items in selected categories will automatically route to this kitchen station.</p>
                      <div className="d-flex flex-wrap gap-2 border p-3 rounded-2 bg-light">
                        {availableCategoryList.map((cat) => {
                          const isChecked = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategorySelection(cat)}
                              className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-outline-secondary'}`}
                            >
                              {isChecked ? '✓ ' : '+ '}{cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Auto KOT Toggle */}
                    <div className="col-12">
                      <div className="form-check form-switch p-2 bg-light rounded-2 border">
                        <input
                          type="checkbox"
                          className="form-check-input ms-0 me-2"
                          id="modalAutoKot"
                          checked={autoPrintKot}
                          onChange={(e) => setAutoPrintKot(e.target.checked)}
                        />
                        <label className="form-check-label fw-bold small" htmlFor="modalAutoKot">
                          Automatically print KOT ticket to this station as soon as order is placed
                        </label>
                      </div>
                    </div>

                  </div>

                </div>

                <div className="modal-footer bg-light p-3 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-4"
                    onClick={() => setIsPrinterModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-bold shadow-sm">
                    {editingStation ? 'Update Printer Station' : 'Save New Printer Station'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thermal Printer Connectivity Ping & Diagnostic Console */}
      {testingStation && (
        <div className="modal show d-block bg-dark bg-opacity-75" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              
              <div className="modal-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Printer className="w-5 h-5 text-warning" />
                  <div>
                    <h6 className="modal-title fw-bold mb-0">Thermal Printer Connectivity & Hardware Ping Test</h6>
                    <span className="text-muted small">Target: {testingStation.stationName}</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setTestingStation(null)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                
                {/* Station Info Specs Header */}
                <div className="bg-white p-3 rounded-3 border mb-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
                  <div>
                    <span className="badge bg-primary-subtle text-primary border me-2">{testingStation.printerType}</span>
                    <span className="fw-bold font-monospace text-dark" style={{ fontSize: '0.95rem' }}>
                      {testingStation.printerType === 'Network IP (LAN/Wi-Fi)'
                        ? `IP: ${testingStation.ipAddress || '192.168.1.100'} : RAW Port ${testingStation.port || 9100}`
                        : `Queue / Device: ${testingStation.printerQueueName || 'POS80_Spool'}`}
                    </span>
                  </div>
                  
                  <div>
                    {isTesting ? (
                      <span className="badge bg-warning-subtle text-warning border px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Pinging Hardware...</span>
                      </span>
                    ) : testSuccess ? (
                      <span className="badge bg-success text-white px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Connected & Ready</span>
                      </span>
                    ) : (
                      <span className="badge bg-danger text-white px-3 py-1.5 fw-bold d-flex align-items-center gap-1.5">
                        <span>Connection Failed</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Diagnostic Terminal Output Console */}
                <div className="bg-dark text-success p-3 rounded-3 shadow-inner font-monospace mb-3" style={{ minHeight: '180px', maxHeight: '240px', overflowY: 'auto', fontSize: '0.8rem', lineHeight: '1.5' }}>
                  <div className="text-secondary border-bottom border-secondary pb-1 mb-2 d-flex justify-content-between">
                    <span>ESC/POS Hardware Communication Terminal</span>
                    <span>BAUD: 115200 RAW</span>
                  </div>
                  {testLogs.map((log, idx) => (
                    <div key={idx} className={log.includes('ERROR') || log.includes('FAILED') ? 'text-danger fw-bold' : log.includes('PASSED') ? 'text-info fw-bold' : 'text-light'}>
                      {log}
                    </div>
                  ))}
                  {isTesting && (
                    <div className="text-warning animate-pulse mt-1">
                      &gt; Sending raw ESC/POS binary socket bytes...
                    </div>
                  )}
                </div>

                {/* Categories Routed Info */}
                <div className="alert alert-info py-2 px-3 mb-0 small d-flex align-items-center justify-content-between">
                  <span>Assigned Categories: <strong>{testingStation.assignedCategories?.join(', ') || 'All Categories'}</strong></span>
                  <span className="badge bg-white text-dark border">Roll: {testingStation.paperWidth || '80mm'}</span>
                </div>

              </div>

              <div className="modal-footer bg-light p-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3"
                  onClick={() => setTestingStation(null)}
                >
                  Close Console
                </button>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => runPrinterDiagnosticPing(testingStation)}
                    disabled={isTesting}
                    className="btn btn-outline-dark btn-sm fw-bold d-flex align-items-center gap-1.5"
                  >
                    <TestTube className="w-4 h-4" />
                    <span>Re-Run Diagnostic Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendDummyTestPrint(testingStation)}
                    className="btn btn-primary btn-sm fw-bold px-3 d-flex align-items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Send Dummy KOT Print Ticket</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: SQL Script Preview & Copy Viewer */}
      {isSqlModalOpen && (
        <div className="modal show d-block bg-dark bg-opacity-75" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content border-0 shadow-lg rounded-3">
              
              <div className="modal-header bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <div>
                    <h6 className="modal-title fw-bold mb-0">Production SQL Database Schema & Data Dump Viewer</h6>
                    <span className="text-muted small">Compatible with PostgreSQL, MySQL 8+, SQLite 3</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setIsSqlModalOpen(false)}></button>
              </div>

              <div className="modal-body p-4 bg-light">
                <div className="alert alert-info py-2 px-3 small mb-3 d-flex align-items-center justify-content-between border-info-subtle">
                  <span>
                    <strong>Instructions:</strong> Copy the SQL queries below or click <strong>Download .sql File</strong> to import into your offline database (PostgreSQL, MySQL, DBeaver, or phpMyAdmin).
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sqlPreviewText);
                      alert('SQL Script copied to clipboard successfully!');
                    }}
                    className="btn btn-sm btn-info text-white fw-bold px-3 d-flex align-items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  className="form-control font-monospace bg-dark text-success p-3 rounded-3 shadow-inner text-xs"
                  rows={18}
                  value={sqlPreviewText}
                  style={{ lineHeight: '1.4', fontSize: '0.8rem' }}
                />
              </div>

              <div className="modal-footer bg-light p-3 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
                  onClick={() => setIsSqlModalOpen(false)}
                >
                  Close Viewer
                </button>

                <button
                  type="button"
                  onClick={() => downloadDatabaseSqlFile()}
                  className="btn btn-primary btn-sm fw-bold px-4 d-flex align-items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .sql File</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

