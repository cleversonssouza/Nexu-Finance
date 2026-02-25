import { Transaction, Stats, User, ProfileType } from '../types';

const getHeaders = () => {
  const userId = localStorage.getItem('finflow_user_id') || '1';
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  };
};

export const api = {
  async login(username: string): Promise<User> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'password' })
    });
    const user = await res.json();
    localStorage.setItem('finflow_user_id', user.id.toString());
    return user;
  },

  async getProfile(): Promise<User> {
    const res = await fetch('/api/profile', { headers: getHeaders() });
    return res.json();
  },

  async updateProfile(profile_type: ProfileType): Promise<void> {
    await fetch('/api/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ profile_type })
    });
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions', { headers: getHeaders() });
    return res.json();
  },

  async addTransaction(transaction: Partial<Transaction>): Promise<Transaction> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transaction)
    });
    return res.json();
  },

  async deleteTransaction(id: number): Promise<void> {
    await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  async getStats(): Promise<Stats> {
    const res = await fetch('/api/stats', { headers: getHeaders() });
    return res.json();
  }
};
