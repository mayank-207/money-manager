import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { Transaction, TransactionType } from '../../types';
import { getDefaultCategories } from '../../utils/helpers';

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  initialData?: Transaction;
  isEditing?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData,
  isEditing = false,
}) => {
  const navigate = useNavigate();
  const categories = getDefaultCategories();
  const categoryNames = Object.keys(categories);

  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    category: initialData?.category || categoryNames[0],
    description: initialData?.description || '',
    type: initialData?.type || 'expense',
  });

  const [errors, setErrors] = useState<{
    amount?: string;
    date?: string;
    category?: string;
    description?: string;
  }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setFormData((prev) => ({ ...prev, type }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: typeof errors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the form
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
    
    navigate('/transactions');
  };

  const handleCancel = () => {
    navigate('/transactions');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="mb-6">
        <div className="bg-[#F5F5F7] p-1 rounded-lg inline-flex">
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              formData.type === 'expense'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              formData.type === 'income'
                ? 'bg-white text-[#1D1D1F] shadow-sm'
                : 'text-[#86868B] hover:text-[#1D1D1F]'
            }`}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Amount
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#86868B]">
              $
            </span>
            <input
              type="number"
              step="0.01"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] ${
                errors.amount ? 'border-[#FF453A]' : 'border-[#E5E5EA]'
              }`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-[#FF453A]">{errors.amount}</p>}
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] ${
              errors.date ? 'border-[#FF453A]' : 'border-[#E5E5EA]'
            }`}
          />
          {errors.date && <p className="mt-1 text-sm text-[#FF453A]">{errors.date}</p>}
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] ${
              errors.category ? 'border-[#FF453A]' : 'border-[#E5E5EA]'
            }`}
          >
            {categoryNames.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-[#FF453A]">{errors.category}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-[#1D1D1F] mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A84FF] focus:border-[#0A84FF] ${
              errors.description ? 'border-[#FF453A]' : 'border-[#E5E5EA]'
            }`}
            placeholder="What was this transaction for?"
          />
          {errors.description && <p className="mt-1 text-sm text-[#FF453A]">{errors.description}</p>}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button type="submit" variant={formData.type === 'income' ? 'success' : 'primary'}>
          {isEditing ? 'Update' : 'Save'} {formData.type === 'income' ? 'Income' : 'Expense'}
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;