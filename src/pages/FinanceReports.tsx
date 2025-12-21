import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminAuth';
import { db } from '../config/firebase';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Transaction {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: Date;
  owner?: string;
}

const COLORS = [
  '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

const FinanceReports = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  // Get all years present in the transactions for year selection
  const allYears = Array.from(new Set(transactions.map(t => t.date.getFullYear()))).sort((a, b) => b - a);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return allYears.length > 0 ? allYears[0] : new Date().getFullYear();
  });

  // Keep selectedYear in sync with available years if transactions change
  useEffect(() => {
    if (allYears.length > 0 && !allYears.includes(selectedYear)) {
      setSelectedYear(allYears[0]);
    }
  }, [allYears, selectedYear]);

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
        const snapshot = await getDocs(transactionsRef);

        const txns: Transaction[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          txns.push({
            type: data.type,
            amount: data.amount,
            category: data.category,
            date: data.date.toDate(),
            owner: data.owner,
          });
        });

        setTransactions(txns);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions by selected month or year
  const filteredTransactions = viewMode === 'month'
    ? transactions.filter((t) => {
        const txnMonth = t.date.toISOString().slice(0, 7);
        return txnMonth === selectedMonth;
      })
    : transactions.filter((t) => {
        const txnYear = t.date.getFullYear();
        return txnYear === selectedYear;
      });

  // Calculate category breakdown
  const expensesByCategory = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Calculate monthly totals for the year
  const currentYear = viewMode === 'month' ? new Date(selectedMonth).getFullYear() : selectedYear;
  const monthlyData = [];
  for (let month = 0; month < 12; month++) {
    const monthStr = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
    const monthTxns = transactions.filter((t) => t.date.toISOString().slice(0, 7) === monthStr);
    
    const expenses = monthTxns.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const income = monthTxns.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    
    monthlyData.push({
      month: new Date(currentYear, month).toLocaleString('default', { month: 'short' }),
      expenses,
      income,
      net: income - expenses,
    });
  }

  // Top categories
  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate totals
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netIncome = totalIncome - totalExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Person'];
    const rows = filteredTransactions.map((t) => [
      t.date.toISOString().split('T')[0],
      t.type,
      t.category,
      t.amount.toString(),
      t.type === 'expense' ? (t.owner || '') : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${selectedMonth}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            data-cy="back-to-finance"
            onClick={() => navigate('/finance')}
            className="text-amber-600 hover:text-amber-700 mb-4 flex items-center gap-2"
          >
            ← Back to Finance
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
                <span data-cy="reports-title">Reports & Analytics</span>
              </h1>
              <p className="text-slate-600 mt-1">Financial insights and trends</p>
            </div>
            <div className="flex gap-3 items-center">
              <label className="font-semibold text-slate-700">View:</label>
              <select
                value={viewMode}
                onChange={e => setViewMode(e.target.value as 'month' | 'year')}
                className="px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
              >
                <option value="month">Monthly</option>
                <option value="year">Annually</option>
              </select>
              {viewMode === 'month' && (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                />
              )}
              {viewMode === 'year' && (
                <>
                  <span className="font-semibold text-slate-700">Year:</span>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-amber-500 outline-none"
                  >
                    {allYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </>
              )}
              <button
                data-cy="export-csv-btn"
                onClick={exportToCSV}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                📥 Export CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-slate-600">
            Loading reports...
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg" data-cy="summary-expenses">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Total Expenses</h3>
                <p className="text-3xl font-bold">{formatCurrency(totalExpenses)}</p>
                <p className="text-sm opacity-80 mt-1">{filteredTransactions.filter(t => t.type === 'expense').length} transactions</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg" data-cy="summary-income">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Total Income</h3>
                <p className="text-3xl font-bold">{formatCurrency(totalIncome)}</p>
                <p className="text-sm opacity-80 mt-1">{filteredTransactions.filter(t => t.type === 'income').length} transactions</p>
              </div>
              <div className={`bg-gradient-to-br ${netIncome >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} text-white p-6 rounded-2xl shadow-lg`} data-cy="summary-net-income">
                <h3 className="text-lg font-semibold mb-2 opacity-90">Net Income</h3>
                <p className="text-3xl font-bold">{formatCurrency(netIncome)}</p>
                <p className="text-sm opacity-80 mt-1">{netIncome >= 0 ? 'Surplus' : 'Deficit'}</p>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Expenses by Category Pie Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4" data-cy="expenses-by-category">Expenses by Category</h2>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-600 py-12">No expense data for selected month</p>
                )}
              </div>

              {/* Top 5 Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Top 5 Spending Categories</h2>
                {topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {topCategories.map(([category, amount], index) => (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-700">{category}</span>
                          <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full transition-all"
                            style={{
                              width: `${(amount / totalExpenses) * 100}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-600 py-12">No data available</p>
                )}
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Monthly Income vs Expenses ({currentYear})</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Net Income Trend */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Net Income Trend ({currentYear})</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Line type="monotone" dataKey="net" stroke="#8b5cf6" strokeWidth={3} name="Net Income" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FinanceReports;
