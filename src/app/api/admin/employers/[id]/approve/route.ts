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

    // Update employer verification status
    const employer = await db.employerProfile.update({
      where: { id },
      data: {
        verificationStatus: VerificationStatus.VERIFIED,
        verifiedAt: new Date(),
      },
    });

    // Create notification for the employer
    await db.notification.create({
      data: {
        userId: employer.userId,
        type: 'VACANCY_PUBLISHED', // Using existing type, could add VERIFIED type
        title: 'Компания верифицирована',
        content: 'Ваша компания прошла верификацию. Теперь вы можете публиковать вакансии.',
      },
    });

    return NextResponse.json({ success: true, employer });
  } catch (error) {
    console.error('Error approving employer:', error);
    return NextResponse.json(
      { error: 'Ошибка при одобрении работодателя' },
      { status: 500 }
    );
  }
}
