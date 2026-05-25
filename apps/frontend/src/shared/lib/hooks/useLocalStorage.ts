import { useState, useCallback } from 'react'; // Импортируем необходимые хуки из React: useState для управления состоянием и useCallback для мемоизации функции обновления значения в localStorage.

// useLocalStorage — это пользовательский хук, который позволяет легко сохранять и получать данные из localStorage с автоматической сериализацией и десериализацией. Он принимает ключ для хранения данных и начальное значение, которое будет использоваться, если в localStorage нет данных по этому ключу.
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // setValue — это функция, которая обновляет значение в состоянии и сохраняет его в localStorage. Она принимает новое значение или функцию, которая получает текущее значение и возвращает новое. Функция обернута в useCallback для оптимизации производительности, чтобы она не пересоздавалась при каждом рендере, если ключ и текущее значение не изменились.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}
