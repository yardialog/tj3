import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, VerificationStatus } from '@prisma/client';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Get employers pending verification (NOT_UPLOADED or PENDING)
    const employers = await db.employerProfile.findMany({
      where: {
        verificationStatus: {
          in: [VerificationStatus.NOT_UPLOADED, VerificationStatus.PENDING],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({ employers });
  } catch (error) {
    console.error('Error fetching admin employers:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении работодателей' },
      { status: 500 }
    );
  }
}
