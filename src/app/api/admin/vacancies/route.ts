import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VacancyStatus, UserRole } from '@prisma/client';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const vacancies = await db.vacancy.findMany({
      where: {
        status: VacancyStatus.ON_MODERATION,
      },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            inn: true,
            verificationStatus: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ vacancies });
  } catch (error) {
    console.error('Error fetching admin vacancies:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вакансий' },
      { status: 500 }
    );
  }
}
