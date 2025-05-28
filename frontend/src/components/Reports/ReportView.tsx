import React, { useState } from 'react';
import { useBudget } from '../../context/BudgetContext';
import { BarChartIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import { Income, Expense, DateRange } from '../../types';
import { formatDateToString } from '../../utils/dateUtils';
import FilterForm from '../shared/FilterForm';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Document, Paragraph, Packer, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';

const ReportView: React.FC = () => {
  const { getFilteredIncomes, getFilteredExpenses, getBudgetSummary, familyMembers } = useBudget();
  const [showFilter, setShowFilter] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  const handleToggleFilter = () => {
    setShowFilter(!showFilter);
  };
  
  const handleFilterApply = (range: DateRange | undefined) => {
    setDateRange(range);
    setShowFilter(false);
  };
  
  const incomes = getFilteredIncomes(dateRange);
  const expenses = getFilteredExpenses(dateRange);
  const summary = getBudgetSummary(dateRange);
  
  const getFamilyMemberName = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'Неизвестно';
  };
  
  const getFamilyMemberWithRelation = (id: string) => {
    const member = familyMembers.find(m => m.id === id);
    if (!member) return 'Неизвестно';
    return `${member.name} (${member.relationshipType})`;
  };

  // Экспорт в CSV (оставлен для совместимости)
  const handleExportToCSV = () => {
    let csvContent = 'Категория,Член семьи,Сумма,Дата\n';
    
    incomes.forEach(income => {
      csvContent += `Доход (${income.type}),${getFamilyMemberName(income.familyMemberId)},${income.amount},${formatDateToString(income.date)}\n`;
    });
    
    expenses.filter(expense => !expense.isPlanned).forEach(expense => {
      csvContent += `Расход (${expense.category}),${getFamilyMemberName(expense.familyMemberId)},${expense.amount},${formatDateToString(expense.date)}\n`;
    });
    
    csvContent += `\nОбщий доход,,${summary.totalIncome},\n`;
    csvContent += `Общие расходы,,${summary.totalExpenses},\n`;
    csvContent += `Баланс,,${summary.balance},\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'family_budget_report.csv');
  };

  // Экспорт в Excel (XLSX)
  const handleExportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Отчет");

  // Заголовки
  worksheet.addRow(["Категория", "Член семьи", "Сумма", "Дата"]);

  // Данные
  incomes.forEach(income => {
    worksheet.addRow([
      `Доход (${income.type})`,
      getFamilyMemberName(income.familyMemberId),
      income.amount,
      formatDateToString(income.date)
    ]);
  });

  expenses.forEach(expense => {
    worksheet.addRow([
      `Расход (${expense.category})`,
      getFamilyMemberName(expense.familyMemberId),
      expense.amount,
      formatDateToString(expense.date)
    ]);
  });

  // Сохранение
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "budget_report.xlsx");
};


  // Экспорт в Word (DOCX)
  const handleExportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Отчет по семейному бюджету',
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: dateRange 
                  ? `Период: ${formatDateToString(dateRange.startDate)} - ${formatDateToString(dateRange.endDate)}`
                  : 'Период: За все время',
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: 'Доходы', heading: 'Heading2', spacing: { after: 100 } }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Категория')], width: { size: 3000, type: WidthType.DXA } }),
                  new TableCell({ children: [new Paragraph('Член семьи')], width: { size: 3000, type: WidthType.DXA } }),
                  new TableCell({ children: [new Paragraph('Сумма')], width: { size: 2000, type: WidthType.DXA } }),
                  new TableCell({ children: [new Paragraph('Дата')], width: { size: 2000, type: WidthType.DXA } }),
                ],
              }),
              ...incomes.map(income => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Доход (${income.type})`)] }),
                  new TableCell({ children: [new Paragraph(getFamilyMemberWithRelation(income.familyMemberId))] }),
                  new TableCell({ children: [new Paragraph(income.amount.toString())] }),
                  new TableCell({ children: [new Paragraph(formatDateToString(income.date))] }),
                ],
              })),
              ...(incomes.length === 0 ? [new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Нет данных')], columnSpan: 4 }),
                ],
              })] : []),
            ],
          }),
          new Paragraph({ text: 'Расходы', heading: 'Heading2', spacing: { before: 400, after: 100 } }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Категория')] }),
                  new TableCell({ children: [new Paragraph('Член семьи')] }),
                  new TableCell({ children: [new Paragraph('Сумма')] }),
                  new TableCell({ children: [new Paragraph('Дата')] }),
                ],
              }),
              ...expenses
                .filter(expense => !expense.isPlanned)
                .map(expense => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(`Расход (${expense.category})`)] }),
                    new TableCell({ children: [new Paragraph(getFamilyMemberWithRelation(expense.familyMemberId))] }),
                    new TableCell({ children: [new Paragraph(expense.amount.toString())] }),
                    new TableCell({ children: [new Paragraph(formatDateToString(expense.date))] }),
                  ],
                })),
              ...(expenses.filter(expense => !expense.isPlanned).length === 0 ? [new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Нет данных')], columnSpan: 4 }),
                ],
              })] : []),
            ],
          }),
          new Paragraph({ text: 'Итоги', heading: 'Heading2', spacing: { before: 400, after: 100 } }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Общий доход')], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph(summary.totalIncome.toString())], columnSpan: 2 }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Общие расходы')], columnSpan: 2 }),
                  new TableCell({ children: [new Paragraph(summary.totalExpenses.toString())], columnSpan: 2 }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Баланс')], columnSpan: 2 }),
                  new TableCell({ 
                    children: [new Paragraph({
                      children: [new TextRun({
                        text: summary.balance.toString(),
                        color: summary.balance >= 0 ? '00FF00' : 'FF0000',
                      })],
                    })],
                    columnSpan: 2,
                  }),
                ],
              }),
            ],
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, 'family_budget_report.docx');
  };

  const dateRangeDisplay = dateRange 
    ? `${formatDateToString(dateRange.startDate)} - ${formatDateToString(dateRange.endDate)}`
    : 'За все время';
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <BarChartIcon size={24} className="text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Отчет по бюджету</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleToggleFilter}
            className={`flex items-center px-3 py-2 ${showFilter ? 'bg-blue-600' : 'bg-gray-200 text-gray-700'} rounded-md hover:bg-opacity-90 transition-colors ${showFilter ? 'text-white' : ''}`}
          >
            <FilterIcon size={16} className="mr-1" />
            Фильтр
          </button>
          <div className="relative group">
            <button className="flex items-center px-3 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">
              <DownloadIcon size={16} className="mr-1" />
              Экспорт
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
              <button 
                onClick={handleExportToCSV}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                CSV
              </button>
              <button 
                onClick={handleExportToExcel}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Excel (XLSX)
              </button>
              <button 
                onClick={handleExportToWord}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Word (DOCX)
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showFilter && (
        <FilterForm 
          onApply={handleFilterApply} 
          onCancel={() => setShowFilter(false)} 
          initialDateRange={dateRange}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Отчет по семейному бюджету: {dateRangeDisplay}
          </h2>
        </div>
        
        <div className="p-6">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Член семьи
                </th>
                <th className="py-2 px-4 border-b border-r text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Заголовок доходов */}
              <tr className="bg-gray-100">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Доходы
                </td>
              </tr>
              
              {/* Строки доходов */}
              {incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 border-b text-center text-gray-500">
                    Нет записей о доходах за выбранный период.
                  </td>
                </tr>
              ) : (
                incomes.map(income => (
                  <tr key={income.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b border-r text-gray-800 font-medium capitalize">
                      {income.type}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-gray-800">
                      {getFamilyMemberWithRelation(income.familyMemberId)}
                    </td>
                    <td className="py-2 px-4 border-b border-r text-green-600 font-medium">
                      {income.amount.toLocaleString()} ₽
                    </td>
                    <td className="py-2 px-4 border-b text-gray-600">
                      {formatDateToString(income.date)}
                    </td>
                  </tr>
                ))
              )}
              
              {/* Заголовок расходов */}
              <tr className="bg-gray-100">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Расходы
                </td>
              </tr>
              
              {/* Строки расходов */}
              {expenses.filter(expense => !expense.isPlanned).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 border-b text-center text-gray-500">
                    Нет записей о расходах за выбранный период.
                  </td>
                </tr>
              ) : (
                expenses
                  .filter(expense => !expense.isPlanned)
                  .map(expense => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border-b border-r text-gray-800 font-medium capitalize">
                        {expense.category}
                      </td>
                      <td className="py-2 px-4 border-b border-r text-gray-800">
                        {getFamilyMemberWithRelation(expense.familyMemberId)}
                      </td>
                      <td className="py-2 px-4 border-b border-r text-red-600 font-medium">
                        {expense.amount.toLocaleString()} ₽
                      </td>
                      <td className="py-2 px-4 border-b text-gray-600">
                        {formatDateToString(expense.date)}
                      </td>
                    </tr>
                  ))
              )}
              
              {/* Итоговая секция */}
              <tr className="bg-gray-200">
                <td colSpan={4} className="py-2 px-4 border-b font-semibold text-gray-700">
                  Итоги
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Общий доход
                </td>
                <td colSpan={2} className="py-2 px-4 border-b text-green-600 font-bold">
                  {summary.totalIncome.toLocaleString()} ₽
                </td>
              </tr>
              <tr className="bg-blue-50">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Общие расходы
                </td>
                <td colSpan={2} className="py-2 px-4 border-b text-red-600 font-bold">
                  {summary.totalExpenses.toLocaleString()} ₽
                </td>
              </tr>
              <tr className="bg-blue-100">
                <td colSpan={2} className="py-2 px-4 border-b border-r font-semibold text-gray-800">
                  Баланс
                </td>
                <td colSpan={2} className={`py-2 px-4 border-b font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.balance.toLocaleString()} ₽
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportView;