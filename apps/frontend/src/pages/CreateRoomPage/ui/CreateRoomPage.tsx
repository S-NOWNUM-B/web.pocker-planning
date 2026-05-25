import { useState } from 'react'; // Импортируем хук useState из библиотеки React для управления состоянием внутри компонента CreateRoomPage.
import { useMutation, useQueryClient } from '@tanstack/react-query'; // Импортируем хук useMutation для выполнения мутаций данных (например, создания комнаты) и useQueryClient для управления кэшированными данными и их обновления после успешной мутации.
import { useNavigate } from 'react-router-dom'; // Импортируем хук useNavigate из библиотеки react-router-dom для программной навигации между страницами (например, переход к странице комнаты после её создания).
import { useSession } from '@/app/providers'; // Импортируем хук useSession из провайдера приложения для доступа к информации о текущей сессии пользователя, такой как его имя и статус авторизации.
import { loginAsGuest } from '@/entities/user'; // Импортируем функцию loginAsGuest из сущности пользователя для выполнения аутентификации гостя, если пользователь не авторизован, что позволяет ему создать комнату и участвовать в игре без необходимости регистрации.
import type { ApiError } from '@/shared/api'; // Импортируем тип ApiError для типизации ошибок, которые могут возникать при взаимодействии с API, что позволяет более точно обрабатывать и отображать сообщения об ошибках пользователю.
import { Button, Card, Input, PageShell, RadioGroup } from '@/shared/ui'; // Импортируем компоненты Button, Card, Input, PageShell и RadioGroup из общей библиотеки пользовательского интерфейса для использования в структуре и оформлении страницы создания комнаты, обеспечивая единый стиль и удобство взаимодействия для пользователей.
import { LinkIcon, PlayIcon, TrophyIcon, UsersIcon } from '@/shared/ui/icons'; // Импортируем иконки LinkIcon, PlayIcon, TrophyIcon и UsersIcon из библиотеки иконок общего пользовательского интерфейса для визуального представления различных элементов и действий на странице создания комнаты, таких как начало игры, преимущества использования приложения и т.д.
import { roomApi } from '@/entities/room'; // Импортируем объект roomApi из сущности комнаты для взаимодействия с API, связанным с комнатами, например, для создания новой комнаты, что позволяет компоненту CreateRoomPage отправлять запросы на сервер и обрабатывать ответы при создании комнаты.
import { type DeckType, type GameSession, SESSION_STORAGE_KEY } from '@/shared/lib/poker'; // Импортируем типы DeckType и GameSession, а также константу SESSION_STORAGE_KEY из библиотеки, связанной с логикой покерной игры, для типизации данных, связанных с колодой карт и игровой сессией, а также для использования ключа при сохранении информации о сессии в локальном хранилище браузера.

// DECK_INFO содержит информацию о доступных типах колод карт для игры, включая их названия и описания. Это позволяет пользователю выбрать подходящую колоду при создании комнаты, а также предоставляет информацию о том, какие карты входят в каждую колоду, что может быть полезно для понимания правил игры и выбора оптимальной колоды для конкретной команды или задачи.
const DECK_INFO: Record<DeckType, { title: string; description: string }> = {
  fibonacci: {
    title: 'Фибоначчи',
    description: '0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕',
  },
  even: {
    title: 'Чётная',
    description: '0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, ?, ☕',
  },
};

// Функция isApiError проверяет, является ли переданный объект ошибкой API, путем проверки наличия определенных свойств (statusCode, error и message) в объекте. Это позволяет компоненту CreateRoomPage более точно обрабатывать ошибки, возникающие при взаимодействии с сервером, и предоставлять пользователю соответствующие сообщения об ошибках в зависимости от типа ошибки.
const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'error' in error &&
    'message' in error
  );
};

const hasCyrillic = (text: string): boolean => /[А-Яа-яЁё]/.test(text); // Функция hasCyrillic проверяет, содержит ли переданная строка символы кириллицы, используя регулярное выражение. Это может быть полезно для определения, является ли сообщение об ошибке на русском языке, что позволяет компоненту CreateRoomPage отображать более релевантные и понятные сообщения об ошибках для русскоязычных пользователей.

// Функция getRussianCreateRoomErrorMessage принимает объект ошибки и возвращает строку с сообщением об ошибке на русском языке, адаптированным для различных сценариев ошибок, таких как проблемы с сетью, недостаточные права доступа или ошибки сервера. Она использует функцию isApiError для определения типа ошибки и функцию hasCyrillic для проверки наличия кириллических символов в оригинальном сообщении об ошибке, чтобы обеспечить более релевантные и понятные сообщения для русскоязычных пользователей.
const getRussianCreateRoomErrorMessage = (error: unknown): string => {
  const fallbackMessage = 'Не удалось создать комнату. Попробуйте ещё раз через несколько секунд.';

  if (isApiError(error)) {
    const originalMessage = (error.message || '').trim();
    const normalized = originalMessage.toLowerCase();

    if (
      normalized.includes('network error') ||
      normalized.includes('failed to fetch') ||
      normalized.includes('cors')
    ) {
      return 'Сервер временно недоступен. Проверьте подключение и попробуйте снова.';
    }

    if (error.statusCode === 401 || error.statusCode === 403) {
      return 'Недостаточно прав для создания комнаты. Обновите страницу и попробуйте снова.';
    }

    if (error.statusCode >= 500) {
      return 'На сервере произошла ошибка. Попробуйте создать комнату чуть позже.';
    }

    if (originalMessage) {
      return hasCyrillic(originalMessage) ? originalMessage : fallbackMessage;
    }

    return fallbackMessage;
  }

  if (error instanceof Error) {
    const normalized = error.message.toLowerCase();
    if (
      normalized.includes('network error') ||
      normalized.includes('failed to fetch') ||
      normalized.includes('cors')
    ) {
      return 'Сервер временно недоступен. Проверьте подключение и попробуйте снова.';
    }
  }

  return fallbackMessage;
};

// Компонент CreateRoomPage представляет собой страницу, на которой пользователи могут создать новую комнату для игры в Planning Poker. Он включает в себя форму для ввода названия комнаты, выбора типа колоды карт и кнопку для начала игры. Компонент также обрабатывает логику создания комнаты, включая аутентификацию гостя при необходимости, взаимодействие с API для создания комнаты и обработку ошибок с отображением соответствующих сообщений пользователю.
export function CreateRoomPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [roomName, setRoomName] = useState('');
  const [deckType, setDeckType] = useState<DeckType>('fibonacci');
  const creatorName = user?.name?.trim() || 'Гость';
  const trimmedRoomName = roomName.trim();

  const isRoomNameValid = trimmedRoomName.length >= 3 && trimmedRoomName.length <= 120;
  const canStart = isRoomNameValid;

  const getSession = (): GameSession | null => {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as GameSession;
    } catch {
      return null;
    }
  };

  // Функция ensureRoomAccessToken проверяет, имеет ли текущий пользователь действующий токен доступа к комнате. Если пользователь уже авторизован, функция возвращает пустой объект. Если пользователь не авторизован, функция проверяет наличие существующей сессии в локальном хранилище и возвращает токен доступа и имя гостя, если они есть. Если сессия отсутствует или недействительна, функция пытается выполнить вход как гость с помощью функции loginAsGuest и возвращает полученный токен доступа и имя гостя. В случае ошибки при аутентификации гостя функция возвращает пустой объект, что позволяет продолжить процесс создания комнаты даже без токена доступа, если это возможно.
  const ensureRoomAccessToken = async (): Promise<{ token?: string; guestName?: string }> => {
    if (user) {
      return {};
    }

    const existingSession = getSession();
    if (existingSession?.roomAccessToken) {
      return { token: existingSession.roomAccessToken, guestName: existingSession.userName };
    }

    try {
      const guestAuth = await loginAsGuest({ name: creatorName });
      return { token: guestAuth.access_token, guestName: guestAuth.user.name };
    } catch {
      // Fallback: backend guest-auth can fail independently (e.g. CORS/500),
      // while room creation may still be available for public onboarding flow.
      return {};
    }
  };

  // Мутация createRoomMutation использует хук useMutation для выполнения асинхронной операции создания комнаты. В функции mutationFn происходит проверка и получение токена доступа для гостя при необходимости, а затем отправляется запрос на сервер для создания комнаты с указанным названием и типом колоды. При успешном создании комнаты в функции onSuccess формируется объект сессии GameSession, который сохраняется в локальном хранилище браузера, обновляет кэш данных о комнатах и выполняет навигацию к странице новой комнаты. В случае ошибки мутация позволяет компоненту отобразить соответствующее сообщение об ошибке пользователю.
  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const roomAccess = await ensureRoomAccessToken();
      const snapshot = await roomApi.createRoom(trimmedRoomName, deckType, roomAccess.token);
      return { snapshot, roomAccessToken: roomAccess.token, guestName: roomAccess.guestName };
    },
    onSuccess: ({ snapshot, roomAccessToken, guestName }) => {
      const session: GameSession = {
        roomId: snapshot.room.slug,
        roomName: snapshot.room.name,
        userName: user?.name?.trim() || guestName || creatorName,
        deckType,
        ownerId: snapshot.room.owner_id,
        ownerName: user?.name?.trim() || guestName || creatorName,
        roomAccessToken,
        selfParticipantId: snapshot.self_participant_id,
      };

      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      navigate(`/room/${snapshot.room.slug}`);
    },
  });

  // Функция handleStart вызывается при нажатии на кнопку "Начать игру". Она проверяет, можно ли начать игру (например, валидно ли название комнаты и не выполняется ли уже запрос на создание комнаты). Если условия не выполняются, функция просто возвращается. Если условия выполняются, функция вызывает метод mutate мутации createRoomMutation для начала процесса создания комнаты, что в конечном итоге приведет к навигации пользователя в новую комнату при успешном создании или отображению сообщения об ошибке при неудаче.
  const handleStart = () => {
    if (!canStart || createRoomMutation.isPending) {
      return;
    }

    createRoomMutation.mutate();
  };

  const mutationError = createRoomMutation.error; // Получаем объект ошибки из мутации createRoomMutation, который может содержать информацию о том, что пошло не так при попытке создать комнату. Этот объект используется для определения, нужно ли отображать сообщение об ошибке пользователю, и для получения более подробной информации об ошибке, которая может быть полезна для отладки или предоставления пользователю более релевантного сообщения об ошибке.
  const createRoomErrorMessage = createRoomMutation.isError
    ? getRussianCreateRoomErrorMessage(mutationError)
    : null; // Если мутация createRoomMutation находится в состоянии ошибки (isError равно true), то вызывается функция getRussianCreateRoomErrorMessage с объектом ошибки mutationError для получения соответствующего сообщения об ошибке на русском языке. Если мутация не находится в состоянии ошибки, переменная createRoomErrorMessage будет иметь значение null, что означает, что нет сообщения об ошибке для отображения пользователю.

  return (
    <PageShell
      maxWidth="xl"
      className="min-h-[calc(100vh-8.5rem)]"
      contentClassName="flex min-h-[calc(100vh-8.5rem)] flex-col justify-center"
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tight text-foreground sm:text-7xl">
              Planning<span className="text-primary">.</span>Poker
            </h1>
            <p className="max-w-2xl text-xl leading-relaxed text-muted-foreground">
              Создайте комнату, выберите колоду и начните оценивать задачи вместе с командой в
              реальном времени.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: TrophyIcon,
                title: 'Быстрый старт',
                desc: 'Одна форма и мгновенный переход в комнату',
              },
              {
                icon: UsersIcon,
                title: 'Командный ритм',
                desc: 'Идеально подходит для модератора и команды',
              },
              {
                icon: LinkIcon,
                title: 'Постоянный доступ',
                desc: 'Ссылка сохраняется в браузере для быстрого возврата',
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group border border-border/50 bg-card/30 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-card/60 hover:-translate-y-1"
              >
                <item.icon className="mb-4 h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <div className="text-sm font-bold text-foreground">{item.title}</div>
                <div className="mt-1 text-sm text-muted-foreground leading-snug">{item.desc}</div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="relative overflow-hidden border border-white/10 bg-card/40 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <PlayIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Создать комнату</h2>
                <p className="text-sm text-muted-foreground">Заполните данные и начните сессию</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border/50 bg-background/50 p-4 backdrop-blur-sm shadow-inner transition-all">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                  Создатель комнаты
                </div>
                <div className="text-sm font-bold text-foreground">{creatorName}</div>
              </div>

              <Input
                label="Название комнаты"
                placeholder="Напр. Sprint Planning #42"
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
                disabled={createRoomMutation.isPending}
                error={
                  trimmedRoomName.length > 0 && trimmedRoomName.length < 3
                    ? 'Минимум 3 символа'
                    : undefined
                }
                className="bg-background/50 border-border/50"
              />

              <RadioGroup
                label="Колода карт"
                value={deckType}
                onChange={setDeckType}
                options={(
                  Object.entries(DECK_INFO) as Array<[DeckType, (typeof DECK_INFO)[DeckType]]>
                ).map(([value, deck]) => ({
                  value,
                  title: deck.title,
                  description: deck.description,
                }))}
              />

              <Button
                type="button"
                onClick={handleStart}
                disabled={!canStart || createRoomMutation.isPending}
                className="h-14 w-full text-lg font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-95"
              >
                <PlayIcon className="mr-2 h-5 w-5" />
                {createRoomMutation.isPending ? 'Создаём комнату...' : 'Начать игру'}
              </Button>

              {createRoomMutation.isError && (
                <p className="text-center text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-2">
                  {createRoomErrorMessage}
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
