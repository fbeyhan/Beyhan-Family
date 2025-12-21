import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminAuth';
import { db } from '../config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Helper function to get today's date in Eastern US timezone
const getTodayInEastern = (): string => {
  const now = new Date();
  // Convert to Eastern timezone (America/New_York)
  const easternDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const year = easternDate.getFullYear();
  const month = String(easternDate.getMonth() + 1).padStart(2, '0');
  const day = String(easternDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Predefined categories
const EXPENSE_CATEGORIES = [
  { name: 'Housing', icon: '🏠', subcategories: ['Rent', 'Mortgage', 'Property Tax', 'HOA Fees', 'Maintenance'] },
  { name: 'Utilities', icon: '⚡', subcategories: ['Electric', 'Gas', 'Water', 'Internet', 'Phone'] },
  { name: 'Food', icon: '🍔', subcategories: ['Groceries', 'Restaurants', 'Coffee', 'Delivery'] },
  { name: 'Transportation', icon: '🚗', subcategories: ['Gas', 'Car Payment', 'Insurance', 'Maintenance', 'Parking', 'Public Transit'] },
  { name: 'Healthcare', icon: '⚕️', subcategories: ['Insurance', 'Doctor', 'Pharmacy', 'Dental', 'Vision'] },
  { name: 'Entertainment', icon: '🎬', subcategories: ['Streaming', 'Movies', 'Concerts', 'Hobbies', 'Sports'] },
  { name: 'Shopping', icon: '🛍️', subcategories: ['Clothing', 'Electronics', 'Home Goods', 'Gifts'] },
  { name: 'Personal Care', icon: '💇', subcategories: ['Haircut', 'Gym', 'Beauty', 'Spa'] },
  { name: 'Education', icon: '📚', subcategories: ['Tuition', 'Books', 'Courses', 'Supplies'] },
  { name: 'Travel', icon: '✈️', subcategories: ['Flights', 'Hotels', 'Vacation', 'Car Rental'] },
  { name: 'Insurance', icon: '🛡️', subcategories: ['Life', 'Health', 'Auto', 'Home'] },
  { name: 'Debt', icon: '💳', subcategories: ['Credit Card', 'Student Loan', 'Personal Loan'] },
  { name: 'Savings', icon: '🐷', subcategories: ['Emergency Fund', 'Retirement', 'Investment'] },
  { name: 'Other', icon: '📌', subcategories: [] },
];

const INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💼', subcategories: ['Regular Paycheck', 'Bonus', 'Commission'] },
  { name: 'Investment', icon: '📈', subcategories: ['Dividends', 'Interest', 'Capital Gains', 'Rental Income'] },
  { name: 'Business', icon: '🏢', subcategories: ['Self-Employment', 'Freelance', 'Side Hustle'] },
  { name: 'Other Income', icon: '💰', subcategories: ['Gift', 'Refund', 'Tax Return', 'Other'] },
];

const FinanceAdd = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayInEastern());
  const [merchant, setMerchant] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if not admin
  if (!user || !isAdmin(user.email)) {
    navigate('/dashboard');
    return null;
  }

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((c) => c.name === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category) {
      alert('Please fill in required fields (Amount and Category)');
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, 'transactions'), {
        type,
        amount: parseFloat(amount),
        category,
        subcategory: subcategory || null,
        description: description || null,
        date: Timestamp.fromDate(new Date(date)),
        merchant: merchant || null,
        paymentMethod: paymentMethod || null,
        createdBy: user.email,
        createdAt: Timestamp.now(),
      });

      // Show success and reset form
      setShowSuccess(true);
      setAmount('');
      setCategory('');
      setSubcategory('');
      setDescription('');
      setMerchant('');
      setPaymentMethod('');
      setDate(getTodayInEastern());

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-md w-full mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            data-cy="back-to-finance"
            onClick={() => navigate('/finance')}
            className="text-amber-600 hover:text-amber-700 mb-4 flex items-center gap-2 text-base sm:text-lg"
          >
            ← Back to Finance
          </button>
          <h1 data-cy="add-transaction-title" className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent text-center">
            Add Transaction
          </h1>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl animate-pulse text-center text-base sm:text-lg">
            ✓ Transaction added successfully!
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button
                data-cy="type-expense"
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory('');
                  setSubcategory('');
                }}
                className={`h-12 sm:h-14 rounded-xl font-semibold transition-all text-base sm:text-lg ${
                  type === 'expense'
                    ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💸 Expense
              </button>
              <button
                data-cy="type-income"
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory('');
                  setSubcategory('');
                }}
                className={`h-12 sm:h-14 rounded-xl font-semibold transition-all text-base sm:text-lg ${
                  type === 'income'
                    ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                💰 Income
              </button>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Amount *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                placeholder="0.00"
                required
                inputMode="decimal"
              />
            </div>
          </div>

          {/* Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory('');
              }}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              required
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              >
                <option value="">Select subcategory (optional)</option>
                {selectedCategory.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Merchant (for expenses) */}
          {type === 'expense' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Merchant</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
                placeholder="Store or vendor name"
              />
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            >
              <option value="">Select payment method (optional)</option>
              <option value="Credit Card">💳 Credit Card</option>
              <option value="Debit Card">💳 Debit Card</option>
              <option value="Cash">💵 Cash</option>
              <option value="Check">📝 Check</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="Digital Wallet">📱 Digital Wallet</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description / Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
              rows={3}
              placeholder="Additional details..."
            />
          </div>

          {/* Submit Button */}
          <button
            data-cy="save-transaction"
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {saving ? 'Saving...' : '💾 Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FinanceAdd;
