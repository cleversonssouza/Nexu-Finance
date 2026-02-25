import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';
import { ProfileSelector } from './components/ProfileSelector';
import { api } from './services/api';
import { aiService } from './services/ai';
import { User, Transaction, Stats, ProfileType } from './types';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Download, FileText, Table as TableIcon, Search, Filter, Trash2, Plus, Repeat } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    const init = async () => {
      // Auto-login for demo
      const loggedUser = await api.login('demo_user');
      setUser(loggedUser);
      loadData();
    };
    init();
  }, []);

  const loadData = async () => {
    const [s, t] = await Promise.all([api.getStats(), api.getTransactions()]);
    setStats(s);
    setTransactions(t);
  };

  const handleAddTransaction = async (data: Partial<Transaction>) => {
    await api.addTransaction(data);
    loadData();
    setAiInsight(null); // Reset insight to encourage regeneration
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      await api.deleteTransaction(id);
      loadData();
    }
  };

  const handleProfileChange = async (type: ProfileType) => {
    await api.updateProfile(type);
    const updatedUser = await api.getProfile();
    setUser(updatedUser);
    setActiveTab('dashboard');
  };

  const handleNavigate = (tab: string, filter?: 'all' | 'income' | 'expense') => {
    setActiveTab(tab);
    if (filter) {
      setFilterType(filter);
    }
  };

  const generateInsight = async () => {
    if (!stats || !user) return;
    setIsLoadingInsight(true);
    const insight = await aiService.getFinancialInsights(stats, transactions, user.profile_type);
    setAiInsight(insight);
    setIsLoadingInsight(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Relatório Financeiro - Nexu Finance', 20, 20);
    doc.setFontSize(12);
    doc.text(`Perfil: ${user?.profile_type}`, 20, 30);
    doc.text(`Saldo Atual: R$ ${(stats?.total_income || 0) - (stats?.total_expense || 0)}`, 20, 40);
    
    let y = 60;
    doc.text('Transações Recentes:', 20, y);
    y += 10;
    transactions.slice(0, 20).forEach(t => {
      doc.text(`${t.date} - ${t.description}: R$ ${t.amount} (${t.type})`, 20, y);
      y += 7;
    });
    
    doc.save('relatorio-nexu-finance.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");
    XLSX.writeFile(wb, "financas-nexu-finance.xlsx");
  };

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Carregando Nexu Finance...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      profileType={user.profile_type}
      onAddClick={() => setIsModalOpen(true)}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          stats={stats} 
          transactions={transactions} 
          profileType={user.profile_type}
          aiInsight={aiInsight}
          onGenerateInsight={generateInsight}
          isLoadingInsight={isLoadingInsight}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-3xl font-display font-bold">Transações</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-md shadow-primary/10 hover:scale-105 transition-transform"
              >
                <Plus size={18} /> Cadastrar
              </button>
              <button 
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <FileText size={18} /> PDF
              </button>
              <button 
                onClick={exportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <TableIcon size={18} /> Excel
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-3">
                <Search size={20} className="text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por descrição ou categoria..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full"
                />
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
                {(['all', 'income', 'expense'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      filterType === type 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' 
                        : 'text-slate-400'
                    }`}
                  >
                    {type === 'all' ? 'Todos' : type === 'income' ? 'Ganhos' : 'Gastos'}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="pb-4 px-4">Data</th>
                    <th className="pb-4 px-4">Descrição</th>
                    <th className="pb-4 px-4">Categoria</th>
                    <th className="pb-4 px-4 text-right">Valor</th>
                    <th className="pb-4 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {filteredTransactions.map((t) => (
                    <tr key={t.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-sm text-slate-500">{t.date}</td>
                      <td className="py-4 px-4 text-sm font-semibold">{t.description}</td>
                      <td className="py-4 px-4">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
                          {t.category}
                        </span>
                      </td>
                      <td className={`py-4 px-4 text-sm font-bold text-right ${
                        t.type === 'income' ? 'text-primary' : 'text-danger'
                      }`}>
                        {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteTransaction(t.id)}
                          className="p-2 text-slate-300 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                  Nenhuma transação encontrada para os filtros aplicados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-display font-bold">Contas Recorrentes</h2>
              <p className="text-slate-500">Gerencie suas assinaturas e parcelamentos.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              <Plus size={20} /> Cadastrar Nova
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transactions.filter(t => t.is_recurring).map((t) => (
              <div key={t.id} className="glass-card p-6 rounded-[2rem] relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
                  }`}>
                    <Repeat size={24} />
                  </div>
                  <button 
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="p-2 text-slate-300 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">{t.description}</h4>
                  <p className="text-xs text-slate-500 mb-4">{t.category} • {t.date}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Mensal</p>
                      <p className={`text-xl font-display font-bold ${
                        t.type === 'income' ? 'text-primary' : 'text-danger'
                      }`}>
                        R$ {t.amount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parcelas</p>
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t.installments}x</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-100 dark:bg-slate-800/50 rounded-full -z-10"></div>
              </div>
            ))}
            {transactions.filter(t => t.is_recurring).length === 0 && (
              <div className="col-span-full glass-card p-12 rounded-[2.5rem] text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Repeat size={32} />
                </div>
                <p className="text-slate-500">Você ainda não tem contas recorrentes cadastradas.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2 bg-primary text-white rounded-full font-medium text-sm"
                >
                  Adicionar Agora
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <ProfileSelector 
          currentProfile={user.profile_type} 
          onSelect={handleProfileChange} 
        />
      )}

      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-display font-bold">Ajustes</h2>
          <div className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Preferências do Sistema</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <p className="font-semibold">Backup Automático</p>
                  <p className="text-xs text-slate-500">Sincronizar dados na nuvem diariamente</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <div>
                  <p className="font-semibold">Notificações de Gastos</p>
                  <p className="text-xs text-slate-500">Alertar quando atingir 80% do orçamento</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <button className="w-full py-4 bg-danger/10 text-danger font-bold rounded-2xl hover:bg-danger/20 transition-colors">
                Limpar Todos os Dados
              </button>
            </div>
          </div>
        </div>
      )}

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransaction}
        profileType={user.profile_type}
      />
    </Layout>
  );
}
