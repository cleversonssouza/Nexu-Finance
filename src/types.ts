export type ProfileType = 'assalariado' | 'autonomo' | 'empresario';

export interface User {
  id: number;
  username: string;
  profile_type: ProfileType;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  profile_context: ProfileType;
  is_recurring?: boolean;
  installments?: number;
}

export interface Stats {
  total_income: number;
  total_expense: number;
  monthlyData: {
    month: string;
    income: number;
    expense: number;
  }[];
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}
