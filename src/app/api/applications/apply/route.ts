import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VerificationStatus, ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

const applySchema = z.object({
  vacancyId: z.string(),
  message: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
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
        { error: 'Откликаться могут только подростки' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { vacancyId, message } = applySchema.parse(body);

    // Get teenager profile
    const teenager = await db.teenagerProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!teenager) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404 }
      );
    }

    // Check parent consent
    if (teenager.consentStatus !== VerificationStatus.VERIFIED && 
        teenager.consentStatus !== VerificationStatus.PENDING) {
      return NextResponse.json(
        { error: 'Необходимо загрузить согласие родителей' },
        { status: 400 }
      );
    }

    // Get vacancy
    const vacancy = await db.vacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy) {
      return NextResponse.json(
        { error: 'Вакансия не найдена' },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await db.application.findUnique({
      where: {
        vacancyId_teenagerId: {
          vacancyId,
          teenagerId: payload.userId,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Вы уже откликнулись на эту вакансию' },
        { status: 400 }
      );
    }

    // Check age requirement
    const today = new Date();
    let age = today.getFullYear() - teenager.birthDate.getFullYear();
    const monthDiff = today.getMonth() - teenager.birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < teenager.birthDate.getDate())) {
      age--;
    }

    if (vacancy.ageRequirement === 'AGE_14_15' && (age < 14 || age > 15)) {
      return NextResponse.json(
        { error: 'Эта вакансия доступна только для возраста 14-15 лет' },
        { status: 400 }
      );
    }

    if (vacancy.ageRequirement === 'AGE_16_17' && (age < 16 || age > 17)) {
      return NextResponse.json(
        { error: 'Эта вакансия доступна только для возраста 16-17 лет' },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.application.create({
      data: {
        vacancyId,
        teenagerId: payload.userId,
        message: message || null,
        status: ApplicationStatus.SENT,
      },
    });

    // Update vacancy applications count
    await db.vacancy.update({
      where: { id: vacancyId },
      data: { applicationsCount: { increment: 1 } },
    });

    return NextResponse.json({
      message: 'Отклик отправлен',
      application,
    });
  } catch (error) {
    console.error('Error applying:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Ошибка валидации' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при отправке отклика' },
      { status: 500 }
    );
  }
}
