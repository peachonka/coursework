// Utility functions for date handling
export interface DateRange {
  startDate: Date;
  endDate: Date;
}
// Format a date to YYYY-MM-DD
export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Format a date to DD.MM.YYYY
export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

// Format a date for display in the UI
export const formatDateToString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDateToDDMMYYYY(dateObj);
};

// Get the first day of the current month
export const getFirstDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Get the last day of the current month
export const getLastDayOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
};

// Get the first day of the current year
export const getFirstDayOfYear = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
};

// Get the last day of the current year
export const getLastDayOfYear = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31, 23, 59, 59);
};

// Create a date range for a specific period
export const createDateRange = (startDate: Date, endDate: Date) => {
  return { startDate, endDate };
};

// Parse a date string in DD.MM.YYYY format
export const parseDateString = (dateString: string): Date => {
  const [day, month, year] = dateString.split('.').map(Number);
  return new Date(year, month - 1, day);
};