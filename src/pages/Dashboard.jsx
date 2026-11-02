import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Lock, LogOut, Plus, Trash2, Edit, Printer, FileText, 
  Search, RefreshCw, BarChart2, ShieldAlert, Key, Users, Truck, CheckCircle2, 
  AlertCircle, Barcode, ChevronRight, Globe, Sliders, CheckSquare, Square, 
  UserPlus, UserMinus, Settings, Save, X, ExternalLink
} from 'lucide-react';
import LabelGenerator from '../components/LabelGenerator';
import ReceiptGenerator from '../components/ReceiptGenerator';
import { translations } from '../i18n/translations';
import { apiFetch } from '../utils/api.js';

export default function Dashboard({ lang = 'en', user, onLogin, onLogout }) {
  const t = translations[lang] || translations.en;

  // Login & Auth Form States
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up Form States
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    country: 'United States'
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  // Forgot Password Form States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Active Tab
  // 'shipments', 'users', 'settings', 'security', 'new_shipment'
  const [activeTab, setActiveTab] = useState('shipments');

  // Data States
  const [shipments, setShipments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [settingsList, setSettingsList] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Modals
  const [selectedLabelShipment, setSelectedLabelShipment] = useState(null);
  const [selectedReceiptShipment, setSelectedReceiptShipment] = useState(null);
  const [statusUpdateShipment, setStatusUpdateShipment] = useState(null);
  const [newStatus, setNewStatus] = useState('IN_TRANSIT');
  const [newLocation, setNewLocation] = useState('');
  const [newStatusDesc, setNewStatusDesc] = useState('');

  // Settings Modal (Create / Edit)
  const [settingModal, setSettingModal] = useState(null); // { isNew: true/false, key: '', value: '', category: 'general', description: '', is_public: true }
  
  // Create Client Modal
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    fullName: '',
    email: '',
    password: 'client123',
    companyName: '',
    country: 'United States',
    phone: '',
    assignedAdminId: ''
  });

  // Edit User Modal State
  const [editUserModal, setEditUserModal] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    country: 'United States',
    role: 'client',
    isActive: true,
    password: ''
  });
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [editUserError, setEditUserError] = useState('');

  // Edit Shipment Modal State
  const [editShipmentModal, setEditShipmentModal] = useState(null);
  const [editShipmentForm, setEditShipmentForm] = useState({
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    sender_address: '',
    sender_country: 'United States',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    recipient_country: 'United States',
    courier_partner: 'Swift Line Express',
    service_type: 'EXPRESS_AIR',
    weight_kg: 1.0,
    dimensions_cm: '30x20x15',
    declared_value_usd: 100.0,
    shipping_cost_usd: 29.5,
    payment_status: 'PAID',
    status: 'ORDER_CREATED',
    origin: '',
    destination: '',
    current_location: '',
    estimated_delivery: '',
    notes: ''
  });
  const [editShipmentLoading, setEditShipmentLoading] = useState(false);
  const [editShipmentError, setEditShipmentError] = useState('');

  // New Shipment Booking Form — defaults to logged-in client's credentials
  const [newShipmentForm, setNewShipmentForm] = useState({
    sender_name: user?.fullName || '',
    sender_email: user?.email || '',
    sender_phone: user?.phone || '',
    sender_address: '',
    sender_country: user?.country || 'United States',
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    recipient_address: '',
    recipient_country: 'United States',
    courier_partner: 'Swift Line Express',
    service_type: 'EXPRESS_AIR',
    weight_kg: 1.0,
    dimensions_cm: '30x20x15',
    declared_value_usd: 100,
    notes: ''
  });

  // Keep sender fields synchronized with logged-in user's profile
  useEffect(() => {
    if (user?.email) {
      setNewShipmentForm(prev => ({
        ...prev,
        sender_email: user.email,
        sender_name: prev.sender_name || user.fullName || '',
        sender_phone: prev.sender_phone || user.phone || '',
        sender_country: prev.sender_country || user.country || 'United States'
      }));
    }
  }, [user]);

  const token = localStorage.getItem('swift_token');

  // Flash status message
  const flashMessage = (msg) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  // Fetch Data Function
  const loadDashboardData = async () => {
    if (!token || !user) return;
    setLoadingData(true);
    try {
      // 1. Fetch Shipments (Scoped by backend)
      const shpRes = await apiFetch('/api/shipments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (shpRes.ok) {
        const shpData = await shpRes.json();
        setShipments(shpData);
      }

      // 2. SuperAdmin / Admin data (Scoped by backend)
      if (['superadmin', 'admin'].includes(user.role)) {
        const usrRes = await apiFetch('/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (usrRes.ok) {
          const usrData = await usrRes.json();
          setUsersList(usrData);
        }
      }

      // 3. Settings (SuperAdmin gets all; Admin gets if permitted)
      const setRes = await apiFetch('/api/system/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (setRes.ok) {
        const setData = await setRes.json();
        setSettingsList(setData);
      }

      // 4. SuperAdmin Metrics & Security Logs
      if (user.role === 'superadmin') {
        const sysRes = await apiFetch('/api/system/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sysRes.ok) {
          const sysData = await sysRes.json();
          setSystemMetrics(sysData);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user, token]);

  // Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: (loginEmail || '').trim(),
          password: (loginPassword || '').trim()
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (parseErr) {
        setLoginError(`Server returned status ${res.status}. Please check backend logs or /api/health.`);
        return;
      }

      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setLoginError(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setLoginError('Unable to connect to server. Please check your network or server status.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Sign Up Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupLoading(true);
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: (signupForm.fullName || '').trim(),
          email: (signupForm.email || '').trim().toLowerCase(),
          password: signupForm.password,
          phone: (signupForm.phone || '').trim(),
          country: (signupForm.country || '').trim()
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        setSignupError('Server returned invalid response. Please try again.');
        return;
      }

      if (res.ok) {
        onLogin(data.user, data.token);
      } else {
        setSignupError(data.error || 'Failed to create account. Please check the details.');
      }
    } catch (err) {
      setSignupError('Unable to connect to server. Please check your network.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: (forgotEmail || '').trim().toLowerCase()
        })
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        setForgotError('Server returned invalid response. Please try again.');
        return;
      }

      if (res.ok) {
        setForgotMessage(data.message || 'If an account is associated with this email, temporary login credentials have been dispatched.');
      } else {
        setForgotError(data.error || 'Failed to process request.');
      }
    } catch (err) {
      setForgotError('Unable to connect to server. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Demo Login Pre-fill
  const handleDemoLogin = (role) => {
    if (role === 'superadmin') {
      setLoginEmail('superadmin@myswiftline.com');
      setLoginPassword('superadmin123');
    } else if (role === 'admin') {
      setLoginEmail('admin@myswiftline.com');
      setLoginPassword('admin123');
    } else {
      setLoginEmail('client@myswiftline.com');
      setLoginPassword('client123');
    }
  };

  // Status Update Submit
  const handleStatusUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!statusUpdateShipment) return;

    try {
      const res = await apiFetch(`/api/shipments/${statusUpdateShipment.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          current_location: newLocation,
          description: newStatusDesc
        })
      });

      const data = await res.json();
      if (res.ok) {
        flashMessage(`Shipment ${statusUpdateShipment.tracking_number} updated to ${newStatus}`);
        setStatusUpdateShipment(null);
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to update shipment status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  // Create Shipment Submit
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newShipmentForm)
      });

      const data = await res.json();
      if (res.ok) {
        flashMessage(`Shipment created successfully: ${data.shipment.tracking_number}`);
        setNewShipmentForm({
          sender_name: user?.fullName || '',
          sender_email: user?.email || '',
          sender_phone: user?.phone || '',
          sender_address: '',
          sender_country: user?.country || 'United States',
          recipient_name: '',
          recipient_email: '',
          recipient_phone: '',
          recipient_address: '',
          recipient_country: 'United States',
          courier_partner: 'Swift Line Express',
          service_type: 'EXPRESS_AIR',
          weight_kg: 1.0,
          dimensions_cm: '30x20x15',
          declared_value_usd: 100,
          notes: ''
        });
        setActiveTab('shipments');
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to create shipment');
      }
    } catch (err) {
      console.error(err);
      alert('Error booking shipment');
    }
  };

  // Delete Shipment (SuperAdmin Only)
  const handleDeleteShipment = async (id) => {
    if (!window.confirm('Super Admin Action: Permanently delete this shipment?')) return;
    try {
      const res = await apiFetch(`/api/shipments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        flashMessage('Shipment deleted by Super Admin');
        loadDashboardData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Role Change (SuperAdmin Only)
  const handleChangeRole = async (userId, newRole) => {
    try {
      const res = await apiFetch(`/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        flashMessage(`User role updated to ${newRole}`);
        loadDashboardData();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SUPER ADMIN: Assign Client to Admin
  const handleAssignClient = async (clientId, adminId) => {
    try {
      const res = await apiFetch(`/api/auth/clients/${clientId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminId: adminId === 'unassigned' ? null : adminId })
      });
      const data = await res.json();
      if (res.ok) {
        flashMessage(data.message || 'Client assignment updated');
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to assign client');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SUPER ADMIN: Toggle Admin Permission
  const handleToggleAdminPerm = async (adminUser, permKey) => {
    const currentPerms = adminUser.permissions || [];
    let updated;
    if (currentPerms.includes(permKey)) {
      updated = currentPerms.filter(p => p !== permKey);
    } else {
      updated = [...currentPerms, permKey];
    }

    try {
      const res = await apiFetch(`/api/auth/admins/${adminUser.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: updated })
      });
      const data = await res.json();
      if (res.ok) {
        flashMessage(`Updated permissions for Admin ${adminUser.fullName}`);
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to update admin permissions');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CREATE CLIENT SUBMIT
  const handleCreateClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/auth/users/create-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newClientForm)
      });
      const data = await res.json();
      if (res.ok) {
        flashMessage(`Client created: ${data.client.fullName} (${data.client.email})`);
        setClientModalOpen(false);
        setNewClientForm({
          fullName: '',
          email: '',
          password: 'client123',
          companyName: '',
          country: 'United States',
          phone: '',
          assignedAdminId: ''
        });
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to create client');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating client');
    }
  };

  // Open Edit User Modal
  const openEditUser = (u) => {
    setEditUserModal(u);
    setEditUserError('');
    setEditUserForm({
      fullName: u.fullName || '',
      email: u.email || '',
      phone: u.phone || '',
      companyName: u.companyName || '',
      country: u.country || 'United States',
      role: u.role || 'client',
      isActive: u.isActive !== false,
      password: ''
    });
  };

  // Submit User Information Edit
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    setEditUserError('');
    setEditUserLoading(true);

    try {
      const payload = {
        fullName: editUserForm.fullName,
        email: editUserForm.email,
        phone: editUserForm.phone,
        companyName: editUserForm.companyName,
        country: editUserForm.country,
        role: editUserForm.role,
        isActive: editUserForm.isActive
      };
      if (editUserForm.password && editUserForm.password.trim()) {
        payload.password = editUserForm.password.trim();
      }

      const res = await apiFetch(`/api/auth/users/${editUserModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        flashMessage(`User profile for "${data.user.fullName}" updated successfully.`);
        setEditUserModal(null);
        loadDashboardData();
      } else {
        setEditUserError(data.error || 'Failed to update user profile.');
      }
    } catch (err) {
      console.error(err);
      setEditUserError('Unable to connect to server. Please try again.');
    } finally {
      setEditUserLoading(false);
    }
  };

  // Open Edit Shipment Modal
  const openEditShipment = (shp) => {
    setEditShipmentError('');
    setEditShipmentModal(shp);
    setEditShipmentForm({
      sender_name: shp.sender_name || '',
      sender_email: shp.sender_email || '',
      sender_phone: shp.sender_phone || '',
      sender_address: shp.sender_address || '',
      sender_country: shp.sender_country || shp.origin || 'United States',
      recipient_name: shp.recipient_name || '',
      recipient_email: shp.recipient_email || '',
      recipient_phone: shp.recipient_phone || '',
      recipient_address: shp.recipient_address || '',
      recipient_country: shp.recipient_country || shp.destination || 'United States',
      courier_partner: shp.courier_partner || 'Swift Line Express',
      service_type: shp.service_type || 'EXPRESS_AIR',
      weight_kg: shp.weight_kg ?? 1.0,
      dimensions_cm: shp.dimensions_cm || '30x20x15',
      declared_value_usd: shp.declared_value_usd ?? 100.0,
      shipping_cost_usd: shp.shipping_cost_usd ?? 29.5,
      payment_status: shp.payment_status || 'PAID',
      status: shp.status || 'ORDER_CREATED',
      origin: shp.origin || shp.sender_country || '',
      destination: shp.destination || shp.recipient_country || '',
      current_location: shp.current_location || '',
      estimated_delivery: shp.estimated_delivery ? shp.estimated_delivery.split('T')[0] : '',
      notes: shp.notes || ''
    });
  };

  // Submit Shipment Details Edit
  const handleEditShipmentSubmit = async (e) => {
    e.preventDefault();
    if (!editShipmentModal) return;
    setEditShipmentError('');
    setEditShipmentLoading(true);

    try {
      const res = await apiFetch(`/api/shipments/${editShipmentModal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editShipmentForm)
      });

      const data = await res.json();
      if (res.ok) {
        flashMessage(`Shipment ${editShipmentModal.tracking_number} updated successfully.`);
        setEditShipmentModal(null);
        loadDashboardData();
      } else {
        setEditShipmentError(data.error || 'Failed to update shipment.');
      }
    } catch (err) {
      console.error(err);
      setEditShipmentError('Server communication error. Please try again.');
    } finally {
      setEditShipmentLoading(false);
    }
  };

  // SETTING SAVE (CREATE OR UPDATE)
  const handleSaveSetting = async (e) => {
    e.preventDefault();
    if (!settingModal) return;

    try {
      const isNew = settingModal.isNew;
      const url = isNew ? '/api/system/settings' : `/api/system/settings/${settingModal.key}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          key: settingModal.key,
          value: settingModal.value,
          category: settingModal.category,
          description: settingModal.description,
          is_public: settingModal.is_public
        })
      });

      const data = await res.json();
      if (res.ok) {
        flashMessage(data.message || 'Setting saved successfully');
        setSettingModal(null);
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to save setting');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving setting');
    }
  };

  // SETTING DELETE (SUPER ADMIN ONLY)
  const handleDeleteSetting = async (key) => {
    if (!window.confirm(`Super Admin Action: Delete setting "${key}"?`)) return;

    try {
      const res = await apiFetch(`/api/system/settings/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        flashMessage(data.message || 'Setting deleted');
        loadDashboardData();
      } else {
        alert(data.error || 'Failed to delete setting');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to check user permissions
  const hasPerm = (perm) => {
    if (!user) return false;
    if (user.role === 'superadmin') return true;
    if (user.role === 'admin') {
      const liveUser = usersList.find(u => u.id === user.id);
      const perms = liveUser?.permissions || user.permissions || [];
      return perms.includes('*') || perms.includes(perm);
    }
    return false;
  };

  // List of all admins in the system (for assignment dropdown)
  const adminOptions = usersList.filter(u => ['admin', 'superadmin'].includes(u.role));

  // IF NOT LOGGED IN -> RENDER LOGIN / SIGN UP / FORGOT PASSWORD PORTAL
  if (!user) {
    return (
      <div className="pt-24 pb-16 min-h-[85vh] flex items-center justify-center px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#0F2C59] text-[#FF6B00] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F2C59] dark:text-white font-display">
              {authMode === 'login' && 'Swift Line Portal Login'}
              {authMode === 'signup' && 'Create Client Account'}
              {authMode === 'forgot' && 'Reset Portal Password'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {authMode === 'login' && 'Access your role-based logistics dashboard. Secure TLS encrypted.'}
              {authMode === 'signup' && 'Register for instant real-time shipment booking and live GPS tracking.'}
              {authMode === 'forgot' && 'Enter your registered email to receive temporary login credentials.'}
            </p>
          </div>

          {/* Quick Demo Pre-fill Buttons — hidden in production & only on login */}
          {!import.meta.env.PROD && authMode === 'login' && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block text-center">Quick Demo Login Selector:</span>
              <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('superadmin')}
                  className="py-1.5 px-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="py-1.5 px-2 rounded-lg bg-[#0F2C59] text-white hover:bg-slate-800"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('client')}
                  className="py-1.5 px-2 rounded-lg bg-[#FF6B00] text-white hover:bg-[#E05D00]"
                >
                  Client
                </button>
              </div>
            </div>
          )}

          {/* ── 1. SIGN IN FORM ────────────────────────────────────────── */}
          {authMode === 'login' && (
            <>
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@myswiftline.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('forgot'); setLoginError(''); }}
                      className="text-[11px] text-[#FF6B00] hover:underline font-bold cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loginLoading ? 'Authenticating...' : 'Secure Sign In'}</span>
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setLoginError(''); }}
                    className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ── 2. SIGN UP FORM ────────────────────────────────────────── */}
          {authMode === 'signup' && (
            <>
              {signupError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={signupForm.fullName}
                    onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    placeholder="you@company.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone (Optional)</label>
                    <input
                      type="text"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Country</label>
                    <input
                      type="text"
                      value={signupForm.country}
                      onChange={(e) => setSignupForm({ ...signupForm, country: e.target.value })}
                      placeholder="United States"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{signupLoading ? 'Creating Account...' : 'Create Account'}</span>
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setSignupError(''); }}
                    className="text-[#FF6B00] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ── 3. FORGOT PASSWORD FORM ────────────────────────────────── */}
          {authMode === 'forgot' && (
            <>
              {forgotError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-start gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Registered Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@myswiftline.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-[#FF6B00] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>{forgotLoading ? 'Sending Credentials...' : 'Send Reset Instructions'}</span>
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setForgotError(''); setForgotMessage(''); }}
                  className="text-xs text-[#0F2C59] dark:text-slate-300 font-bold hover:text-[#FF6B00] dark:hover:text-[#FF6B00] cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  // IF LOGGED IN -> RENDER RBAC DASHBOARD PORTAL
  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Flash Message Banner */}
        {statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Top User Greeting & Role Banner */}
        <div className="bg-[#0F2C59] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-4 border-[#FF6B00]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#FF6B00] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                {user.role} Portal
              </span>
              <span className="text-xs text-slate-300 font-semibold">Active Session: {user.email}</span>
              {user.role === 'admin' && (
                <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
                  Scoped View: Assigned Clients Only
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold font-display">Welcome back, {user.fullName || 'User'}!</h1>
            <p className="text-xs text-slate-300">Swift Line Worldwide Courier • Strict Scoped RBAC & Permissions Control</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* SuperAdmin Global Metrics Bar */}
        {user.role === 'superadmin' && systemMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">Total Revenue</span>
              <p className="text-2xl font-black text-[#0F2C59] dark:text-[#FF6B00]">${systemMetrics.metrics.totalRevenueUSD} USD</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">System Users</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{systemMetrics.metrics.totalUsers}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">Active Transits</span>
              <p className="text-2xl font-black text-emerald-500">{systemMetrics.metrics.activeTransits}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 block">Website Settings</span>
              <p className="text-2xl font-black text-purple-600">{settingsList.length} Active</p>
            </div>
          </div>
        )}

        {/* Admin Permission Badges Bar (Visible to Admin) */}
        {user.role === 'admin' && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Granted Admin Permissions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['manage_shipments', 'update_status', 'manage_clients', 'print_documents', 'edit_settings'].map(perm => {
                const granted = hasPerm(perm);
                return (
                  <span
                    key={perm}
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${
                      granted
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 line-through opacity-60'
                    }`}
                  >
                    {perm.replace('_', ' ')}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation Controls */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          {/* Shipments Tab */}
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'shipments'
                ? 'bg-[#0F2C59] text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Truck className="w-4 h-4 text-[#FF6B00]" />
            <span>
              {user.role === 'admin' ? `Assigned Shipments (${shipments.length})` : `Shipments (${shipments.length})`}
            </span>
          </button>

          {/* Book New Shipment Tab */}
          {(user.role !== 'admin' || hasPerm('manage_shipments')) && (
            <button
              onClick={() => setActiveTab('new_shipment')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'new_shipment'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Book New Shipment</span>
            </button>
          )}

          {/* User Directory (Super Admin & Admin) */}
          {['superadmin', 'admin'].includes(user.role) && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>
                {user.role === 'admin' ? `My Assigned Clients (${usersList.length})` : `Users & Assignment (${usersList.length})`}
              </span>
            </button>
          )}

          {/* Website Settings CRUD (Super Admin or Admin with 'edit_settings') */}
          {(user.role === 'superadmin' || hasPerm('edit_settings')) && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4 text-cyan-300" />
              <span>Website Settings ({settingsList.length})</span>
            </button>
          )}

          {/* Security Logs (Super Admin Only) */}
          {user.role === 'superadmin' && (
            <button
              onClick={() => setActiveTab('security')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === 'security'
                  ? 'bg-purple-900 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Security & Bot Logs</span>
            </button>
          )}
        </div>

        {/* TAB 1: SHIPMENTS LISTING */}
        {activeTab === 'shipments' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-[#0F2C59] dark:text-white font-display">
                  {user.role === 'admin' ? 'Assigned Clients Package Queue' : 'Registered Package Queue'}
                </h3>
                <span className="text-xs text-slate-400">
                  {user.role === 'admin' 
                    ? 'Showing shipments only for clients created by you or assigned to you by Super Admin.' 
                    : 'Real-time GPS status, barcode labels, and itemized customer receipts.'}
                </span>
              </div>

              {(user.role !== 'admin' || hasPerm('manage_shipments')) && (
                <button
                  onClick={() => setActiveTab('new_shipment')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B00] text-white text-xs font-bold hover:bg-[#E05D00] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Shipment</span>
                </button>
              )}
            </div>

            {shipments.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <Truck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No shipments found in your current queue.</p>
                <p className="text-xs text-slate-400 mt-1">
                  {user.role === 'admin' 
                    ? 'No clients have been assigned to you yet, or your assigned clients have no shipments.' 
                    : 'Click Book Shipment to register your first package.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                      <th className="py-3 px-3">Tracking #</th>
                      <th className="py-3 px-3">Sender / Receiver</th>
                      <th className="py-3 px-3">Carrier / Type</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {shipments.map((shp) => (
                      <tr key={shp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-3 font-mono font-bold text-[#FF6B00]">
                          {shp.tracking_number}
                        </td>
                        <td className="py-4 px-3">
                          <div className="text-slate-900 dark:text-white font-bold">{shp.sender_name} ➔ {shp.recipient_name}</div>
                          <span className="text-[10px] text-slate-400">{shp.origin} to {shp.destination} ({shp.weight_kg}kg)</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                            {shp.courier_partner}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="bg-amber-100 dark:bg-amber-950/60 text-[#FF6B00] px-2.5 py-1 rounded-full font-bold uppercase text-[10px]">
                            {shp.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                          {shp.current_location}
                        </td>
                        <td className="py-4 px-3 text-right space-x-1 whitespace-nowrap">
                          {/* Print Label Button (Requires print_documents permission for admin) */}
                          {(user.role === 'superadmin' || user.role === 'client' || hasPerm('print_documents')) && (
                            <button
                              onClick={() => setSelectedLabelShipment(shp)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#FF6B00] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                              title="Print Barcode Label"
                            >
                              <Barcode className="w-3.5 h-3.5 inline mr-1" /> Label
                            </button>
                          )}

                          {/* Print Receipt Button */}
                          {(user.role === 'superadmin' || user.role === 'client' || hasPerm('print_documents')) && (
                            <button
                              onClick={() => setSelectedReceiptShipment(shp)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#0F2C59] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors"
                              title="Print Receipt"
                            >
                              <FileText className="w-3.5 h-3.5 inline mr-1" /> Receipt
                            </button>
                          )}

                          {/* Edit Shipment Info for Admin / SuperAdmin */}
                          {(user.role === 'superadmin' || (user.role === 'admin' && hasPerm('manage_shipments'))) && (
                            <button
                              onClick={() => openEditShipment(shp)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                              title="Edit Shipment Details"
                            >
                              <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit Info
                            </button>
                          )}

                          {/* Status Updater for Admin / SuperAdmin */}
                          {(user.role === 'superadmin' || (user.role === 'admin' && hasPerm('update_status'))) && (
                            <button
                              onClick={() => {
                                setStatusUpdateShipment(shp);
                                setNewStatus(shp.status);
                                setNewLocation(shp.current_location);
                                setNewStatusDesc('');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 inline mr-1" /> Update Status
                            </button>
                          )}

                          {/* SuperAdmin Delete */}
                          {user.role === 'superadmin' && (
                            <button
                              onClick={() => handleDeleteShipment(shp.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-950"
                              title="SuperAdmin Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOK NEW SHIPMENT FORM */}
        {activeTab === 'new_shipment' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto space-y-6">
            <h3 className="text-2xl font-extrabold text-[#0F2C59] dark:text-white font-display">
              Book International Shipment
            </h3>

            <form onSubmit={handleCreateShipment} className="space-y-6">
              {/* Sender Details */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block border-b pb-1">1. Sender Information</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Sender Full Name"
                    value={newShipmentForm.sender_name}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, sender_name: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Sender Email"
                    value={newShipmentForm.sender_email}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, sender_email: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Sender Address"
                    value={newShipmentForm.sender_address}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, sender_address: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Sender Country"
                    value={newShipmentForm.sender_country}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, sender_country: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block border-b pb-1">2. Recipient Information</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newShipmentForm.recipient_name}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, recipient_name: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Recipient Email"
                    value={newShipmentForm.recipient_email}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, recipient_email: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Address"
                    value={newShipmentForm.recipient_address}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, recipient_address: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Recipient Country"
                    value={newShipmentForm.recipient_country}
                    onChange={(e) => setNewShipmentForm({ ...newShipmentForm, recipient_country: e.target.value })}
                    className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                  />
                </div>
              </div>

              {/* Courier Selection & Weight */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider block border-b pb-1">3. Package & Carrier</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Carrier Network</label>
                    <select
                      value={newShipmentForm.courier_partner}
                      onChange={(e) => setNewShipmentForm({ ...newShipmentForm, courier_partner: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                    >
                      <option value="Swift Line Express">Swift Line Express</option>
                      <option value="DHL Express">DHL Express</option>
                      <option value="FedEx World Express">FedEx World Express</option>
                      <option value="UPS Worldwide Saver">UPS Worldwide Saver</option>
                      <option value="Aramex Global">Aramex Global</option>
                      <option value="Maersk Logistics Ocean">Maersk Ocean Line</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Weight (KG)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newShipmentForm.weight_kg}
                      onChange={(e) => setNewShipmentForm({ ...newShipmentForm, weight_kg: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Declared Value (USD)</label>
                    <input
                      type="number"
                      required
                      value={newShipmentForm.declared_value_usd}
                      onChange={(e) => setNewShipmentForm({ ...newShipmentForm, declared_value_usd: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-2xl bg-[#FF6B00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-xl transition-all"
              >
                Create Shipment & Issue Barcode Airway Bill
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: USER DIRECTORY, PERMISSION CONFIG & CLIENT ASSIGNMENT */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#0F2C59] dark:text-white font-display">
                  {user.role === 'admin' ? 'My Assigned Clients Directory' : 'System User Directory & Access Management'}
                </h3>
                <p className="text-xs text-slate-400">
                  {user.role === 'admin'
                    ? 'Admins only have access to clients they created or that Super Admin explicitly assigned.'
                    : 'Super Admin has global visibility: assign clients to admins, configure granular admin permissions.'}
                </p>
              </div>

              {(user.role === 'superadmin' || hasPerm('manage_clients')) && (
                <button
                  onClick={() => setClientModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Client</span>
                </button>
              )}
            </div>

            {/* SUPER ADMIN ONLY: ADMINS & PERMISSIONS MANAGEMENT SECTION */}
            {user.role === 'superadmin' && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-sm font-extrabold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                    1. Admins & Function Permissions Config
                  </h4>
                  <span className="text-[11px] text-slate-400">Super Admin decides which functions each admin can access</span>
                </div>

                <div className="space-y-3">
                  {usersList.filter(u => u.role === 'admin').map((adminUser) => {
                    const availablePerms = [
                      { id: 'manage_shipments', label: 'Shipment CRUD' },
                      { id: 'update_status', label: 'Status Scanner' },
                      { id: 'manage_clients', label: 'Create Clients' },
                      { id: 'print_documents', label: 'Print Labels/Receipts' },
                      { id: 'edit_settings', label: 'Edit Site Settings' },
                    ];

                    return (
                      <div
                        key={adminUser.id}
                        className="bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {adminUser.fullName}
                            </span>
                            <span className="text-xs text-slate-500 ml-2">({adminUser.email})</span>
                          </div>
                          
                          {/* Role Badge and Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 uppercase">
                              Role: {adminUser.role}
                            </span>

                            {/* Edit Admin Information Button */}
                            <button
                              type="button"
                              onClick={() => openEditUser(adminUser)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              title="Edit admin profile and credentials"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Info</span>
                            </button>

                            {/* Prominent Return to Client Button */}
                            <button
                              type="button"
                              onClick={() => handleChangeRole(adminUser.id, 'client')}
                              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                              title="Demote this admin back to a regular client"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                              <span>Return to Client</span>
                            </button>

                            {/* Full Role Switcher Dropdown */}
                            <select
                              value={adminUser.role}
                              onChange={(e) => handleChangeRole(adminUser.id, e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold focus:ring-2 focus:ring-[#FF6B00] cursor-pointer"
                            >
                              <option value="admin">Role: Admin</option>
                              <option value="client">Demote to Client</option>
                              <option value="superadmin">Promote to Super Admin</option>
                            </select>
                          </div>
                        </div>

                        {/* Checkbox Controls for Granular Permissions */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
                            Allowed Functions & Permissions:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {availablePerms.map(p => {
                              const isChecked = (adminUser.permissions || []).includes(p.id) || (adminUser.permissions || []).includes('*');
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleToggleAdminPerm(adminUser, p.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                    isChecked
                                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                                      : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:border-purple-400'
                                  }`}
                                >
                                  {isChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                                  <span>{p.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CLIENTS DIRECTORY & ASSIGNMENT SECTION */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-extrabold text-[#0F2C59] dark:text-white uppercase tracking-wider">
                  {user.role === 'superadmin' ? '2. Clients & Admin Assignments' : 'My Assigned Clients'}
                </h4>
                <span className="text-[11px] text-slate-400">
                  {user.role === 'superadmin' ? 'Select an Admin to assign each client to' : 'Clients created by or assigned to you'}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold uppercase">
                      <th className="py-3 px-3">Client Name</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Company / Country</th>
                      <th className="py-3 px-3">Assigned Admin</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                    {usersList.filter(u => u.role === 'client').map((client) => {
                      const assignedAdmin = adminOptions.find(a => a.id === client.assigned_admin_id);

                      return (
                        <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-4 px-3 font-bold text-slate-900 dark:text-white">
                            {client.fullName}
                          </td>
                          <td className="py-4 px-3 text-slate-600 dark:text-slate-300">
                            {client.email}
                          </td>
                          <td className="py-4 px-3">
                            <span className="text-slate-900 dark:text-white font-semibold">{client.companyName || 'Individual'}</span>
                            <span className="text-[10px] text-slate-400 block">{client.country}</span>
                          </td>
                          <td className="py-4 px-3">
                            {user.role === 'superadmin' ? (
                              <select
                                value={client.assigned_admin_id || 'unassigned'}
                                onChange={(e) => handleAssignClient(client.id, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs focus:ring-2 focus:ring-[#FF6B00]"
                              >
                                <option value="unassigned">Unassigned</option>
                                {adminOptions.map(adm => (
                                  <option key={adm.id} value={adm.id}>
                                    {adm.fullName} ({adm.role})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                                {assignedAdmin ? assignedAdmin.fullName : 'Assigned to You'}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Client Information */}
                              <button
                                type="button"
                                onClick={() => openEditUser(client)}
                                className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg inline-flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
                                title="Edit client profile and credentials"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit Info</span>
                              </button>

                              {user.role === 'superadmin' && (
                                <button
                                  onClick={() => handleChangeRole(client.id, 'admin')}
                                  className="px-2.5 py-1.5 bg-[#0F2C59] hover:bg-[#1B4B8A] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                                  title="Promote this client to admin"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Promote</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: WEBSITE SETTINGS MANAGER (FULL SUPER ADMIN CRUD) */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#0F2C59] dark:text-white font-display">
                  Website & Platform Settings (Full CRUD)
                </h3>
                <p className="text-xs text-slate-400">
                  Manage branding, founded history, default rates, contact telephone, and system configurations.
                </p>
              </div>

              <button
                onClick={() => setSettingModal({
                  isNew: true,
                  key: '',
                  value: '',
                  category: 'general',
                  description: '',
                  is_public: true
                })}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F2C59] hover:bg-slate-800 text-white text-xs font-bold shadow"
              >
                <Plus className="w-4 h-4 text-[#FF6B00]" />
                <span>Add New Setting</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="py-3 px-3">Setting Key</th>
                    <th className="py-3 px-3">Value</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Access</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                  {settingsList.map((st) => (
                    <tr key={st.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0F2C59] dark:text-cyan-400">
                        {st.key}
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px] truncate text-slate-900 dark:text-white font-bold">
                        {st.value}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold">
                          {st.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 max-w-[240px] truncate">
                        {st.description || '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.is_public ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {st.is_public ? 'Public' : 'Protected'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSettingModal({
                            isNew: false,
                            key: st.key,
                            value: st.value,
                            category: st.category,
                            description: st.description,
                            is_public: st.is_public
                          })}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#FF6B00] hover:text-white font-bold text-[11px]"
                        >
                          <Edit className="w-3.5 h-3.5 inline mr-1" /> Edit
                        </button>

                        {user.role === 'superadmin' && (
                          <button
                            onClick={() => handleDeleteSetting(st.key)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded"
                            title="Delete Setting"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: SUPER ADMIN SECURITY LOGS */}
        {activeTab === 'security' && systemMetrics && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-xl font-extrabold text-[#0F2C59] dark:text-white font-display">
              Security Audit & DDoS Defense Monitor
            </h3>
            <div className="space-y-3 font-mono text-xs">
              {systemMetrics.securityAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-red-400 font-bold">{log.eventType}</span>
                    <p className="text-slate-400 text-[11px]">IP: {log.ip} | Details: {log.details}</p>
                  </div>
                  <span className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE / EDIT SETTING MODAL */}
        {settingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#0F2C59] dark:text-white">
                  {settingModal.isNew ? 'Create Website Setting' : `Edit Setting: ${settingModal.key}`}
                </h3>
                <button onClick={() => setSettingModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleSaveSetting} className="space-y-3">
                {settingModal.isNew && (
                  <div>
                    <label className="text-xs font-bold block mb-1">Setting Key (unique)</label>
                    <input
                      type="text"
                      required
                      value={settingModal.key}
                      onChange={(e) => setSettingModal({ ...settingModal, key: e.target.value })}
                      placeholder="e.g. company_founded"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold block mb-1">Setting Value</label>
                  <textarea
                    required
                    rows="3"
                    value={settingModal.value}
                    onChange={(e) => setSettingModal({ ...settingModal, value: e.target.value })}
                    placeholder="Enter configuration value"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Category</label>
                    <select
                      value={settingModal.category}
                      onChange={(e) => setSettingModal({ ...settingModal, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border font-bold"
                    >
                      <option value="general">General</option>
                      <option value="history">History</option>
                      <option value="contact">Contact</option>
                      <option value="logistics">Logistics</option>
                      <option value="financial">Financial</option>
                      <option value="security">Security</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold block mb-1">Visibility</label>
                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingModal.is_public}
                        onChange={(e) => setSettingModal({ ...settingModal, is_public: e.target.checked })}
                        className="rounded accent-[#FF6B00]"
                      />
                      <span className="text-xs font-semibold">Public API</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Description</label>
                  <input
                    type="text"
                    value={settingModal.description}
                    onChange={(e) => setSettingModal({ ...settingModal, description: e.target.value })}
                    placeholder="Describe purpose of setting"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSettingModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#0F2C59] text-white font-bold text-xs shadow hover:bg-slate-800"
                  >
                    Save Setting
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE CLIENT MODAL */}
        {clientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#0F2C59] dark:text-white">Create New Client Account</h3>
                <button onClick={() => setClientModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <form onSubmit={handleCreateClientSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newClientForm.fullName}
                    onChange={(e) => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newClientForm.email}
                    onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                    placeholder="client@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Company Name</label>
                    <input
                      type="text"
                      value={newClientForm.companyName}
                      onChange={(e) => setNewClientForm({ ...newClientForm, companyName: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Country</label>
                    <input
                      type="text"
                      value={newClientForm.country}
                      onChange={(e) => setNewClientForm({ ...newClientForm, country: e.target.value })}
                      placeholder="e.g. Germany"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border"
                    />
                  </div>
                </div>

                {user.role === 'superadmin' && (
                  <div>
                    <label className="text-xs font-bold block mb-1">Assign to Admin (Optional)</label>
                    <select
                      value={newClientForm.assignedAdminId}
                      onChange={(e) => setNewClientForm({ ...newClientForm, assignedAdminId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border font-bold"
                    >
                      <option value="">Unassigned</option>
                      {adminOptions.map(adm => (
                        <option key={adm.id} value={adm.id}>
                          {adm.fullName} ({adm.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setClientModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow hover:bg-purple-700"
                  >
                    Create Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT USER INFORMATION MODAL (SUPER ADMIN & AUTHORIZED ADMINS) */}
        {editUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                    <Edit className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#0F2C59] dark:text-white">Edit User Information</h3>
                    <p className="text-[11px] text-slate-500">Updating profile for {editUserModal.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {editUserError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editUserError}</span>
                </div>
              )}

              <form onSubmit={handleEditUserSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editUserForm.fullName}
                      onChange={(e) => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editUserForm.phone}
                      onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={editUserForm.companyName}
                      onChange={(e) => setEditUserForm({ ...editUserForm, companyName: e.target.value })}
                      placeholder="e.g. Apex Global Trading"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1">Country</label>
                    <input
                      type="text"
                      value={editUserForm.country}
                      onChange={(e) => setEditUserForm({ ...editUserForm, country: e.target.value })}
                      placeholder="United States"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  {user.role === 'superadmin' ? (
                    <div>
                      <label className="text-xs font-bold block mb-1">Assigned Role</label>
                      <select
                        value={editUserForm.role}
                        onChange={(e) => setEditUserForm({ ...editUserForm, role: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="client">Client</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-bold block mb-1">Role</label>
                      <input
                        type="text"
                        disabled
                        value={editUserForm.role.toUpperCase()}
                        className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700 font-bold text-slate-500"
                      />
                    </div>
                  )}
                </div>

                {user.role === 'superadmin' && (
                  <div>
                    <label className="text-xs font-bold block mb-1">Account Status</label>
                    <select
                      value={editUserForm.isActive ? 'active' : 'suspended'}
                      onChange={(e) => setEditUserForm({ ...editUserForm, isActive: e.target.value === 'active' })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold"
                    >
                      <option value="active">Active (Access Allowed)</option>
                      <option value="suspended">Suspended / Inactive (Login Blocked)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold block mb-1">
                    Reset Password <span className="text-[10px] text-slate-400 font-normal">(Optional — leave blank to keep current)</span>
                  </label>
                  <input
                    type="password"
                    value={editUserForm.password}
                    onChange={(e) => setEditUserForm({ ...editUserForm, password: e.target.value })}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditUserModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editUserLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#1A4384] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editUserLoading ? 'Saving...' : 'Save User Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT SHIPMENT MODAL */}
        {editShipmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-[#0F2C59] dark:text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-600" />
                    <span>Edit Shipment Information</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tracking #: <span className="font-mono font-bold text-[#FF6B00]">{editShipmentModal.tracking_number}</span>
                  </p>
                </div>
                <button
                  onClick={() => setEditShipmentModal(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editShipmentError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editShipmentError}</span>
                </div>
              )}

              <form onSubmit={handleEditShipmentSubmit} className="space-y-4">
                {/* 1. SENDER DETAILS */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider block">1. Sender Information</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Sender Full Name</label>
                      <input
                        type="text"
                        required
                        value={editShipmentForm.sender_name}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, sender_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Sender Email</label>
                      <input
                        type="email"
                        required
                        value={editShipmentForm.sender_email}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, sender_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Sender Phone</label>
                      <input
                        type="text"
                        value={editShipmentForm.sender_phone}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, sender_phone: e.target.value })}
                        placeholder="+1 555-0199"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Sender Country / Origin</label>
                      <input
                        type="text"
                        required
                        value={editShipmentForm.sender_country}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, sender_country: e.target.value, origin: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Sender Full Address</label>
                    <input
                      type="text"
                      value={editShipmentForm.sender_address}
                      onChange={(e) => setEditShipmentForm({ ...editShipmentForm, sender_address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* 2. RECIPIENT DETAILS */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider block">2. Recipient Information</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Full Name</label>
                      <input
                        type="text"
                        required
                        value={editShipmentForm.recipient_name}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, recipient_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Email</label>
                      <input
                        type="email"
                        required
                        value={editShipmentForm.recipient_email}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, recipient_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Phone</label>
                      <input
                        type="text"
                        value={editShipmentForm.recipient_phone}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, recipient_phone: e.target.value })}
                        placeholder="+1 555-0244"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Country / Destination</label>
                      <input
                        type="text"
                        required
                        value={editShipmentForm.recipient_country}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, recipient_country: e.target.value, destination: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Recipient Full Address</label>
                    <input
                      type="text"
                      value={editShipmentForm.recipient_address}
                      onChange={(e) => setEditShipmentForm({ ...editShipmentForm, recipient_address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* 3. PACKAGE & LOGISTICS DETAILS */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider block">3. Package & Logistics Details</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Carrier Network</label>
                      <select
                        value={editShipmentForm.courier_partner}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, courier_partner: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="Swift Line Express">Swift Line Express</option>
                        <option value="DHL Express">DHL Express</option>
                        <option value="FedEx World Express">FedEx World Express</option>
                        <option value="UPS Worldwide Saver">UPS Worldwide Saver</option>
                        <option value="Aramex Global">Aramex Global</option>
                        <option value="Maersk Logistics Ocean">Maersk Ocean Line</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Service Type</label>
                      <select
                        value={editShipmentForm.service_type}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, service_type: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="EXPRESS_AIR">Express Air</option>
                        <option value="STANDARD_GROUND">Standard Ground</option>
                        <option value="OCEAN_FREIGHT">Ocean Freight</option>
                        <option value="PRIORITY_DOC">Priority Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Weight (KG)</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={editShipmentForm.weight_kg}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, weight_kg: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Dimensions (LxWxH)</label>
                      <input
                        type="text"
                        value={editShipmentForm.dimensions_cm}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, dimensions_cm: e.target.value })}
                        placeholder="30x20x15"
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Declared Value ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editShipmentForm.declared_value_usd}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, declared_value_usd: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Shipping Cost ($ USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editShipmentForm.shipping_cost_usd}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, shipping_cost_usd: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Payment Status</label>
                      <select
                        value={editShipmentForm.payment_status}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, payment_status: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold"
                      >
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Shipment Status</label>
                      <select
                        value={editShipmentForm.status}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, status: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-bold text-[#FF6B00]"
                      >
                        <option value="ORDER_CREATED">Order Created</option>
                        <option value="PICKED_UP">Picked Up</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="CUSTOMS_HOLD">Customs Hold</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="EXCEPTION">Exception / On Hold</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Current Scan Location</label>
                      <input
                        type="text"
                        value={editShipmentForm.current_location}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, current_location: e.target.value })}
                        placeholder="e.g. Frankfurt Hub Terminal 2"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Estimated Delivery Date</label>
                      <input
                        type="date"
                        value={editShipmentForm.estimated_delivery}
                        onChange={(e) => setEditShipmentForm({ ...editShipmentForm, estimated_delivery: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Internal Notes / Handling Instructions</label>
                    <input
                      type="text"
                      value={editShipmentForm.notes}
                      onChange={(e) => setEditShipmentForm({ ...editShipmentForm, notes: e.target.value })}
                      placeholder="e.g. Fragile glass item, handle with utmost care"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditShipmentModal(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editShipmentLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#1A4384] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editShipmentLoading ? 'Saving...' : 'Save Shipment Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* STATUS UPDATE MODAL */}
        {statusUpdateShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-700">
              <h3 className="font-bold text-lg text-[#0F2C59] dark:text-white">Update Package Status</h3>
              <p className="text-xs text-slate-500">Tracking #: {statusUpdateShipment.tracking_number}</p>
              
              <form onSubmit={handleStatusUpdateSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="ORDER_CREATED">Order Created</option>
                    <option value="PICKED_UP">Picked Up</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="CUSTOMS_HOLD">Customs Clearance Hold</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Current Scan Location</label>
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Frankfurt Hub Airport Customs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Scan Remarks</label>
                  <input
                    type="text"
                    value={newStatusDesc}
                    onChange={(e) => setNewStatusDesc(e.target.value)}
                    placeholder="e.g. Customs released parcel. En route to Berlin distribution hub."
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStatusUpdateShipment(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF6B00] text-white font-bold text-xs shadow"
                  >
                    Update & Send Email Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PRINT MODAL OVERLAYS */}
        {selectedLabelShipment && (
          <LabelGenerator
            shipment={selectedLabelShipment}
            onClose={() => setSelectedLabelShipment(null)}
          />
        )}

        {selectedReceiptShipment && (
          <ReceiptGenerator
            shipment={selectedReceiptShipment}
            onClose={() => setSelectedReceiptShipment(null)}
          />
        )}

      </div>
    </div>
  );
}
