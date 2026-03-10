import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { VerificationStatus, UserRole } from '@prisma/client';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    const consents = await db.teenagerProfile.findMany({
      where: {
        consentStatus: VerificationStatus.PENDING,
        consentDocumentUrl: { not: null },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        consentUploadedAt: 'asc',
      },
    });

    return NextResponse.json({ consents });
  } catch (error) {
    console.error('Error fetching admin consents:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении согласий' },
      { status: 500 }
    );
  }
}
