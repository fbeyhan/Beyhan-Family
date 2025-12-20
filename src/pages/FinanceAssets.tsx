import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminAuth';
import { db } from '../config/firebase';
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';

// Helper function to get today's date in Eastern US timezone
const getTodayInEastern = (): string => {
  const now = new Date();
  const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const year = easternDate.getFullYear();
  const month = String(easternDate.getMonth() + 1).padStart(2, '0');
  const day = String(easternDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Asset {
  id: string;
  type: 'investment' | 'retirement' | 'savings' | 'property';
  name: string;
  balance: number;
  institution?: string;
  accountNumber?: string;
  asOfDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceAssets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'investment' as Asset['type'],
    name: '',
    balance: '',
    institution: '',
    accountNumber: '',
    asOfDate: getTodayInEastern(),
    notes: '',
  });

  // Redirect if not admin
  if (!user || !isAdmin(user.email)) {
    navigate('/dashboard');
    return null;
  }

  // Fetch assets
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const assetsRef = collection(db, 'assets');
        const q = query(assetsRef, orderBy('name'));
        const snapshot = await getDocs(q);

        const assetsList: Asset[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          assetsList.push({
            id: doc.id,
            type: data.type,
            name: data.name,
            balance: data.balance,
            institution: data.institution,
            accountNumber: data.accountNumber,
            asOfDate: data.asOfDate.toDate(),
            notes: data.notes,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
          });
        });

        setAssets(assetsList);
      } catch (error) {
        console.error('Error fetching assets:', error);
        alert('Failed to load assets');
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const resetForm = () => {
    setFormData({
      type: 'investment',
      name: '',
      balance: '',
      institution: '',
      accountNumber: '',
      asOfDate: getTodayInEastern(),
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (asset: Asset) => {
    setFormData({
      type: asset.type,
      name: asset.name,
      balance: asset.balance.toString(),
      institution: asset.institution || '',
      accountNumber: asset.accountNumber || '',
      asOfDate: asset.asOfDate.toISOString().split('T')[0],
      notes: asset.notes || '',
    });
    setEditingId(asset.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.balance) {
      alert('Please fill in required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing asset
        await updateDoc(doc(db, 'assets', editingId), {
          type: formData.type,
          name: formData.name,
          balance: parseFloat(formData.balance),
          institution: formData.institution || null,
          accountNumber: formData.accountNumber || null,
          asOfDate: Timestamp.fromDate(new Date(formData.asOfDate)),
          notes: formData.notes || null,
          updatedAt: Timestamp.now(),
        });

        setAssets(
          assets.map((a) =>
            a.id === editingId
              ? {
                  ...a,
                  type: formData.type,
                  name: formData.name,
                  balance: parseFloat(formData.balance),
                  institution: formData.institution,
                  accountNumber: formData.accountNumber,
                  asOfDate: new Date(formData.asOfDate),
                  notes: formData.notes,
                  updatedAt: new Date(),
                }
              : a
          )
        );
      } else {
        // Add new asset
        const docRef = await addDoc(collection(db, 'assets'), {
          type: formData.type,
          name: formData.name,
          balance: parseFloat(formData.balance),
          institution: formData.institution || null,
          accountNumber: formData.accountNumber || null,
          asOfDate: Timestamp.fromDate(new Date(formData.asOfDate)),
          notes: formData.notes || null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        const newAsset: Asset = {
          id: docRef.id,
          type: formData.type,
          name: formData.name,
          balance: parseFloat(formData.balance),
          institution: formData.institution,
          accountNumber: formData.accountNumber,
          asOfDate: new Date(formData.asOfDate),
          notes: formData.notes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setAssets([...assets, newAsset]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Failed to save asset');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'assets', id));
      setAssets(assets.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const totalNetWorth = assets.reduce((sum, asset) => sum + asset.balance, 0);

  const assetTypeIcons: Record<Asset['type'], string> = {
    investment: '📈',
    retirement: '🏦',
    savings: '💰',
    property: '🏠',
  };

  const assetTypeLabels: Record<Asset['type'], string> = {
    investment: 'Investment',
    retirement: 'Retirement',
    savings: 'Savings',
    property: 'Property',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            data-cy="back-to-finance"
            onClick={() => navigate('/finance')}
            className="text-amber-600 hover:text-amber-700 mb-4 flex items-center gap-2"
          >
            ← Back to Finance
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
                <span data-cy="assets-title">Assets & Accounts</span>
              </h1>
              <p className="text-slate-600 mt-1">Track investments, retirement, and savings</p>
            </div>
            <button
              data-cy="add-asset-btn"
              onClick={() => setShowForm(!showForm)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              {showForm ? 'Cancel' : '+ Add Asset'}
            </button>
          </div>
        </div>

        {/* Net Worth Summary */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-8 rounded-2xl shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-2 opacity-90">Total Net Worth</h2>
          <p className="text-5xl font-bold">{formatCurrency(totalNetWorth)}</p>
          <p className="text-sm opacity-80 mt-2">{assets.length} accounts tracked</p>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Edit Asset' : 'Add New Asset'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Asset['type'] })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  required
                >
                  <option value="investment">📈 Investment</option>
                  <option value="retirement">🏦 Retirement</option>
                  <option value="savings">💰 Savings</option>
                  <option value="property">🏠 Property</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Account Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  placeholder="e.g., 401k - Vanguard"
                  required
                />
              </div>

              {/* Balance */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Balance *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* As Of Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">As of Date *</label>
                <input
                  type="date"
                  value={formData.asOfDate}
                  onChange={(e) => setFormData({ ...formData, asOfDate: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  required
                />
              </div>

              {/* Institution */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Institution</label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  placeholder="e.g., Vanguard, Fidelity"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Account Number (last 4 digits)
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  placeholder="****1234"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none resize-none"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                {editingId ? 'Update Asset' : 'Add Asset'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Assets List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-slate-600" data-cy="assets-empty-state">
              No assets tracked yet. Click "Add Asset" to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {assets.map((asset) => (
                <div key={asset.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{assetTypeIcons[asset.type]}</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {assetTypeLabels[asset.type]}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{asset.name}</h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        {asset.institution && <p>🏛️ {asset.institution}</p>}
                        {asset.accountNumber && <p>💳 ****{asset.accountNumber}</p>}
                        <p>📅 As of {formatDate(asset.asOfDate)}</p>
                        {asset.notes && <p className="italic">📝 {asset.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600 mb-3">
                        {formatCurrency(asset.balance)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(asset)}
                          className="px-4 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          Delete
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
    </div>
  );
};

export default FinanceAssets;
