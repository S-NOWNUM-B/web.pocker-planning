import { useParams } from 'react-router-dom'; // Импортируем useParams для получения параметров из URL

// Хук useRoomParams используется для получения параметра roomId из URL. Если параметр roomId отсутствует, выбрасывается ошибка. Этот хук обеспечивает типизацию и удобный доступ к параметру roomId для компонентов, которые его используют.
export function useRoomParams() {
  const params = useParams<{ roomId: string }>();

  if (!params.roomId) {
    throw new Error('Room ID is required');
  }

  return { roomId: params.roomId };
}
