import React, { useState } from 'react';
import { Employee, UserRole } from '../../types';
import { UserCheck, Clock, UserPlus, Edit2, Trash2, X } from 'lucide-react';

interface EmployeeViewProps {
  employees: Employee[];
  onAddEmployee?: (employee: Employee) => void;
  onUpdateEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  isDarkMode: boolean;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  isDarkMode
}) => {
  const [clockedIn, setClockedIn] = useState<Record<string, boolean>>({
    'emp-101': true,
    'emp-104': true
  });

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
    code: '',
    name: '',
    email: '',
    phone: '',
    department: 'Service & Floor',
    designation: 'Staff',
    role: 'Waiter',
    salary: 500,
    shift: 'Morning',
    status: 'Active'
  });

  const toggleClock = (empId: string) => {
    setClockedIn(prev => ({
      ...prev,
      [empId]: !prev[empId]
    }));
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormData({
      code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      department: 'Service & Floor',
      designation: 'Staff Member',
      role: 'Waiter',
      salary: 500,
      shift: 'Morning',
      status: 'Active'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      code: emp.code,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      role: emp.role,
      salary: emp.salary,
      shift: emp.shift,
      status: emp.status
    });
    setShowModal(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter employee name');
      return;
    }

    if (editingEmployee) {
      const updated: Employee = {
        ...editingEmployee,
        ...formData
      };
      if (onUpdateEmployee) onUpdateEmployee(updated);
    } else {
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        ...formData
      };
      if (onAddEmployee) onAddEmployee(newEmp);
    }

    setShowModal(false);
  };

  const confirmDelete = () => {
    if (employeeToDelete && onDeleteEmployee) {
      onDeleteEmployee(employeeToDelete.id);
    }
    setEmployeeToDelete(null);
  };

  return (
    <div className="container-fluid p-4">
      
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 border-bottom pb-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 bg-primary text-white rounded-3 shadow-sm">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="h4 fw-bold mb-0">Employee Staff & Attendance Register</h1>
            <p className="text-muted small mb-0">Roster, shift schedules, clock-in/out attendance simulator, and payroll management</p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary d-flex align-items-center gap-2 fw-semibold px-3 shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Staff</span>
        </button>
      </div>

      <div className={`card border-0 shadow-sm rounded-3 ${isDarkMode ? 'bg-dark text-white border-secondary' : 'bg-white'}`}>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code & Name</th>
                <th>Department & Title</th>
                <th>Shift</th>
                <th>Role</th>
                <th>Monthly Salary</th>
                <th>Attendance Today</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No employees registered yet. Click "Register New Staff" to add team members.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const isClocked = clockedIn[emp.id];

                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="fw-bold">{emp.name}</div>
                        <span className="text-muted small font-monospace">{emp.code} | {emp.phone}</span>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border me-1">{emp.department}</span>
                        <span className="small text-muted">{emp.designation}</span>
                      </td>

                      <td className="small font-monospace">{emp.shift}</td>

                      <td>
                        <span className="badge bg-primary-subtle text-primary">{emp.role}</span>
                      </td>

                      <td className="fw-bold font-monospace text-success">${emp.salary.toFixed(2)}</td>

                      <td>
                        <span className={`badge ${isClocked ? 'bg-success' : 'bg-secondary'}`}>
                          {isClocked ? 'Present (Clocked In)' : 'Offline'}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-inline-flex align-items-center justify-content-end gap-1">
                          <button
                            onClick={() => toggleClock(emp.id)}
                            className={`btn btn-xs font-monospace fw-bold p-1 rounded-2 me-1 ${isClocked ? 'btn-outline-danger' : 'btn-success text-white'}`}
                            style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                            title="Clock In / Out"
                          >
                            <Clock className="w-3.5 h-3.5 d-inline me-1" />
                            {isClocked ? 'Clock Out' : 'Clock In'}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="btn btn-xs btn-outline-secondary p-1 rounded-2"
                            title="Edit Employee"
                            style={{ padding: '2px 6px' }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setEmployeeToDelete(emp)}
                            className="btn btn-xs btn-outline-danger p-1 rounded-2"
                            title="Delete Employee"
                            style={{ padding: '2px 6px' }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {showModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-primary text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  <span>{editingEmployee ? 'Edit Staff Details' : 'Register New Employee'}</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveEmployee}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Employee Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Hassan Ahmed"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Employee Code</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="+252 61 555 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="staff@restaurant.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Department</label>
                      <select
                        className="form-select"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Kitchen & Food Prep">Kitchen & Food Prep</option>
                        <option value="Service & Floor">Service & Floor</option>
                        <option value="Management & Cash">Management & Cash</option>
                        <option value="Inventory & Store">Inventory & Store</option>
                        <option value="Accounting & Audit">Accounting & Audit</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Designation Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Head Chef, Captain Waiter"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">System User Role</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      >
                        <option value="Cashier">Cashier</option>
                        <option value="Waiter">Waiter</option>
                        <option value="Kitchen Staff">Kitchen Staff</option>
                        <option value="Branch Manager">Branch Manager</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Accountant">Accountant</option>
                        <option value="Super Admin">Super Admin</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Monthly Salary ($)</label>
                      <input
                        type="number"
                        step="10"
                        className="form-control font-monospace fw-bold"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Shift Schedule</label>
                      <select
                        className="form-select"
                        value={formData.shift}
                        onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                      >
                        <option value="Morning">Morning Shift</option>
                        <option value="Evening">Evening Shift</option>
                        <option value="Night">Night Shift</option>
                        <option value="Full Day">Full Day Shift</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light p-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4">
                    {editingEmployee ? 'Update Staff Member' : 'Register Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-danger text-white p-3">
                <h5 className="modal-title h6 fw-bold d-flex align-items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Staff Member</span>
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setEmployeeToDelete(null)}></button>
              </div>
              <div className="modal-body p-3 text-center">
                <p className="mb-1 text-dark fw-semibold">Delete "{employeeToDelete.name}"?</p>
                <p className="small text-muted mb-0">This staff record and history will be permanently removed.</p>
              </div>
              <div className="modal-footer bg-light p-2.5 d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setEmployeeToDelete(null)}>Cancel</button>
                <button type="button" className="btn btn-sm btn-danger fw-bold px-3" onClick={confirmDelete}>
                  Delete Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
