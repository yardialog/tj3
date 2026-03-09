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

    if (payload.role !== 'EMPLOYER') {
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

    const applications = await db.application.findMany({
      where: {
        vacancy: {
          employerId: employer.id,
        },
      },
      include: {
        teenager: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
            teenager: {
              select: {
                firstName: true,
                lastName: true,
                city: true,
                district: true,
                rating: true,
                birthDate: true,
                bio: true,
                skills: true,
                reviewsCount: true,
                completedJobs: true,
                consentStatus: true,
              },
            },
          },
        },
        vacancy: {
          select: {
            id: true,
            title: true,
          },
        },
        chatRoom: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching incoming applications:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении откликов' },
      { status: 500 }
    );
  }
}
