import { Transaction } from '../types';
import { PaymentTransaction } from '../services/paymentApis';

export const convertPaymentTransactionToTransaction = (
  paymentTransaction: PaymentTransaction
): Transaction => {
  return {
    id: paymentTransaction.transactionId,
    amount: paymentTransaction.amount,
    date: paymentTransaction.date,
    category: paymentTransaction.category,
    description: paymentTransaction.description,
    type: paymentTransaction.type === 'credit' ? 'income' : 'expense',
  };
};

export const convertPaymentTransactionsToTransactions = (
  paymentTransactions: PaymentTransaction[]
): Transaction[] => {
  return paymentTransactions.map(convertPaymentTransactionToTransaction);
};

export const isDuplicateTransaction = (
  existingTransactions: Transaction[],
  newTransaction: Transaction
): boolean => {
  return existingTransactions.some(
    (existing) =>
      existing.id === newTransaction.id ||
      (existing.amount === newTransaction.amount &&
        existing.date === newTransaction.date &&
        existing.description === newTransaction.description)
  );
};

export const mergeTransactions = (
  existingTransactions: Transaction[],
  newTransactions: Transaction[]
): Transaction[] => {
  const merged = [...existingTransactions];
  
  newTransactions.forEach((newTransaction) => {
    if (!isDuplicateTransaction(existingTransactions, newTransaction)) {
      merged.push(newTransaction);
    }
  });
  
  // Sort by date (newest first)
  return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
