import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

// GET - Poll for new messages
export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const afterId = searchParams.get('afterId');

    if (!roomId) {
      return NextResponse.json({ error: 'roomId обязателен' }, { status: 400 });
    }

    // Check access
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
    }

    // Check if user is participant
    // teenagerId is User.id, employerId is EmployerProfile.id
    const isTeenager = room.teenagerId === payload.userId;
    
    let isEmployer = false;
    if (!isTeenager && payload.role === 'EMPLOYER') {
      const employerProfile = await db.employerProfile.findUnique({
        where: { userId: payload.userId },
      });
      isEmployer = employerProfile?.id === room.employerId;
    }

    if (!isTeenager && !isEmployer) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    // Get messages
    const messages = await db.chatMessage.findMany({
      where: {
        roomId,
        ...(afterId ? { id: { gt: afterId } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    // Mark as read
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error polling messages:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { roomId, content, receiverId } = body;

    if (!roomId || !content?.trim() || !receiverId) {
      return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 });
    }

    // Check access
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'Чат закрыт' }, { status: 400 });
    }

    // Check if user is participant
    const isTeenager = room.teenagerId === payload.userId;
    
    let isEmployer = false;
    if (!isTeenager && payload.role === 'EMPLOYER') {
      const employerProfile = await db.employerProfile.findUnique({
        where: { userId: payload.userId },
      });
      isEmployer = employerProfile?.id === room.employerId;
    }

    if (!isTeenager && !isEmployer) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    // Mask contact info
    const maskedContent = maskContactInfo(content.trim());

    // Save message
    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: payload.userId,
        receiverId,
        content: maskedContent,
        isRead: false,
      },
    });

    // Update chat room
    await db.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// Mask contact info in messages
function maskContactInfo(text: string): string {
  // Mask phone numbers
  text = text.replace(
    /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    '[телефон скрыт]'
  );

  // Mask emails
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[email скрыт]'
  );

  // Mask social media links
  text = text.replace(
    /(?:vk\.com|instagram\.com|t\.me|telegram\.me)\/[a-zA-Z0-9_]+/gi,
    '[соц. сеть скрыта]'
  );

  return text;
}
