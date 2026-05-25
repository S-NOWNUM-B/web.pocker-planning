import { useEffect, useState } from 'react'; // Импортируем необходимые хуки из React: useState для управления состоянием текущей темы и useEffect для применения темы к документу и сохранения ее в localStorage при изменении.
import { THEME_STORAGE_KEY, type Theme } from '../poker'; // Импортируем константу THEME_STORAGE_KEY, которая используется для хранения ключа в localStorage, и тип Theme, который определяет допустимые значения темы (light или dark).

// readInitialTheme — это функция, которая определяет начальную тему при загрузке приложения. Она сначала проверяет, доступен ли объект window (для SSR), затем пытается получить сохраненную тему из localStorage. Если сохраненная тема существует и является допустимым значением, она возвращается. Если сохраненной темы нет, функция использует media query для определения предпочтительной цветовой схемы пользователя и возвращает 'dark' или 'light' в зависимости от результата.
function readInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light' as Theme;
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// useTheme — это пользовательский хук, который управляет темой интерфейса (светлая или темная). Он использует useState для хранения текущей темы и useEffect для применения темы к документу и сохранения ее в localStorage при изменении. Хук также предоставляет функцию toggleTheme для переключения между темами и флаг isDark для удобства использования в компонентах.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
