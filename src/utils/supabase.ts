import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL);
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY);

  if (!url || !key) {
    return null;
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}

/**
 * Fetch rows from a Supabase table with error handling and fallback
 */
export async function fetchFromSupabase<T = any>(table: string): Promise<T[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.warn(`[Supabase Fetch Warning] Failed to fetch table '${table}':`, error.message);
      return null;
    }
    return data as T[];
  } catch (err) {
    console.error(`[Supabase Fetch Error] Exception on table '${table}':`, err);
    return null;
  }
}

/**
 * Upsert a single row or array of rows into a Supabase table
 */
export async function upsertToSupabase(table: string, records: any | any[]): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const items = Array.isArray(records) ? records : [records];
  if (items.length === 0) return true;

  try {
    const { error } = await supabase.from(table).upsert(items, { onConflict: 'id' });
    if (error) {
      console.warn(`[Supabase Upsert Warning] Table '${table}':`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase Upsert Error] Table '${table}':`, err);
    return false;
  }
}

/**
 * Delete a row by ID from a Supabase table
 */
export async function deleteFromSupabase(table: string, id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.warn(`[Supabase Delete Warning] Table '${table}', id '${id}':`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase Delete Error] Table '${table}':`, err);
    return false;
  }
}

/**
 * Load all application data directly from Supabase tables
 */
export async function loadAllFromSupabase() {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [
      categories,
      menuItems,
      diningTables,
      orders,
      customers,
      inventory,
      expenses,
      employees,
      tenants,
      settings,
      posDayHistory
    ] = await Promise.all([
      fetchFromSupabase('categories'),
      fetchFromSupabase('menu_items'),
      fetchFromSupabase('dining_tables'),
      fetchFromSupabase('orders'),
      fetchFromSupabase('customers'),
      fetchFromSupabase('inventory'),
      fetchFromSupabase('expenses'),
      fetchFromSupabase('employees'),
      fetchFromSupabase('tenants'),
      fetchFromSupabase('settings'),
      fetchFromSupabase('pos_day_history')
    ]);

    return {
      categories,
      menuItems: menuItems ? menuItems.map(item => ({
        ...item,
        price: item.selling_price || item.price,
        category: item.category_id || item.category,
        available: item.is_available ?? item.available ?? true
      })) : null,
      tables: diningTables ? diningTables.map(tbl => ({
        ...tbl,
        number: tbl.table_number || tbl.number,
        seats: tbl.capacity || tbl.seats || 4
      })) : null,
      orders,
      customers,
      inventory,
      expenses,
      employees,
      tenants,
      settings: settings && settings.length > 0 ? settings[0] : null,
      posDayHistory
    };
  } catch (err) {
    console.error('[Supabase Load All Error]', err);
    return null;
  }
}

/**
 * Sync entire local state into Supabase tables
 */
