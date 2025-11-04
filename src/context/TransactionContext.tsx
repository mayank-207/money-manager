import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../types';
import { apolloClient } from '../lib/apollo/client';
import { GET_EXPENSES, CREATE_EXPENSE, UPDATE_EXPENSE, DELETE_EXPENSE, GET_PARTICIPANTS } from '../lib/graphql/operations';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  refetchTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: React.ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userParticipantId, setUserParticipantId] = useState<string | null>(null);
  const { user } = useAuth();

  // Get user's participant ID
  useEffect(() => {
    const getUserParticipant = async () => {
      if (user?.email) {
        try {
          const result = await apolloClient.query({
            query: GET_PARTICIPANTS,
            fetchPolicy: 'network-only',
          });

          const data = result.data as any;
          if (data?.participants) {
            const participant = data.participants.find((p: any) => p.email === user.email);
            if (participant) {
              setUserParticipantId(participant.id);
            }
          }
        } catch (error) {
          console.error('Error fetching user participant:', error);
        }
      }
    };

    getUserParticipant();
  }, [user]);

  // Fetch transactions from GraphQL
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const result = await apolloClient.query({
        query: GET_EXPENSES,
        fetchPolicy: 'network-only',
      });

      const data = result.data as any;
      if (data?.expenses) {
        // Transform GraphQL expense data to Transaction format
        const transformedTransactions: Transaction[] = data.expenses.map((expense: any) => ({
          id: expense.id,
          amount: expense.amount,
          date: expense.expenseDate,
          category: expense.category,
          description: expense.description || '',
          type: expense.type as TransactionType,
        }));
        setTransactions(transformedTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Keep empty array on error
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      // Use the user's participant ID or default to '1' if not found
      const participantId = userParticipantId || '1';
      
      const result = await apolloClient.mutate({
        mutation: CREATE_EXPENSE,
        variables: {
          input: {
            paidBy: participantId,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            expenseDate: transaction.date,
            type: transaction.type,
            splits: [
              {
                participantId: participantId,
                amount: transaction.amount,
              },
            ],
          },
        },
      });

      const data = result.data as any;
      if (data?.createExpense) {
        const newTransaction: Transaction = {
          id: data.createExpense.id,
          amount: data.createExpense.amount,
          date: data.createExpense.expenseDate,
          category: data.createExpense.category,
          description: data.createExpense.description || '',
          type: data.createExpense.type as TransactionType,
        };
        setTransactions((prev) => [...prev, newTransaction]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_EXPENSE,
        variables: { id },
      });

      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (updatedTransaction: Transaction) => {
    try {
      // Use the user's participant ID or default to '1' if not found
      const participantId = userParticipantId || '1';
      
      const result = await apolloClient.mutate({
        mutation: UPDATE_EXPENSE,
        variables: {
          id: updatedTransaction.id,
          input: {
            paidBy: participantId,
            amount: updatedTransaction.amount,
            category: updatedTransaction.category,
            description: updatedTransaction.description,
            expenseDate: updatedTransaction.date,
            type: updatedTransaction.type,
            splits: [
              {
                participantId: participantId,
                amount: updatedTransaction.amount,
              },
            ],
          },
        },
      });

      const data = result.data as any;
      if (data?.updateExpense) {
        const updated: Transaction = {
          id: data.updateExpense.id,
          amount: data.updateExpense.amount,
          date: data.updateExpense.expenseDate,
          category: data.updateExpense.category,
          description: data.updateExpense.description || '',
          type: data.updateExpense.type as TransactionType,
        };
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === updated.id ? updated : transaction
          )
        );
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const refetchTransactions = async () => {
    await fetchTransactions();
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        refetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
