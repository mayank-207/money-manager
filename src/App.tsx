import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import { ExpenseManagerProvider } from './context/ExpenseManagerContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import NewTransaction from './pages/NewTransaction';
import EditTransaction from './pages/EditTransaction';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import ExpenseManager from './pages/ExpenseManager';

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <ExpenseManagerProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/new"
                element={
                  <ProtectedRoute>
                    <NewTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expense-manager"
                element={
                  <ProtectedRoute>
                    <ExpenseManager />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ExpenseManagerProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
