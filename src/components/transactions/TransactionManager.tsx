import React, { useState, useEffect } from 'react';
import { Plus, Download, Upload, AlertCircle } from 'lucide-react';
import TransactionList from './TransactionList';
import TransactionSync from './TransactionSync';
import TransactionForm from './TransactionForm';
import { Transaction } from '../../types';
import { PaymentTransaction } from '../../services/paymentApis';
import { convertPaymentTransactionsToTransactions, mergeTransactions } from '../../utils/transactionConverter';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

interface TransactionManagerProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Transaction) => void;
  onUpdateTransaction: (id: string, transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const [showSync, setShowSync] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [syncError, setSyncError] = useState<string>('');

  const handleTransactionsSynced = (paymentTransactions: PaymentTransaction[]) => {
    try {
      const newTransactions = convertPaymentTransactionsToTransactions(paymentTransactions);
      const mergedTransactions = mergeTransactions(transactions, newTransactions);
      
      // Add new transactions to the app state
      newTransactions.forEach(transaction => {
        if (!transactions.find(t => t.id === transaction.id)) {
          onAddTransaction(transaction);
        }
      });
      
      // Show success message
      console.log(`Successfully synced ${newTransactions.length} new transactions`);
    } catch (error) {
      console.error('Error processing synced transactions:', error);
      setSyncError('Failed to process synced transactions');
    }
  };

  const handleSyncError = (error: string) => {
    setSyncError(error);
    // Auto-hide error after 5 seconds
    setTimeout(() => setSyncError(''), 5000);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormSubmit = (transaction: Transaction) => {
    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, transaction);
      setEditingTransaction(null);
    } else {
      onAddTransaction(transaction);
    }
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Category', 'Description', 'Amount', 'Type'],
      ...transactions.map(t => [
        t.date,
        t.category,
        t.description,
        t.amount.toString(),
        t.type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1F]">Transactions</h1>
          <p className="text-[#86868B]">
            Manage your income and expenses with automatic sync from payment apps
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSync(!showSync)}
            className="flex items-center space-x-2"
          >
            <Download size={16} />
            <span>{showSync ? 'Hide Sync' : 'Payment Sync'}</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={exportTransactions}
            className="flex items-center space-x-2"
          >
            <Upload size={16} />
            <span>Export CSV</span>
          </Button>
          
          <Link to="/transactions/new">
            <Button className="flex items-center space-x-2">
              <Plus size={16} />
              <span>Add Transaction</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment Sync Component */}
      {showSync && (
        <TransactionSync
          onTransactionsSynced={handleTransactionsSynced}
          onSyncError={handleSyncError}
        />
      )}

      {/* Error Display */}
      {syncError && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600" />
          <span className="text-red-600">{syncError}</span>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onDelete={onDeleteTransaction}
      />

      {/* Quick Stats */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-[#E5E5EA] p-4">
            <h3 className="text-sm font-medium text-[#86868B] mb-1">Total Transactions</h3>
            <p className="text-2xl font-bold text-[#1D1D1F]">{transactions.length}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E5E5EA] p-4">
            <h3 className="text-sm font-medium text-[#86868B] mb-1">Total Income</h3>
            <p className="text-2xl font-bold text-[#30D158]">
              ₹{transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-[#E5E5EA] p-4">
            <h3 className="text-sm font-medium text-[#86868B] mb-1">Total Expenses</h3>
            <p className="text-2xl font-bold text-[#FF453A]">
              ₹{transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
