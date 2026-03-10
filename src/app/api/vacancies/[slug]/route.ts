import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VacancyStatus, UserRole, VerificationStatus } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const payload = await getCurrentUser();

    const vacancy = await db.vacancy.findUnique({
      where: { slug },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            logoUrl: true,
            city: true,
            description: true,
            rating: true,
            reviewsCount: true,
          },
        },
      },
    });

    if (!vacancy || vacancy.status !== VacancyStatus.ACTIVE) {
      return NextResponse.json(
        { error: 'Вакансия не найдена' },
        { status: 404 }
      );
    }

    // Increment view count
    await db.vacancy.update({
      where: { id: vacancy.id },
      data: { viewsCount: { increment: 1 } },
    });

    // Check if user has applied
    let hasApplied = false;
    if (payload && payload.role === 'TEENAGER') {
      const application = await db.application.findUnique({
        where: {
          vacancyId_teenagerId: {
            vacancyId: vacancy.id,
            teenagerId: payload.userId,
          },
        },
      });
      hasApplied = !!application;
    }

    return NextResponse.json({ vacancy, hasApplied });
  } catch (error) {
    console.error('Error fetching vacancy:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вакансии' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['DRAFT', 'ON_MODERATION', 'ARCHIVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Недопустимый статус' },
        { status: 400 }
      );
    }

    // Get vacancy by slug
    const vacancy = await db.vacancy.findUnique({
      where: { slug },
      include: {
        employer: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Вакансия не найдена' },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = payload.role === UserRole.EMPLOYER &&
      vacancy.employer.userId === payload.userId;
    const isAdmin = payload.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Нет прав для редактирования этой вакансии' },
        { status: 403 }
      );
    }

    // Handle status transitions
    let newStatus: VacancyStatus;

    switch (status) {
      case 'DRAFT':
        if (!['REJECTED', 'ARCHIVED', 'CLOSED', 'DRAFT'].includes(vacancy.status)) {
          return NextResponse.json(
            { error: 'Нельзя вернуть эту вакансию в черновики' },
            { status: 400 }
          );
        }
        newStatus = VacancyStatus.DRAFT;
        break;

      case 'ON_MODERATION':
        if (payload.role === UserRole.EMPLOYER) {
          const employer = await db.employerProfile.findUnique({
            where: { userId: payload.userId },
          });

          if (!employer || employer.verificationStatus !== VerificationStatus.VERIFIED) {
            return NextResponse.json(
              { error: 'Ваша компания должна быть верифицирована для публикации вакансий' },
              { status: 403 }
            );
          }
        }

        if (!['DRAFT', 'REJECTED'].includes(vacancy.status)) {
          return NextResponse.json(
            { error: 'Можно отправить на модерацию только черновик или отклонённую вакансию' },
            { status: 400 }
          );
        }
        newStatus = VacancyStatus.ON_MODERATION;
        break;

      case 'ARCHIVED':
        if (!['ACTIVE', 'DRAFT', 'REJECTED'].includes(vacancy.status)) {
          return NextResponse.json(
            { error: 'Нельзя заархивировать эту вакансию' },
            { status: 400 }
          );
        }
        newStatus = VacancyStatus.ARCHIVED;
        break;

      case 'CLOSED':
        if (vacancy.status !== VacancyStatus.ACTIVE) {
          return NextResponse.json(
            { error: 'Можно закрыть только активную вакансию' },
            { status: 400 }
          );
        }
        newStatus = VacancyStatus.CLOSED;
        break;

      default:
        return NextResponse.json(
          { error: 'Недопустимый статус' },
          { status: 400 }
        );
    }

    // Update vacancy status
    const updatedVacancy = await db.vacancy.update({
      where: { slug },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Статус вакансии обновлён',
      vacancy: updatedVacancy,
    });
  } catch (error) {
    console.error('Error updating vacancy status:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении статуса вакансии' },
      { status: 500 }
    );
  }
}
