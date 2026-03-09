import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        teenager: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        employer: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error searching user:', error);
    return NextResponse.json(
      { error: 'Ошибка при поиске пользователя' },
      { status: 500 }
    );
  }
}
