import React, { useState, useEffect } from 'react';
import { User, RestaurantSettings, RestaurantTenant } from '../../types';
import { Eye, EyeOff, Globe, AlertCircle, Info, Lock, Shield, Store, UserCheck } from 'lucide-react';

interface LoginViewProps {
  settings: RestaurantSettings;
  users: User[];
  onLogin: (user: User) => void;
  activeTenant?: RestaurantTenant;
  tenants?: RestaurantTenant[];
  onSelectTenant?: (tenantId: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  settings,
  users,
  onLogin,
  activeTenant,
  tenants = [],
  onSelectTenant
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Failed login attempt tracking (per user ID or 'direct_pin')
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  // Lockout timestamp tracking (key -> unlock time in ms)
  const [lockedUntil, setLockedUntil] = useState<Record<string, number>>({});
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);

  const LOCKOUT_THRESHOLD = 5;
  const LOCKOUT_DURATION_SEC = 30;

  const currentTargetKey = selectedUser ? selectedUser.id : 'direct_pin';

  // Countdown timer effect for locked accounts
  useEffect(() => {
    const checkLockout = () => {
      const lockExpiry = lockedUntil[currentTargetKey] || 0;
      const now = Date.now();
      if (lockExpiry > now) {
        const remainingSec = Math.ceil((lockExpiry - now) / 1000);
        setLockoutRemaining(remainingSec);
        setError(`Account Locked: 5 consecutive incorrect PIN entries. Please wait ${remainingSec}s to try again.`);
      } else {
        setLockoutRemaining(0);
        if (lockedUntil[currentTargetKey] && lockExpiry <= now) {
          // Lock expired -> reset attempt count and unlock
          setLockedUntil(prev => {
            const copy = { ...prev };
            delete copy[currentTargetKey];
            return copy;
          });
          setFailedAttempts(prev => ({ ...prev, [currentTargetKey]: 0 }));
          setError('');
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [currentTargetKey, lockedUntil]);

  // Clear PIN when selected profile changes
  useEffect(() => {
    setPin('');
    const lockExpiry = lockedUntil[currentTargetKey] || 0;
    if (lockExpiry <= Date.now()) {
      setError('');
    }
  }, [selectedUser, currentTargetKey, lockedUntil]);

  const handleKeyPress = (num: string) => {
    if (lockoutRemaining > 0) return;
    setError('');
    if (pin.length < 8) {
      setPin(prev => prev + num);
    }
  };

  const handleClear = () => {
    if (lockoutRemaining > 0) return;
    setPin('');
    setError('');
  };

  const recordFailedAttempt = (key: string, userDisplayName: string) => {
    const newCount = (failedAttempts[key] || 0) + 1;
    setFailedAttempts(prev => ({ ...prev, [key]: newCount }));

    if (newCount >= LOCKOUT_THRESHOLD) {
      const unlockTime = Date.now() + (LOCKOUT_DURATION_SEC * 1000);
      setLockedUntil(prev => ({ ...prev, [key]: unlockTime }));
      setLockoutRemaining(LOCKOUT_DURATION_SEC);
      setError(`Account Locked: 5 consecutive incorrect PIN entries for ${userDisplayName}. Please wait ${LOCKOUT_DURATION_SEC}s to try again.`);
    } else {
      const remainingAttempts = LOCKOUT_THRESHOLD - newCount;
      setError(`Incorrect PIN code for ${userDisplayName}. ${newCount}/5 failed attempts (${remainingAttempts} left before account lock).`);
    }
  };

  const checkTenantSuspended = (u: User | null, matchedTenantObj?: RestaurantTenant | null): boolean => {
    if (u && u.role === 'Super Admin') return false;

    if (matchedTenantObj && matchedTenantObj.status === 'Suspended') {
      return true;
    }

    const tId = u?.tenantId || u?.branchId || activeTenant?.id;
    if (tId) {
      const foundT = tenants.find(t => t.id === tId);
      if (foundT && foundT.status === 'Suspended') {
        return true;
      }
    } else if (activeTenant && activeTenant.status === 'Suspended') {
      return true;
    }

    return false;
  };

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const lockExpiry = lockedUntil[currentTargetKey] || 0;
    if (lockExpiry > Date.now()) {
      const remainingSec = Math.ceil((lockExpiry - Date.now()) / 1000);
      setError(`Account Locked: 5 consecutive incorrect PIN entries. Please wait ${remainingSec}s to try again.`);
      return;
    }

    const enteredPin = pin.trim();

    if (!enteredPin) {
      setError('Please enter your 4-digit security PIN code.');
      return;
    }

    // 1. If a profile is selected in the dropdown, verify THAT profile's PIN
    if (selectedUser) {
      if (selectedUser.pin && selectedUser.pin === enteredPin) {
        if (checkTenantSuspended(selectedUser)) {
          setError('Fadlam la xiriir Arlaadi ICT Solutions');
          return;
        }
        setFailedAttempts(prev => ({ ...prev, [selectedUser.id]: 0 }));
        onLogin(selectedUser);
        return;
      } else {
        recordFailedAttempt(selectedUser.id, selectedUser.name);
        return;
      }
    }

    // 2. Direct PIN entry mode: Search users list for matching PIN
    const matchedUser = users.find(u => u.pin === enteredPin);
    if (matchedUser) {
      if (checkTenantSuspended(matchedUser)) {
        setError('Fadlam la xiriir Arlaadi ICT Solutions');
        return;
      }
      setFailedAttempts(prev => ({ ...prev, direct_pin: 0 }));
      onLogin(matchedUser);
      return;
    }

    // 3. Search tenants list for matching restaurant PIN
    const matchedTenant = tenants.find(t => t.pin === enteredPin);
    if (matchedTenant) {
      if (checkTenantSuspended(null, matchedTenant)) {
        setError('Fadlam la xiriir Arlaadi ICT Solutions');
        return;
      }
      setFailedAttempts(prev => ({ ...prev, direct_pin: 0 }));
      if (onSelectTenant) onSelectTenant(matchedTenant.id);
      const tenantUser: User = {
        id: matchedTenant.id,
        name: matchedTenant.ownerName || matchedTenant.name,
        role: 'Restaurant Owner',
        email: matchedTenant.email,
        avatar: matchedTenant.logo,
        pin: matchedTenant.pin
      };
      onLogin(tenantUser);
      return;
    }

    // STRICT REJECTION: Invalid PIN code -> Record attempt and DENY ACCESS!
    recordFailedAttempt('direct_pin', 'entered PIN');
  };

  // Keyboard navigation support for PIN keypad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handlePinSubmit();
      } else if (e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, selectedUser, tenants, users]);

  const getBgGradient = (styleKey?: string) => {
    switch (styleKey) {
      case 'emerald_dark':
        return 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #0f5132 100%)';
      case 'indigo_purple':
        return 'linear-gradient(135deg, #311075 0%, #5b21b6 50%, #4c1d95 100%)';
      case 'slate_modern':
        return 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
      case 'warm_sunset':
        return 'linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #9a3412 100%)';
      case 'clean_light':
        return 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #94a3b8 100%)';
      case 'blue_gradient':
      default:
        return 'linear-gradient(135deg, #1d3557 0%, #2a5298 50%, #1e3c72 100%)';
    }
  };

  const btnColor = settings.loginButtonColor || '#2b7fff';
  const logoImage = settings.loginLogo || settings.logo;
  const showLogoCard = settings.loginShowLogo !== false;
  const showProfileSelector = settings.loginShowProfileSelector === true;

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 p-md-4"
      style={{
        background: getBgGradient(settings.loginBgStyle),
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      <div 
        className="card border-0 shadow-lg overflow-hidden rounded-4 w-100"
        style={{ maxWidth: '920px', minHeight: '540px' }}
      >
        <div className="row g-0 h-100 min-vh-50">
          {/* Left Decorative & Branding Panel */}
          <div 
            className="col-md-5 d-flex flex-column justify-content-between p-4 position-relative overflow-hidden"
            style={{
              backgroundColor: '#edf2f7',
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(220,230,245,0.8) 0%, rgba(235,242,250,0.5) 90%)'
            }}
          >
            {/* Soft decorative background circles */}
            <div 
              className="position-absolute rounded-circle border border-danger opacity-25"
              style={{ width: '220px', height: '220px', bottom: '-50px', right: '-50px', borderWidth: '6px' }}
            />
            <div 
              className="position-absolute rounded-circle border border-warning opacity-25"
              style={{ width: '160px', height: '160px', bottom: '20px', right: '40px', borderWidth: '4px' }}
            />
            <div 
              className="position-absolute rounded-circle border border-success opacity-25"
              style={{ width: '180px', height: '180px', top: '-40px', left: '-40px', borderWidth: '5px' }}
            />

            {/* Brand Card Component */}
            <div className="text-center my-auto py-3 z-1">
              {showLogoCard && (
                <div 
                  className="bg-white rounded-3 shadow-sm p-4 mx-auto mb-3 d-flex flex-column align-items-center justify-content-center"
                  style={{ width: '220px', minHeight: '180px' }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-2">
                    {logoImage ? (
                      <img 
                        src={logoImage} 
                        alt="Logo" 
                        style={{ maxHeight: '70px', maxWidth: '160px', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div className="position-relative d-inline-block">
                        <div className="fw-black fs-2 tracking-tighter text-dark d-flex align-items-center gap-1">
                          <span className="text-dark fw-bold">Palace</span>
                          <span className="text-danger fw-extrabold fs-1">POS</span>
                        </div>
                        <div className="text-xs text-muted fw-semibold tracking-wider text-uppercase" style={{ fontSize: '0.62rem', marginTop: '-4px' }}>
                          {settings.loginTagline || 'SMART RESTAURANT & BAR POS'}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-100 border-top my-2"></div>

                  <div className="fw-bold text-dark fs-5 mt-1">
                    {activeTenant?.name || settings.loginTitle || settings.name || 'Palace Bistro'}
                  </div>
                </div>
              )}

              {/* Sub-text details */}
              <div className="text-dark fw-bold small mb-1">
                {activeTenant?.address || settings.loginAddress || settings.address || 'KM4 Square, Mogadishu'}
              </div>
              <div className="text-warning fw-extrabold fs-6 mb-3" style={{ color: '#d97706' }}>
                {activeTenant?.phone || settings.loginPhone || settings.phone || '+252 61 555 8899'}
              </div>

              <div className="text-muted text-xs fw-semibold">
                <div>{settings.loginFooterText || 'Multi-Tenant Offline POS & Database System'}</div>
                <div className="mt-1 text-warning">
                  <Globe className="w-4 h-4 d-inline-block" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Panel - Pure PIN Code Keypad */}
          <div className="col-md-7 bg-white p-4 p-md-5 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div className="d-flex align-items-center gap-2 text-dark">
                  <Lock className="w-5 h-5 text-danger" />
                  <h2 className="h6 fw-bold mb-0">System Authentication</h2>
                </div>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold">
                  PIN Security Required
                </span>
              </div>

              {/* Announcement Banner Notice */}
              {settings.loginAnnouncement && (
                <div className="alert alert-info py-2 px-3 text-xs mb-3 d-flex align-items-center gap-2 border-info-subtle bg-info-subtle text-info-emphasis">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{settings.loginAnnouncement}</span>
                </div>
              )}

              {/* ERROR DISPLAY */}
              {error && (
                <div className={`alert ${lockoutRemaining > 0 ? 'alert-danger border-danger bg-danger-subtle text-danger-emphasis' : 'alert-danger'} py-2 px-3 small d-flex align-items-center gap-2 mb-3 shadow-sm fw-bold`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <div>
                    <span>{error}</span>
                    {lockoutRemaining > 0 && (
                      <div className="mt-1 text-xs opacity-85">
                        Account temporary lock active. System access disabled for <strong>{lockoutRemaining}s</strong>.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                {/* User Selection Profile Dropdown */}
                {showProfileSelector && (
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold mb-1 d-flex justify-content-between">
                      <span>Staff Profile</span>
                      <span className="text-primary fw-bold">{selectedUser ? selectedUser.role : 'Direct PIN Entry'}</span>
                    </label>
                    <select 
                      className="form-select form-select-sm border-secondary-subtle fw-semibold text-dark shadow-sm"
                      value={selectedUser?.id || ''}
                      disabled={lockoutRemaining > 0}
                      onChange={(e) => {
                        const u = users.find(usr => usr.id === e.target.value) || null;
                        setSelectedUser(u);
                      }}
                    >
                      <option value="">-- Enter Security PIN Directly --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Input Display Box */}
                <div className="position-relative mb-3">
                  <input 
                    type={showPin ? "text" : "password"}
                    readOnly
                    disabled={lockoutRemaining > 0}
                    className="form-control form-control-lg text-center font-monospace fw-bold fs-4 pe-5 shadow-sm border-secondary-subtle"
                    value={showPin ? pin : (pin ? '•'.repeat(pin.length) : '')}
                    style={{ letterSpacing: '0.4em' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="btn btn-link position-absolute text-muted p-0 border-0 shadow-none d-flex align-items-center justify-content-center"
                    style={{ right: '15px', top: '50%', transform: 'translateY(-50%)', width: '24px', height: '24px' }}
                    title={showPin ? "Hide Password" : "Show Password"}
                  >
                    {showPin ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* 3x4 On-Screen Keypad */}
                <div className="mx-auto" style={{ maxWidth: '300px' }}>
                  <div className="row g-2 mb-2">
                    {['1', '2', '3'].map(num => (
                      <div className="col-4" key={num}>
                        <button 
                          type="button"
                          disabled={lockoutRemaining > 0}
                          onClick={() => handleKeyPress(num)}
                          className="btn btn-primary w-100 fw-bold fs-4 py-2 rounded-3 shadow-sm text-white"
                          style={{ backgroundColor: btnColor, borderColor: btnColor, opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="row g-2 mb-2">
                    {['4', '5', '6'].map(num => (
                      <div className="col-4" key={num}>
                        <button 
                          type="button"
                          disabled={lockoutRemaining > 0}
                          onClick={() => handleKeyPress(num)}
                          className="btn btn-primary w-100 fw-bold fs-4 py-2 rounded-3 shadow-sm text-white"
                          style={{ backgroundColor: btnColor, borderColor: btnColor, opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="row g-2 mb-2">
                    {['7', '8', '9'].map(num => (
                      <div className="col-4" key={num}>
                        <button 
                          type="button"
                          disabled={lockoutRemaining > 0}
                          onClick={() => handleKeyPress(num)}
                          className="btn btn-primary w-100 fw-bold fs-4 py-2 rounded-3 shadow-sm text-white"
                          style={{ backgroundColor: btnColor, borderColor: btnColor, opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                        >
                          {num}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="row g-2">
                    <div className="col-4">
                      <button 
                        type="button"
                        disabled={lockoutRemaining > 0}
                        onClick={handleClear}
                        className="btn btn-danger w-100 fw-bold fs-5 py-2 rounded-3 shadow-sm"
                        style={{ backgroundColor: '#ea3829', borderColor: '#ea3829', opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                      >
                        C
                      </button>
                    </div>
                    <div className="col-4">
                      <button 
                        type="button"
                        disabled={lockoutRemaining > 0}
                        onClick={() => handleKeyPress('0')}
                        className="btn btn-primary w-100 fw-bold fs-4 py-2 rounded-3 shadow-sm text-white"
                        style={{ backgroundColor: btnColor, borderColor: btnColor, opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                      >
                        0
                      </button>
                    </div>
                    <div className="col-4">
                      <button 
                        type="button"
                        disabled={lockoutRemaining > 0}
                        onClick={() => handlePinSubmit()}
                        className="btn btn-success w-100 fw-bold fs-6 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', opacity: lockoutRemaining > 0 ? 0.5 : 1 }}
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};
