import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import { Participant, SharedExpenseType } from '../../types';
import Button from '../ui/Button';

interface ExpenseFormProps {
  groupMembers: Participant[];
  onSubmit: (expense: {
    paid_by: string;
    amount: number;
    category: string;
    description?: string;
    expense_date: string;
    type: SharedExpenseType;
  }, splits: { participant_id: string; amount: number; settled: boolean }[]) => void;
  onCancel?: () => void;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Other',
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ groupMembers, onSubmit, onCancel }) => {
  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<SharedExpenseType>('expense');
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [customSplits, setCustomSplits] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!paidBy) {
      newErrors.paidBy = 'Please select who paid';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (splitType === 'custom') {
      const totalSplit = Object.values(customSplits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(totalSplit - parseFloat(amount)) > 0.01) {
        newErrors.splits = 'Custom splits must equal the total amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const totalAmount = parseFloat(amount);
    let splits;

    if (splitType === 'equal') {
      const splitAmount = totalAmount / groupMembers.length;
      splits = groupMembers.map(member => ({
        participant_id: member.id,
        amount: parseFloat(splitAmount.toFixed(2)),
        settled: member.id === paidBy,
      }));
    } else {
      splits = groupMembers.map(member => ({
        participant_id: member.id,
        amount: parseFloat(customSplits[member.id] || '0'),
        settled: member.id === paidBy && parseFloat(customSplits[member.id] || '0') > 0,
      })).filter(split => split.amount > 0);
    }

    onSubmit(
      {
        paid_by: paidBy,
        amount: totalAmount,
        category,
        description: description.trim() || undefined,
        expense_date: expenseDate,
        type,
      },
      splits
    );

    setPaidBy('');
    setAmount('');
    setCategory('');
    setDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setType('expense');
    setSplitType('equal');
    setCustomSplits({});
    setErrors({});
  };

  const handleCustomSplitChange = (participantId: string, value: string) => {
    setCustomSplits(prev => ({
      ...prev,
      [participantId]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="expense"
              checked={type === 'expense'}
              onChange={(e) => setType(e.target.value as SharedExpenseType)}
              className="mr-2"
            />
            Expense
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="income"
              checked={type === 'income'}
              onChange={(e) => setType(e.target.value as SharedExpenseType)}
              className="mr-2"
            />
            Income
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paid By <span className="text-red-500">*</span>
        </label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.paidBy ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select who paid...</option>
          {groupMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        {errors.paidBy && <p className="mt-1 text-sm text-red-500">{errors.paidBy}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.amount ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0.00"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select category...</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What was this for?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Split Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="equal"
              checked={splitType === 'equal'}
              onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
              className="mr-2"
            />
            Split Equally
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="custom"
              checked={splitType === 'custom'}
              onChange={(e) => setSplitType(e.target.value as 'equal' | 'custom')}
              className="mr-2"
            />
            Custom Split
          </label>
        </div>
      </div>

      {splitType === 'custom' && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-gray-700 mb-2">Custom Splits</p>
          {groupMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-2">
              <span className="text-sm text-gray-700 flex-1">{member.name}</span>
              <input
                type="number"
                step="0.01"
                value={customSplits[member.id] || ''}
                onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          ))}
          {errors.splits && <p className="text-sm text-red-500">{errors.splits}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          <DollarSign size={18} />
          Add {type === 'expense' ? 'Expense' : 'Income'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default ExpenseForm;
