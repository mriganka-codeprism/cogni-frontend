import { useState, useEffect } from 'react';

interface UseRowsPerPageOptions {
  defaultRowsPerPage?: number;
  storageKey?: string;
}

export const useRowsPerPage = (options: UseRowsPerPageOptions = {}) => {
  const {
    defaultRowsPerPage = 10,
    storageKey = 'rowsPerPage'
  } = options;

  // Initialize state with value from sessionStorage or default
  const [rowsPerPage, setRowsPerPage] = useState<number>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? parseInt(saved, 10) : defaultRowsPerPage;
    } catch (error) {
      console.warn('Failed to read from sessionStorage:', error);
      return defaultRowsPerPage;
    }
  });

  // Update sessionStorage whenever rowsPerPage changes
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, rowsPerPage.toString());
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }, [rowsPerPage, storageKey]);

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setRowsPerPage(newValue);
  };

  return {
    rowsPerPage,
    setRowsPerPage,
    handleRowsPerPageChange
  };
};