export async function syncAllToSupabase(payload: any): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  try {
    if (payload.categories && payload.categories.length > 0) {
      const catRecords = payload.categories.map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || 'Utensils',
        description: c.description || '',
        item_count: c.itemCount || c.item_count || 0
      }));
      await upsertToSupabase('categories', catRecords);
    }

    if (payload.menu_items && payload.menu_items.length > 0) {
      const menuRecords = payload.menu_items.map((m: any) => ({
        id: m.id,
        name: m.name,
        category_id: m.category || m.category_id,
        selling_price: m.price || m.selling_price || 0,
        cost_price: m.costPrice || m.cost_price || 0,
        description: m.description || '',
        image: m.image || '',
        is_available: m.available ?? m.is_available ?? true,
        prep_time_minutes: m.prepTimeMinutes || m.prep_time_minutes || 10
      }));
      await upsertToSupabase('menu_items', menuRecords);
    }

    if (payload.tables && payload.tables.length > 0) {
      const tableRecords = payload.tables.map((t: any) => ({
        id: t.id,
        table_number: t.number || t.table_number,
        capacity: t.seats || t.capacity || 4,
        status: t.status || 'Available',
        area: t.area || 'Main Hall'
      }));
      await upsertToSupabase('dining_tables', tableRecords);
    }

    if (payload.customers && payload.customers.length > 0) {
      const custRecords = payload.customers.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        wallet_balance: c.walletBalance || c.wallet_balance || 0,
        total_spent: c.totalSpent || c.total_spent || 0,
        total_orders_count: c.totalOrdersCount || c.total_orders_count || 0,
        notes: c.notes || ''
      }));
      await upsertToSupabase('customers', custRecords);
    }

    if (payload.employees && payload.employees.length > 0) {
      const empRecords = payload.employees.map((e: any) => ({
        id: e.id,
        name: e.name,
        role: e.role || 'Cashier',
        pin: e.pin || '1234',
        email: e.email || '',
        phone: e.phone || '',
        status: e.status || 'Active',
        shift: e.shift || 'Morning'
      }));
      await upsertToSupabase('employees', empRecords);
    }

    if (payload.inventory && payload.inventory.length > 0) {
      const invRecords = payload.inventory.map((i: any) => ({
        id: i.id,
        name: i.name,
        category: i.category || 'General',
        stock_quantity: i.stockQuantity || i.stock_quantity || i.quantity || 0,
        min_threshold: i.minThreshold || i.min_threshold || 10,
        unit: i.unit || 'kg',
        unit_cost: i.unitCost || i.unit_cost || 0,
        supplier_name: i.supplierName || i.supplier_name || ''
      }));
      await upsertToSupabase('inventory', invRecords);
    }

    if (payload.expenses && payload.expenses.length > 0) {
      const expRecords = payload.expenses.map((e: any) => ({
        id: e.id,
        title: e.title,
        category: e.category || 'General',
        amount: e.amount || 0,
        payment_method: e.paymentMethod || e.payment_method || 'Cash',
        recorded_by: e.recordedBy || e.recorded_by || 'Admin',
        notes: e.notes || '',
        date: e.date || new Date().toISOString().split('T')[0]
      }));
      await upsertToSupabase('expenses', expRecords);
    }

    if (payload.tenants && payload.tenants.length > 0) {
      const tenantRecords = payload.tenants.map((t: any) => ({
        id: t.id,
        code: t.code || 'REST-001',
        name: t.name,
        owner_name: t.ownerName || t.owner_name || '',
        email: t.email || '',
        phone: t.phone || '',
        address: t.address || '',
        plan: t.plan || 'Starter',
        status: t.status || 'Active',
        currency_symbol: t.currencySymbol || t.currency_symbol || '$',
        tax_rate: t.taxRate ?? t.tax_rate ?? 0
      }));
      await upsertToSupabase('tenants', tenantRecords);
    }

    if (payload.orders && payload.orders.length > 0) {
      const orderRecords = payload.orders.map((o: any) => ({
        id: o.id,
        order_number: o.orderNumber || o.order_number || o.id,
        table_id: o.tableId || o.table_id || '',
        customer_name: o.customerName || o.customer_name || 'Guest',
        waiter_name: o.waiterName || o.waiter_name || 'Staff',
        order_type: o.orderType || o.order_type || 'Dine In',
        status: o.status || 'Completed',
        payment_method: o.paymentMethod || o.payment_method || 'Cash',
        payment_status: o.paymentStatus || o.payment_status || 'Paid',
        subtotal: o.subtotal || o.totalAmount || 0,
        tax_amount: o.taxAmount || o.tax || 0,
        discount_amount: o.discountAmount || o.discount || 0,
        total_amount: o.totalAmount || o.total_amount || 0,
        kitchen_notes: o.kitchenNotes || o.notes || ''
      }));
      await upsertToSupabase('orders', orderRecords);
    }

    return true;
  } catch (err) {
    console.error('[Supabase Sync All Error]', err);
    return false;
  }
}
