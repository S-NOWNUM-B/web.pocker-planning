import secrets
import string
from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Room, RoomParticipant, User
from app.models.enums import RoomRole, RoomStatus, TaskStatus
from app.repositories.room_repository import RoomRepository
from app.repositories.voting_repository import VotingRepository
from app.schemas.room import (
    DeckPresetResponse,
    InvitationCreateRequest,
    InvitationLinkResponse,
    RoomCreateRequest,
    RoomListItemResponse,
)


class RoomService:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()
        self.rooms = RoomRepository(db)
        self.voting = VotingRepository(db)

    def list_decks(self) -> list[DeckPresetResponse]:
        return [DeckPresetResponse.model_validate(deck) for deck in self.rooms.list_decks()]

    def _slugify(self, value: str) -> str:
        del value
        alphabet = string.ascii_uppercase
        for _ in range(50):
            room_code = "".join(secrets.choice(alphabet) for _ in range(4))
            if not self.rooms.slug_exists(room_code):
                return room_code

        # Крайне редкий fallback на случай коллизий.
        return f"{''.join(secrets.choice(alphabet) for _ in range(4))}{secrets.token_hex(1).upper()}"

    def _build_invitation_response(self, invitation) -> InvitationLinkResponse:
        return InvitationLinkResponse(
            id=invitation.id,
            token=invitation.token,
            url=f"{self.settings.frontend_url.rstrip('/')}/invite/{invitation.token}",
            expires_at=invitation.expires_at,
            is_active=invitation.is_active,
            created_at=invitation.created_at,
        )

    def require_room_access(self, room_id: UUID, user: User) -> tuple[Room, RoomParticipant]:
        room = self.rooms.get_room_for_user(room_id, user.id)
        if room is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната не найдена")
        participant = self.rooms.get_participant(room_id, user.id)
        if participant is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к комнате")
        return room, participant

    def require_owner(self, room_id: UUID, user: User) -> tuple[Room, RoomParticipant]:
        room, participant = self.require_room_access(room_id, user)
        if participant.role != RoomRole.OWNER:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Это действие доступно только владельцу комнаты")
        return room, participant

    def create_room(self, payload: RoomCreateRequest, user: User):
        deck = self.rooms.get_deck_by_code(payload.deck_preset_code)
        if deck is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Выбранная колода не найдена")

        room = self.rooms.create_room(
            name=payload.name.strip(),
            slug=self._slugify(payload.name),
            description=payload.description.strip(),
            status=RoomStatus.ACTIVE,
            owner_id=user.id,
            deck_preset_id=deck.id,
        )
        participant = self.rooms.create_participant(
            room_id=room.id,
            user_id=user.id,
            role=RoomRole.OWNER,
            seat_index=0,
        )
        invitation = self.rooms.create_invitation(
            room_id=room.id,
            created_by_id=user.id,
            token=secrets.token_urlsafe(24),
            is_active=True,
            expires_at=datetime.now(UTC) + timedelta(hours=72),
        )
        self.rooms.touch_room(room)
        self.db.commit()
        self.db.refresh(room)
        self.db.refresh(participant)
        return room, participant, self._build_invitation_response(invitation)

    def list_rooms_for_user(self, user: User) -> list[RoomListItemResponse]:
        rooms = self.rooms.list_rooms_for_user(user.id)
        result: list[RoomListItemResponse] = []
        for room in rooms:
            invitation = next(
                (
                    link
                    for link in sorted(room.invitation_links, key=lambda item: item.created_at, reverse=True)
                    if link.is_active
                ),
                None,
            )
            result.append(
                RoomListItemResponse(
                    id=room.id,
                    owner_id=room.owner_id,
                    name=room.name,
                    slug=room.slug,
                    description=room.description,
                    invite_link=f"{self.settings.frontend_url.rstrip('/')}/invite/{invitation.token}" if invitation else None,
                    participants_count=len(room.participants),
                    active_task_title=room.current_task.title if room.current_task else None,
                    last_activity_at=room.updated_at,
                    created_at=room.created_at,
                )
            )
        return result

    def delete_room(self, room_id: UUID, user: User) -> None:
        room, _ = self.require_owner(room_id, user)
        self.db.delete(room)
        self.db.commit()

    def create_invitation(self, room_id: UUID, payload: InvitationCreateRequest, user: User) -> InvitationLinkResponse:
        self.require_owner(room_id, user)
        invitation = self.rooms.create_invitation(
            room_id=room_id,
            created_by_id=user.id,
            token=secrets.token_urlsafe(24),
            is_active=True,
            expires_at=datetime.now(UTC) + timedelta(hours=payload.expires_in_hours) if payload.expires_in_hours else None,
        )
        room = self.rooms.get_room(room_id)
        if room is not None:
            self.rooms.touch_room(room)
        self.db.commit()
        return self._build_invitation_response(invitation)

    def join_by_invitation(self, token: str, user: User) -> tuple[Room, RoomParticipant]:
        invitation = self.rooms.get_invitation_by_token(token)
        if invitation is None or not invitation.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Приглашение не найдено")
        if invitation.expires_at and invitation.expires_at < datetime.now(UTC):
            raise HTTPException(status_code=status.HTTP_410_GONE, detail="Срок действия приглашения истёк")

        room = invitation.room
        participant = self.rooms.get_participant(room.id, user.id)
        if participant is None:
            seat_index = self.rooms.get_participant_count(room.id)
            participant = self.rooms.create_participant(
                room_id=room.id,
                user_id=user.id,
                role=RoomRole.MEMBER,
                seat_index=seat_index,
            )
        self.rooms.touch_room(room)
        self.db.commit()
        self.db.refresh(participant)
        return room, participant

    def join_by_code(self, room_code: str, user: User) -> tuple[Room, RoomParticipant]:
        normalized_code = room_code.strip().upper()
        room = self.rooms.get_room_by_slug(normalized_code)
        if room is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Комната с таким кодом не найдена")

        participant = self.rooms.get_participant(room.id, user.id)
        if participant is None:
            seat_index = self.rooms.get_participant_count(room.id)
            participant = self.rooms.create_participant(
                room_id=room.id,
                user_id=user.id,
                role=RoomRole.MEMBER,
                seat_index=seat_index,
            )

        self.rooms.touch_room(room)
        self.db.commit()
        self.db.refresh(participant)
        return room, participant

    def create_task(self, room_id: UUID, payload, user: User):
        room, _ = self.require_owner(room_id, user)
        position = payload.position if payload.position is not None else self.rooms.get_next_task_position(room_id)
        task = self.rooms.create_task(
            room_id=room.id,
            created_by_id=user.id,
            title=payload.title.strip(),
            description=payload.description.strip(),
            position=position,
            status=TaskStatus.BACKLOG,
        )
        self.rooms.touch_room(room)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update_task(self, room_id: UUID, task_id: UUID, payload, user: User):
        _, _ = self.require_owner(room_id, user)

        # Сначала обновляем время обновления комнаты, чтобы последующая загрузка
        # не затерла изменения в задаче через populate_existing=True
        room = self.rooms.get_room(room_id)
        if room is not None:
            self.rooms.touch_room(room)

        task = self.rooms.get_task(room_id, task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")

        for field in ("title", "description", "position"):
            value = getattr(payload, field)
            if value is not None:
                setattr(task, field, value.strip() if isinstance(value, str) else value)

        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete_task(self, room_id: UUID, task_id: UUID, user: User) -> None:
        room, _ = self.require_owner(room_id, user)
        task = self.rooms.get_task(room_id, task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
        if self.voting.get_active_round(room_id) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сначала завершите или сбросьте активный раунд")
        if self.rooms.task_has_rounds(task_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="У задачи уже есть история раундов, поэтому удалить её нельзя",
            )

        if room.current_task_id == task.id:
            room.current_task_id = None
        self.db.delete(task)
        self.rooms.touch_room(room)
        self.db.commit()

    def select_task(self, room_id: UUID, task_id: UUID, user: User) -> None:
        room, _ = self.require_owner(room_id, user)
        task = self.rooms.get_task(room_id, task_id)
        if task is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Задача не найдена")
        if self.voting.get_active_round(room_id) is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Сначала завершите или сбросьте активный раунд")
        self.rooms.reset_active_task_flags(room, task_id)
        self.db.commit()

    def touch_presence(self, room_id: UUID, user_id: UUID) -> RoomParticipant:
        participant = self.rooms.get_participant(room_id, user_id)
        if participant is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден")
        participant = self.rooms.touch_participant(participant)
        self.db.commit()
        self.db.refresh(participant)
        return participant
