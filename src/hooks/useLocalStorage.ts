import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return initialValue;
      
      try {
        return JSON.parse(item) as T;
      } catch {
        // Fallback for raw string data (e.g. existing documentText string)
        return item as unknown as T;
      }
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [key, value]);

  return [value, setValue];
}
