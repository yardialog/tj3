import { NextResponse } from 'next/server';
import { getCurrentUser, getUserWithProfile } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (payload.role !== 'TEENAGER') {
      return NextResponse.json(
        { error: 'Доступ только для подростков' },
        { status: 403 }
      );
    }

    const applications = await db.application.findMany({
      where: {
        teenagerId: payload.userId,
      },
      include: {
        vacancy: {
          select: {
            id: true,
            title: true,
            city: true,
            employer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении откликов' },
      { status: 500 }
    );
  }
}
