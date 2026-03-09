import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Get all chat rooms for user
export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');

    if (roomId) {
      // Get specific room with messages
      const room = await db.chatRoom.findUnique({
        where: { id: roomId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 100,
          },
          application: {
            include: {
              vacancy: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });

      if (!room) {
        return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
      }

      // Check access
      const isTeenager = room.teenagerId === payload.userId;
      const isEmployer = await db.employerProfile.findFirst({
        where: { userId: payload.userId, id: room.employerId },
      });

      if (!isTeenager && !isEmployer) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }

      // Get other participant info
      let otherUser;
      if (isTeenager) {
        const employer = await db.employerProfile.findUnique({
          where: { id: room.employerId },
          select: { companyName: true, userId: true },
        });
        otherUser = {
          id: employer?.userId,
          name: employer?.companyName,
          type: 'employer',
        };
      } else {
        const teenager = await db.user.findUnique({
          where: { id: room.teenagerId },
          include: {
            teenager: { select: { firstName: true, lastName: true } },
          },
        });
        otherUser = {
          id: teenager?.id,
          name: teenager?.teenager 
            ? `${teenager.teenager.firstName} ${teenager.teenager.lastName}`
            : teenager?.email,
          type: 'teenager',
        };
      }

      // Mark messages as read
      await db.chatMessage.updateMany({
        where: {
          roomId,
          receiverId: payload.userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return NextResponse.json({ room, otherUser });
    }

    // Get all rooms for user
    let rooms;
    if (payload.role === 'TEENAGER') {
      rooms = await db.chatRoom.findMany({
        where: { teenagerId: payload.userId },
        include: {
          application: {
            include: {
              vacancy: {
                select: { id: true, title: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Add employer info
      const roomsWithEmployer = await Promise.all(
        rooms.map(async (room) => {
          const employer = await db.employerProfile.findUnique({
            where: { id: room.employerId },
            select: { companyName: true, userId: true },
          });
          return { ...room, employer };
        })
      );

      return NextResponse.json({ rooms: roomsWithEmployer });
    } else if (payload.role === 'EMPLOYER') {
      const employer = await db.employerProfile.findUnique({
        where: { userId: payload.userId },
      });

      if (!employer) {
        return NextResponse.json({ error: 'Профиль не найден' }, { status: 404 });
      }

      rooms = await db.chatRoom.findMany({
        where: { employerId: employer.id },
        include: {
          application: {
            include: {
              vacancy: {
                select: { id: true, title: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      // Add teenager info
      const roomsWithTeenager = await Promise.all(
        rooms.map(async (room) => {
          const teenager = await db.user.findUnique({
            where: { id: room.teenagerId },
            include: {
              teenager: { select: { firstName: true, lastName: true } },
            },
          });
          return { ...room, teenager };
        })
      );

      return NextResponse.json({ rooms: roomsWithTeenager });
    }

    return NextResponse.json({ rooms: [] });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
