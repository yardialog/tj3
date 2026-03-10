import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VerificationStatus, UserRole } from '@prisma/client';

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

    await db.teenagerProfile.update({
      where: { id },
      data: {
        consentStatus: VerificationStatus.REJECTED,
        consentReviewedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Согласие отклонено' });
  } catch (error) {
    console.error('Error rejecting consent:', error);
    return NextResponse.json(
      { error: 'Ошибка при отклонении согласия' },
      { status: 500 }
    );
  }
}
