import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TransactionProvider } from './context/TransactionContext';
import { ExpenseManagerProvider } from './context/ExpenseManagerContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import NewTransaction from './pages/NewTransaction';
import EditTransaction from './pages/EditTransaction';
import Analytics from './pages/Analytics';
import ExpenseManager from './pages/ExpenseManager';

function App() {
  return (
    <TransactionProvider>
      <ExpenseManagerProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/transactions/new" element={<NewTransaction />} />
            <Route path="/transactions/edit/:id" element={<EditTransaction />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/expense-manager" element={<ExpenseManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ExpenseManagerProvider>
    </TransactionProvider>
  );
}

export default App;