import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { Transaction, ProfileType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Partial<Transaction>) => void;
  profileType: ProfileType;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  profileType
}) => {
  const [type, setType] = React.useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = React.useState(false);
  const [installments, setInstallments] = React.useState('1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      profile_context: profileType,
      is_recurring: isRecurring,
      installments: isRecurring ? parseInt(installments) : 1
    });
    // Reset
    setAmount('');
    setDescription('');
    setCategory('');
    setIsRecurring(false);
    setInstallments('1');
    onClose();
  };

  const categories = type === 'income' 
    ? ['Salário', 'Freelance', 'Investimento', 'Venda', 'Outros']
    : ['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Moradia', 'Outros'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-display font-bold">Nova Transação</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Type Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                type === 'expense' ? 'bg-white dark:bg-slate-700 text-danger shadow-sm' : 'text-slate-500'
              }`}
            >
              <Minus size={16} /> Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                type === 'income' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              <Plus size={16} /> Receita
            </button>
          </div>

          {/* Amount Input */}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Valor</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-display font-bold text-slate-400">R$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                className="text-5xl font-display font-bold bg-transparent border-none focus:ring-0 w-full text-center placeholder:text-slate-200 dark:placeholder:text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Descrição</label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Supermercado, Salário..."
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Categoria</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecionar</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <input 
                type="checkbox" 
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isRecurring" className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex-1">
                Conta Recorrente?
              </label>
              {isRecurring && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Vezes:</span>
                  <input 
                    type="number" 
                    min="1"
                    max="60"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-16 bg-white dark:bg-slate-700 border-none rounded-lg px-2 py-1 text-sm text-center focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all active:scale-95 ${
              type === 'income' ? 'bg-primary shadow-primary/20' : 'bg-danger shadow-danger/20'
            }`}
          >
            Confirmar Transação
          </button>
        </form>
      </div>
    </div>
  );
};
