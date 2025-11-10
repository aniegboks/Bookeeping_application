'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { SupplierBalance } from '@/lib/types/suppliers';

// Use the proxy route like your other API calls
const getSupplierBalances = async (): Promise<SupplierBalance[]> => {
  const response = await fetch('/api/proxy/suppliers/balances', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch balances: ${response.status}`);
  }

  return response.json();
};

export default function SupplierBalances() {
  const [balances, setBalances] = useState<SupplierBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSupplierBalances();
      setBalances(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load supplier balances';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getSupplierBalances();
      setBalances(data);
      toast.success('Balances refreshed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh balances';
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Math.abs(amount));
  };

  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalCredit = balances.filter(b => b.balance > 0).reduce((sum, b) => sum + b.balance, 0);
  const totalDebit = balances.filter(b => b.balance < 0).reduce((sum, b) => sum + Math.abs(b.balance), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-700"></div>
          <span className="ml-3 text-slate-600">Loading balances...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <button
            onClick={fetchBalances}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Balance</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance >= 0 ? '+' : '-'}{formatCurrency(totalBalance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Credit</p>
              <p className="text-2xl font-bold text-green-600">+{formatCurrency(totalCredit)}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Debit</p>
              <p className="text-2xl font-bold text-red-600">-{formatCurrency(totalDebit)}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Balances Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Supplier Balances</h3>
            <p className="text-sm text-slate-600 mt-1">Credit minus debit for each supplier</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Supplier Name
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                  Balance
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {balances.map((balance) => (
                <tr key={balance.supplier_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{balance.supplier_name}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${balance.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance.balance >= 0 ? '+' : '-'}{formatCurrency(balance.balance)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {balance.balance > 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <TrendingUp className="h-3 w-3" />
                        Credit
                      </span>
                    ) : balance.balance < 0 ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                        <TrendingDown className="h-3 w-3" />
                        Debit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-medium">
                        Balanced
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {balances.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No balance data available</p>
            <p className="text-slate-500 text-sm mt-1">Balances will appear here once transactions are recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}