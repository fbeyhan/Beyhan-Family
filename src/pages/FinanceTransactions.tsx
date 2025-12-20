import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminAuth';
import { db } from '../config/firebase';
import { collection, query, getDocs, deleteDoc, doc, orderBy, where, Timestamp, updateDoc } from 'firebase/firestore';

interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  subcategory?: string;
  description?: string;
  date: Date;
  merchant?: string;
  paymentMethod?: string;
  createdAt: Date;
}

const FinanceTransactions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  // Use string for date in editForm for input compatibility
  const [editForm, setEditForm] = useState<Partial<Omit<Transaction, 'date'> & { date?: string }>>({});

  // Redirect if not admin
  if (!user || !isAdmin(user.email)) {
    navigate('/dashboard');
    return null;
  }

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(transactionsRef, orderBy('date', 'desc'));
        const snapshot = await getDocs(q);

        const txns: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          txns.push({
            id: doc.id,
            type: data.type,
            amount: data.amount,
            category: data.category,
            subcategory: data.subcategory,
            description: data.description,
            date: typeof data.date === 'string' ? new Date(data.date) : data.date.toDate(),
            merchant: data.merchant,
            paymentMethod: data.paymentMethod,
            createdAt: data.createdAt.toDate(),
          });
        });

        setTransactions(txns);
        setFilteredTransactions(txns);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        alert('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((t) => t.date >= startDate);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(term) ||
          t.category.toLowerCase().includes(term) ||
          t.subcategory?.toLowerCase().includes(term) ||
          t.merchant?.toLowerCase().includes(term)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterType, filterCategory, dateRange, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      subcategory: transaction.subcategory,
      description: transaction.description,
      date: transaction.date ? transaction.date.toISOString().slice(0, 10) : '',
      merchant: transaction.merchant,
      paymentMethod: transaction.paymentMethod,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      // Convert string date to Firestore Timestamp
      const dateTimestamp = editForm.date
        ? Timestamp.fromDate(new Date(editForm.date + 'T00:00:00'))
        : Timestamp.now();

      await updateDoc(doc(db, 'transactions', editingId), {
        amount: editForm.amount,
        date: dateTimestamp,
        description: editForm.description || null,
        merchant: editForm.merchant || null,
        paymentMethod: editForm.paymentMethod || null,
      });

      // Update local state
      setTransactions(
        transactions.map((t) =>
          t.id === editingId
            ? {
                ...t,
                amount: editForm.amount!,
                date: dateTimestamp.toDate(),
                description: editForm.description,
                merchant: editForm.merchant,
                paymentMethod: editForm.paymentMethod,
              }
            : t
        )
      );

      setEditingId(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Failed to update transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const allCategories = Array.from(new Set(transactions.map((t) => t.category))).sort();

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
            <span data-cy="transactions-title">Transaction History</span>
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Type</label>
              <select
                data-cy="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              >
                <option value="all">All</option>
                <option value="expense">Expenses</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              >
                <option value="all">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm text-slate-600">Showing</p>
                <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm text-slate-600">Net Total</p>
                <p
                  className={`text-2xl font-bold ${
                    totalAmount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-600">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              No transactions found. Try adjusting your filters or add a new transaction.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-4 md:p-6 hover:bg-slate-50 transition-colors"
                >
                  {editingId === transaction.id ? (
                    /* Edit Form */
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Edit Transaction</h3>
                        <span className="text-sm text-slate-500">{transaction.category}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Date</label>
                          <input
                            type="date"
                            data-cy="edit-date-input"
                            value={editForm.date || ''}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Amount</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.amount || ''}
                              onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                              className="w-full pl-8 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Merchant</label>
                          <input
                            type="text"
                            value={editForm.merchant || ''}
                            onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                            placeholder="Store or vendor name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                          <input
                            type="text"
                            value={editForm.paymentMethod || ''}
                            onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                            placeholder="Credit Card, Cash, etc."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                          <textarea
                            value={editForm.description || ''}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none resize-none"
                            rows={2}
                            placeholder="Additional details..."
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleSaveEdit}
                          className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {transaction.type === 'income' ? '💰' : '💸'} {transaction.type}
                          </span>
                          <span className="text-sm text-slate-500">{formatDate(transaction.date)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {transaction.category}
                          {transaction.subcategory && (
                            <span className="text-slate-500"> • {transaction.subcategory}</span>
                          )}
                        </h3>
                        {transaction.description && (
                          <p className="text-sm text-slate-600 mb-1">{transaction.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {transaction.merchant && <span>🏪 {transaction.merchant}</span>}
                          {transaction.paymentMethod && <span>💳 {transaction.paymentMethod}</span>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <p
                          className={`text-2xl font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceTransactions;
