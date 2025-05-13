import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TransactionProvider } from './context/TransactionContext';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import NewTransaction from './pages/NewTransaction';
import EditTransaction from './pages/EditTransaction';
import Analytics from './pages/Analytics';

function App() {
  return (
    <TransactionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<NewTransaction />} />
          <Route path="/transactions/edit/:id" element={<EditTransaction />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TransactionProvider>
  );
}

export default App;