const TOKEN_KEY = 'access_token'; // Константа TOKEN_KEY используется в качестве ключа для хранения токена доступа в localStorage. Это позволяет сохранять состояние авторизации пользователя между сессиями браузера, обеспечивая более плавный пользовательский опыт при повторном посещении сайта.
const SESSION_CHANGE_EVENT = 'poker-planning:session-change'; // Константа SESSION_CHANGE_EVENT определяет имя пользовательского события, которое будет использоваться для уведомления компонентов UI об изменениях в сессии пользователя. Это позволяет компонентам подписываться на это событие и обновлять свое состояние при изменении сессии, например, при входе или выходе пользователя.

// SessionManager — это объект, который предоставляет методы для управления сессией пользователя, включая сохранение, получение и удаление токена доступа, а также проверку состояния авторизации. Он также включает механизм уведомления компонентов UI об изменениях в сессии через пользовательское событие SESSION_CHANGE_EVENT, что позволяет обеспечить реактивное обновление интерфейса при изменении состояния сессии.
type SessionChangeDetail = {
  user?: unknown;
};

// notifySessionChange — это функция, которая создает и отправляет пользовательское событие SESSION_CHANGE_EVENT с дополнительными данными (detail), которые могут содержать информацию о пользователе. Это позволяет компонентам UI, подписанным на это событие, реагировать на изменения в сессии, например, обновлять отображение информации о пользователе или изменять доступные функции в зависимости от состояния авторизации.
function notifySessionChange(detail: SessionChangeDetail = {}) {
  window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail }));
}

// SessionManager — это объект, который предоставляет методы для управления сессией пользователя, включая сохранение, получение и удаление токена доступа, а также проверку состояния авторизации. Он также включает механизм уведомления компонентов UI об изменениях в сессии через пользовательское событие SESSION_CHANGE_EVENT, что позволяет обеспечить реактивное обновление интерфейса при изменении состояния сессии.
export const SessionManager = {
  // Сохранить токен в localStorage
  saveToken: (token: string, user?: unknown) => {
    localStorage.setItem(TOKEN_KEY, token);
    notifySessionChange({ user });
  },

  // Получить токен из localStorage
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Проверить, есть ли токен (т.е. авторизован ли пользователь)
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Удалить токен из localStorage (выход)
  removeToken: (options?: { notify?: boolean }) => {
    localStorage.removeItem(TOKEN_KEY);
    if (options?.notify !== false) {
      notifySessionChange({ user: null });
    }
  },

  // Событие для подписки на изменения сессии в UI
  SESSION_CHANGE_EVENT,
};
