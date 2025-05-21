import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { DateRange, getFirstDayOfMonth, getLastDayOfMonth, getFirstDayOfYear, getLastDayOfYear, formatDateToYYYYMMDD } from '../../utils/dateUtils';

interface FilterFormProps {
  onApply: (dateRange: DateRange | undefined) => void;
  onCancel: () => void;
  initialDateRange?: DateRange;
}

const FilterForm: React.FC<FilterFormProps> = ({ onApply, onCancel, initialDateRange }) => {
  const [filterType, setFilterType] = useState<'custom' | 'month' | 'year' | 'all'>(
    initialDateRange ? 'custom' : 'month'
  );
  
  const [startDate, setStartDate] = useState<string>(
    initialDateRange 
      ? formatDateToYYYYMMDD(initialDateRange.startDate)
      : formatDateToYYYYMMDD(getFirstDayOfMonth())
  );
  
  const [endDate, setEndDate] = useState<string>(
    initialDateRange
      ? formatDateToYYYYMMDD(initialDateRange.endDate)
      : formatDateToYYYYMMDD(getLastDayOfMonth())
  );
  
  const handleApply = () => {
    let range: DateRange | undefined;
    
    switch (filterType) {
      case 'custom':
        range = {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        };
        break;
      case 'month':
        range = {
          startDate: getFirstDayOfMonth(),
          endDate: getLastDayOfMonth()
        };
        break;
      case 'year':
        range = {
          startDate: getFirstDayOfYear(),
          endDate: getLastDayOfYear()
        };
        break;
      case 'all':
        range = undefined;
        break;
    }
    
    onApply(range);
  };
  
  const handleFilterTypeChange = (type: 'custom' | 'month' | 'year' | 'all') => {
    setFilterType(type);
    
    switch (type) {
      case 'month':
        setStartDate(formatDateToYYYYMMDD(getFirstDayOfMonth()));
        setEndDate(formatDateToYYYYMMDD(getLastDayOfMonth()));
        break;
      case 'year':
        setStartDate(formatDateToYYYYMMDD(getFirstDayOfYear()));
        setEndDate(formatDateToYYYYMMDD(getLastDayOfYear()));
        break;
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Filter Options</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <XIcon size={20} />
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleFilterTypeChange('month')}
            className={`px-3 py-2 rounded-md ${
              filterType === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('year')}
            className={`px-3 py-2 rounded-md ${
              filterType === 'year'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Year
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('custom')}
            className={`px-3 py-2 rounded-md ${
              filterType === 'custom'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
          <button
            type="button"
            onClick={() => handleFilterTypeChange('all')}
            className={`px-3 py-2 rounded-md ${
              filterType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
        
        {filterType === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterForm;