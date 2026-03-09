import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VacancyStatus, UserRole } from '@prisma/client';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(10, 'Причина должна быть минимум 10 символов'),
});

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

    const body = await request.json();
    const { reason } = rejectSchema.parse(body);

    const vacancy = await db.vacancy.update({
      where: { id },
      data: {
        status: VacancyStatus.REJECTED,
        rejectionReason: reason,
        moderatedAt: new Date(),
        moderatedBy: payload.userId,
      },
    });

    return NextResponse.json({ message: 'Вакансия отклонена', vacancy });
  } catch (error) {
    console.error('Error rejecting vacancy:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Ошибка валидации' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при отклонении вакансии' },
      { status: 500 }
    );
  }
}
