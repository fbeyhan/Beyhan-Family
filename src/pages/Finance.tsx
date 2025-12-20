import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminAuth';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

interface OverviewStats {
  monthlyExpenses: number;
  monthlyIncome: number;
  netWorth: number;
  transactionCount: number;
}

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  onClick?: () => void;
  gradient: string;
}

const DashboardCard = ({ title, value, subtitle, onClick, gradient }: DashboardCardProps) => (
  <div
    onClick={onClick}
    className={`${gradient} p-6 rounded-2xl text-white shadow-lg ${
      onClick ? 'cursor-pointer hover:shadow-xl transition-all hover:scale-105' : ''
    }`}
  >
    <h3 className="text-lg font-semibold mb-2 opacity-90">{title}</h3>
    <p className="text-3xl font-bold mb-1">{value}</p>
    {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
  </div>
);

const Finance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Debug: log user email and admin email for troubleshooting
  if (user) {
    // @ts-ignore
    // eslint-disable-next-line no-console
    console.log('FinancePage user.email:', user.email, 'VITE_ADMIN_EMAIL:', import.meta.env.VITE_ADMIN_EMAIL);
  }
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OverviewStats>({
    monthlyExpenses: 0,
    monthlyIncome: 0,
    netWorth: 0,
    transactionCount: 0,
  });

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin(user.email)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch overview statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Query transactions for current month
        const transactionsRef = collection(db, 'transactions');
        const monthQuery = query(
          transactionsRef,
          where('date', '>=', Timestamp.fromDate(startOfMonth)),
          where('date', '<=', Timestamp.fromDate(endOfMonth))
        );
        const snapshot = await getDocs(monthQuery);

        let expenses = 0;
        let income = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === 'expense') {
            expenses += data.amount || 0;
          } else if (data.type === 'income') {
            income += data.amount || 0;
          }
        });

        // Query assets for net worth
        const assetsRef = collection(db, 'assets');
        const assetsSnapshot = await getDocs(assetsRef);
        let totalAssets = 0;

        assetsSnapshot.forEach((doc) => {
          const data = doc.data();
          totalAssets += data.balance || 0;
        });

        // Get total transaction count
        const allTransactionsSnapshot = await getDocs(transactionsRef);

        setStats({
          monthlyExpenses: expenses,
          monthlyIncome: income,
          netWorth: totalAssets,
          transactionCount: allTransactionsSnapshot.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin(user.email)) {
      fetchStats();
    }
  }, [user]);

  if (!user || !isAdmin(user.email)) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const netIncome = stats.monthlyIncome - stats.monthlyExpenses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-amber-600 hover:text-amber-700 mb-4 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-rose-600 bg-clip-text text-transparent">
            Personal Finance
          </h1>
          <p className="text-slate-600 mt-2" data-cy="finance-dashboard-subtitle">Track expenses, income, and assets</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard
            title="Monthly Expenses"
            value={loading ? '...' : formatCurrency(stats.monthlyExpenses)}
            subtitle={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            gradient="bg-gradient-to-br from-red-500 to-red-600"
          />
          <DashboardCard
            title="Monthly Income"
            value={loading ? '...' : formatCurrency(stats.monthlyIncome)}
            subtitle={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <DashboardCard
            title="Net Income"
            value={loading ? '...' : formatCurrency(netIncome)}
            subtitle={netIncome >= 0 ? 'Surplus this month' : 'Deficit this month'}
            gradient={
              netIncome >= 0
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-orange-500 to-orange-600'
            }
          />
          <DashboardCard
            title="Net Worth"
            value={loading ? '...' : formatCurrency(stats.netWorth)}
            subtitle="Total assets"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Add Transaction"
            value="💸"
            subtitle="Quick entry"
            onClick={() => navigate('/finance/add')}
            gradient="bg-gradient-to-br from-amber-500 to-orange-500"
          />
          <DashboardCard
            title="Transactions"
            value={loading ? '...' : stats.transactionCount.toString()}
            subtitle="View history"
            onClick={() => navigate('/finance/transactions')}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <DashboardCard
            title="Assets"
            value="📊"
            subtitle="Investments & accounts"
            onClick={() => navigate('/finance/assets')}
            gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          />
          <DashboardCard
            title="Reports"
            value="📈"
            subtitle="Analytics & insights"
            onClick={() => navigate('/finance/reports')}
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
          />
        </div>

        {/* Mobile Bottom Navigation Hint */}
        <div className="mt-8 p-4 bg-white rounded-xl shadow-sm md:hidden">
          <p className="text-sm text-slate-600 text-center">
            💡 Tip: Use the cards above to navigate to different sections
          </p>
        </div>
      </div>
    </div>
  );
};

export default Finance;
