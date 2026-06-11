import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import BottomNav from './components/BottomNav'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import SetupWizardPage from './pages/SetupWizardPage'
import SubscriptionPage from './pages/SubscriptionPage'
import AdminPage from './pages/AdminPage'
import WorkingHoursPage from './pages/WorkingHoursPage'
import DashboardPage from './pages/DashboardPage'
import ClientsPage from './pages/ClientsPage'
import ClientDetailPage from './pages/ClientDetailPage'
import CalendarPage from './pages/CalendarPage'
import POSPage from './pages/POSPage'
import InventoryPage from './pages/InventoryPage'
import ReportsPage from './pages/ReportsPage'
import NotesPage from './pages/NotesPage'
import SettingsPage from './pages/SettingsPage'
import ServicesPage from './pages/ServicesPage'
import StaffPage from './pages/StaffPage'
import ExpensesPage from './pages/ExpensesPage'
import CashUpPage from './pages/CashUpPage'
import EFTPage from './pages/EFTPage'

function Shell() {
  const { user, business, loading } = useApp()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--blush)', gap: 16 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, letterSpacing: '0.2em', color: 'var(--gold-dark)' }}>SELAH</div>
      <div style={{ width: 40, height: 40, border: '3px solid var(--blush-dark)', borderTop: '3px solid var(--gold-dark)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )

  if (user && business && !business.setupComplete) return (
    <Routes>
      <Route path="/setup" element={<SetupWizardPage />} />
      <Route path="*" element={<Navigate to="/setup" replace />} />
    </Routes>
  )
  return (
    <div className="app-shell">
      <div className="page-scroll">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/cashup" element={<CashUpPage />} />
          <Route path="/eft" element={<EFTPage />} />
          <Route path="/setup" element={<SetupWizardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/working-hours" element={<WorkingHoursPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter><Shell /></BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  )
}
