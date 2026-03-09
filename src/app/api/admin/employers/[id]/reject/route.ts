import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, VerificationStatus } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getCurrentUser();

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Update employer verification status
    const employer = await db.employerProfile.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.REJECTED,
      },
    });

    // Create notification for the employer
    await db.notification.create({
      data: {
        userId: employer.userId,
        type: 'VACANCY_REJECTED', // Using existing type
        title: 'Верификация отклонена',
        content: `Ваша компания не прошла верификацию. ${reason ? `Причина: ${reason}` : 'Проверьте данные компании.'}`,
      },
    });

    return NextResponse.json({ success: true, employer });
  } catch (error) {
    console.error('Error rejecting employer:', error);
    return NextResponse.json(
      { error: 'Ошибка при отклонении работодателя' },
      { status: 500 }
    );
  }
}
