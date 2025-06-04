import React, { useState, useEffect } from 'react';
import { AccountType, FamilyAccount } from '../../types';
import { budgetApi, familyApi } from '../../api';
import { WalletIcon, PiggyBankIcon, ArrowRightIcon, AlertCircleIcon, Loader2Icon } from 'lucide-react';

const AccountsManager: React.FC = () => {
  const [transferAmount, setTransferAmount] = useState<number>(0);
  const [fromAccountType, setfromAccountType] = useState<AccountType>(AccountType.Main);
  const [toAccountType, settoAccountType] = useState<AccountType>(AccountType.Savings);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [familyId, setFamilyId] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<{
    [key in AccountType]: number | null;
  }>({
    [AccountType.Main]: 0,
    [AccountType.Savings]: 0,
    [AccountType.Investment]: 0
  });

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const familyId = (await familyApi.getCurrentFamily()).data.family.id;
        const accounts = await budgetApi.accounts.getFamilyAccounts(familyId);
        
        const updatedBalances = {
          [AccountType.Main]: 0,
          [AccountType.Savings]: 0,
          [AccountType.Investment]: 0
        };

        accounts.forEach(account => {
          switch (account.accountType) {
            case 0: // Текущий капитал
              updatedBalances[AccountType.Main] = account.balance;
              break;
            case 1: // Резервный
              updatedBalances[AccountType.Savings] = account.balance;
              break;
            case 2: // Накопления на инвестиции
              updatedBalances[AccountType.Investment] = account.balance;
              break;
          }
        });

        setAccountBalance(updatedBalances);
        setFamilyId(familyId);
      } catch (err) {
        console.error('Ошибка загрузки счетов:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const handleTransfer = async () => {
    if (transferAmount <= 0) {
      setError('Сумма перевода должна быть больше 0');
      return;
    }

    const sourceBalance = accountBalance[fromAccountType];
    if (sourceBalance === null || transferAmount > sourceBalance) {
      setError(`Недостаточно средств на счете ${fromAccountType === AccountType.Main ? 'Текущий капитал' : fromAccountType === AccountType.Savings ? 'Резервный капитал' : 'Инвестиционный'}`);
      return;
    }

    const toBalance = accountBalance[toAccountType];
    if (toBalance === null) {
      setError(`Счет ${toAccountType === AccountType.Main ? 'Текущий капитал' : toAccountType === AccountType.Savings ? 'Резервный капитал' : 'Инвестиционный'} не найден`);
      return;
    }
    
    await budgetApi.accounts.updateAccountBalance(familyId, fromAccountType, sourceBalance - transferAmount);
    await budgetApi.accounts.updateAccountBalance(familyId, toAccountType, toBalance + transferAmount);
    
    setError(null);
    location.reload();
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.Main:
        return <WalletIcon size={24} className="text-blue-500" />;
      case AccountType.Savings:
        return <PiggyBankIcon size={24} className="text-green-500" />;
      case AccountType.Investment:
        return <WalletIcon size={24} className="text-purple-500" />;
      default:
        return <WalletIcon size={24} className="text-gray-500" />;
    }
  };

  const getAccountColor = (type: AccountType) => {
    switch (type) {
      case AccountType.Main:
        return 'bg-blue-50 border-blue-200';
      case AccountType.Savings:
        return 'bg-green-50 border-green-200';
      case AccountType.Investment:
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAccountTextColor = (type: AccountType) => {
    switch (type) {
      case AccountType.Main:
        return 'text-blue-600';
      case AccountType.Savings:
        return 'text-green-600';
      case AccountType.Investment:
        return 'text-purple-600';
      default:
        return 'text-gray-500';
    }
  };

  const getAccountName = (type: AccountType) => {
    switch (type) {
      case AccountType.Main:
        return 'Текущий капитал';
      case AccountType.Savings:
        return 'Резервный капитал';
      case AccountType.Investment:
        return 'Инвестиционный';
      default:
        return 'Неизвестный счет';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className='animate-spin text-blue-500' size={32} />
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <WalletIcon size={24} className="text-blue-500 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Управление счетами</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(Object.keys(AccountType) as Array<keyof typeof AccountType>)
          .filter(key => isNaN(Number(key)))
          .map(type => {
            const accountType = AccountType[type] as AccountType;
            const balance = accountBalance[accountType] ?? 0;
            
            return (
              <div
                key={accountType}
                className={`p-6 rounded-lg border ${getAccountColor(accountType)} shadow-sm`}
              >
                <div className="flex flex-col space-y-2 justify-between">
                  <div className="flex items-center">
                    {getAccountIcon(accountType)}
                    <h3 className="ml-2 text-lg font-semibold text-gray-800">
                      {getAccountName(accountType)}
                    </h3>
                  </div>
                  <span className={`text-2xl font-bold ${getAccountTextColor(accountType)}`}>
                    {balance.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Перевод между счетами</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircleIcon size={20} className="text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Со счета
            </label>
            <select
              value={fromAccountType}
              onChange={(e) => setfromAccountType(e.target.value as AccountType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(AccountType)
                .filter(([key]) => isNaN(Number(key)))
                .map(([key, value]) => (
                  <option 
                    key={key} 
                    value={value}
                    disabled={value === toAccountType}
                  >
                    {getAccountName(value as AccountType)} ({accountBalance[value as AccountType]?.toLocaleString()} ₽)
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center justify-center">
            <ArrowRightIcon size={24} className="text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              На счет
            </label>
            <select
              value={toAccountType}
              onChange={(e) => settoAccountType(e.target.value as AccountType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.entries(AccountType)
                .filter(([key]) => isNaN(Number(key)))
                .map(([key, value]) => (
                  <option 
                    key={key} 
                    value={value}
                    disabled={value === fromAccountType}
                  >
                    {getAccountName(value as AccountType)} ({accountBalance[value as AccountType]?.toLocaleString()} ₽)
                  </option>
                ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Сумма перевода (₽)
            </label>
            <input
              type="number"
              value={transferAmount > 0 ? transferAmount : ''}
              onChange={(e) => setTransferAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              min='0'
              step="0.01"
            />
          </div>

          <div>
            <button
              onClick={handleTransfer}
              disabled={transferAmount <= 0}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              Выполнить перевод
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountsManager;