import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
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

    if (payload.role !== 'EMPLOYER' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ только для работодателей' },
        { status: 403 }
      );
    }

    // Get employer profile
    const employer = await db.employerProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!employer) {
      return NextResponse.json(
        { error: 'Профиль работодателя не найден' },
        { status: 404 }
      );
    }

    const vacancies = await db.vacancy.findMany({
      where: {
        employerId: employer.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewsCount: true,
        applicationsCount: true,
        createdAt: true,
        city: true,
        salaryMin: true,
        salaryMax: true,
        salaryFixed: true,
        rejectionReason: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ vacancies });
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вакансий' },
      { status: 500 }
    );
  }
}
