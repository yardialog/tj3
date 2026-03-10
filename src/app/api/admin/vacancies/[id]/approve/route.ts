import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VacancyStatus, UserRole } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();
    const { id } = await params;

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const vacancy = await db.vacancy.update({
      where: { id },
      data: {
        status: VacancyStatus.ACTIVE,
        moderatedAt: new Date(),
        moderatedBy: payload.userId,
        publishedAt: new Date(),
      },
    });

    // Update employer's active vacancies count
    await db.employerProfile.update({
      where: { id: vacancy.employerId },
      data: {
        activeVacanciesCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ message: 'Вакансия одобрена', vacancy });
  } catch (error) {
    console.error('Error approving vacancy:', error);
    return NextResponse.json(
      { error: 'Ошибка при одобрении вакансии' },
      { status: 500 }
    );
  }
}
