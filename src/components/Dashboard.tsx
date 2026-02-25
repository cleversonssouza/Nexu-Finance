import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Stats, Transaction, ProfileType } from '../types';
import Markdown from 'react-markdown';

interface DashboardProps {
  stats: Stats;
  transactions: Transaction[];
  profileType: ProfileType;
  aiInsight: string | null;
  onGenerateInsight: () => void;
  isLoadingInsight: boolean;
  onNavigate: (tab: string, filter?: 'all' | 'income' | 'expense') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  transactions, 
  profileType,
  aiInsight,
  onGenerateInsight,
  isLoadingInsight,
  onNavigate
}) => {
  const balance = stats.total_income - stats.total_expense;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProfileSpecificContent = () => {
    switch(profileType) {
      case 'assalariado':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Metas de Economia</h3>
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Reserva de Emergência</span>
                    <span className="text-sm text-slate-500">75%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-3/4"></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Viagem de Férias</span>
                    <span className="text-sm text-slate-500">30%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[30%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Contas Recorrentes</h3>
              <div className="space-y-3">
                {['Aluguel', 'Internet', 'Netflix', 'Academia'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                        <Calendar size={16} className="text-slate-500" />
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">Vence em 5 dias</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'autonomo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Recebimentos por Cliente</h3>
              <div className="space-y-4">
                {[
                  { name: 'Empresa Alpha', amount: 4500, status: 'Pago' },
                  { name: 'Tech Solutions', amount: 2800, status: 'Pendente' },
                  { name: 'Design Studio', amount: 1200, status: 'Atrasado' }
                ].map((client, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div>
                      <p className="text-sm font-semibold">{client.name}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(client.amount)}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      client.status === 'Pago' ? 'bg-primary/10 text-primary' : 
                      client.status === 'Pendente' ? 'bg-secondary/10 text-secondary' : 
                      'bg-danger/10 text-danger'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Provisão de Impostos</h3>
              <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Total estimado para DAS/MEI:</p>
                <p className="text-2xl font-bold text-secondary">{formatCurrency(stats.total_income * 0.06)}</p>
                <p className="text-xs text-slate-500 mt-2">* Baseado em 6% de faturamento médio</p>
              </div>
            </div>
          </div>
        );
      case 'empresario':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Folha de Pagamento</h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-4">
                <div>
                  <p className="text-sm text-slate-500">Próximo Pagamento</p>
                  <p className="text-xl font-bold">05/03/2026</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total Estimado</p>
                  <p className="text-xl font-bold text-danger">R$ 12.450,00</p>
                </div>
              </div>
              <button className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-medium text-sm">
                Gerenciar Funcionários
              </button>
            </div>
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="text-lg font-display font-semibold mb-4">Despesas Operacionais</h3>
              <div className="space-y-3">
                {[
                  { label: 'Aluguel Comercial', value: 3500 },
                  { label: 'Energia/Água', value: 850 },
                  { label: 'Software/SaaS', value: 420 },
                  { label: 'Marketing', value: 1200 }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold">Olá, João</h2>
          <p className="text-slate-500">Aqui está o resumo das suas finanças hoje.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm">
          <Calendar size={16} />
          <span>Fevereiro, 2026</span>
        </div>
      </div>

      {/* Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => onNavigate('transactions', 'all')}
          className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden text-left hover:scale-[1.02] transition-transform"
        >
          <div className="relative z-10">
            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mb-1">Saldo Total</p>
            <h3 className={`text-4xl font-display font-bold mb-6 ${
              balance >= 0 
                ? 'text-emerald-400 dark:text-emerald-600' 
                : 'text-rose-400 dark:text-rose-600'
            }`}>
              {formatCurrency(balance)}
            </h3>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/10 dark:bg-slate-900/10 w-fit px-3 py-1 rounded-full">
              <TrendingUp size={12} />
              Ver Relatório
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
        </button>

        <button 
          onClick={() => onNavigate('transactions', 'income')}
          className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between text-left hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">ENTRADAS</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Recebido</p>
            <h3 className="text-3xl font-display font-bold">{formatCurrency(stats.total_income)}</h3>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('transactions', 'expense')}
          className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between text-left hover:scale-[1.02] transition-transform"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center text-danger">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-1 rounded-lg">SAÍDAS</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Gasto</p>
            <h3 className="text-3xl font-display font-bold">{formatCurrency(stats.total_expense)}</h3>
          </div>
        </button>

        <button 
          onClick={() => onNavigate('recurring')}
          className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between text-left hover:scale-[1.02] transition-transform bg-gradient-to-br from-secondary/5 to-transparent"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <Calendar size={24} />
            </div>
            <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">RECORRENTES</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Contas Ativas</p>
            <h3 className="text-3xl font-display font-bold">
              {transactions.filter(t => t.is_recurring).length}
            </h3>
          </div>
        </button>
      </div>

      {/* Chart & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-bold">Fluxo Mensal</h3>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 focus:ring-primary">
              <option>Últimos 6 meses</option>
              <option>Último ano</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Sparkles size={20} />
            <h3 className="text-xl font-display font-bold">Insights de IA</h3>
          </div>
          
          {aiInsight ? (
            <div className="prose prose-sm dark:prose-invert max-h-[300px] overflow-y-auto no-scrollbar">
              <Markdown>{aiInsight}</Markdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center space-y-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm">
                <Sparkles size={32} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 px-4">
                Clique abaixo para gerar uma análise inteligente das suas finanças.
              </p>
              <button 
                onClick={onGenerateInsight}
                disabled={isLoadingInsight}
                className="px-6 py-2 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isLoadingInsight ? 'Analisando...' : 'Gerar Insights'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Specific Content */}
      {getProfileSpecificContent()}

      {/* Recent Transactions */}
      <div className="glass-card p-8 rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-display font-bold">Transações Recentes</h3>
          <button 
            onClick={() => onNavigate('transactions', 'all')}
            className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline"
          >
            Ver todas <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {transactions.length > 0 ? transactions.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
                }`}>
                  {t.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <p className="font-bold">{t.description}</p>
                  <p className="text-xs text-slate-500">{t.category} • {t.date}</p>
                </div>
              </div>
              <span className={`font-display font-bold text-lg ${
                t.type === 'income' ? 'text-primary' : 'text-danger'
              }`}>
                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
              </span>
            </div>
          )) : (
            <div className="text-center py-10 text-slate-400">
              Nenhuma transação encontrada.
            </div>
          )}
        </div>
      </div>

      {/* Alert Section */}
      {balance < 0 && (
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 bg-danger rounded-xl flex items-center justify-center text-white shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-danger">Alerta de Gastos</h4>
            <p className="text-sm text-danger/80">
              Suas despesas superaram suas receitas este mês em {formatCurrency(Math.abs(balance))}. 
              Considere revisar seus gastos variáveis.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
