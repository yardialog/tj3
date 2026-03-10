import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ReportType, ReportStatus } from '@prisma/client';

// Get user's reports
export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const reports = await db.report.findMany({
      where: {
        reporterId: payload.userId,
      },
      include: {
        reportedUser: {
          select: {
            id: true,
            email: true,
            role: true,
            teenager: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            employer: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении жалоб' },
      { status: 500 }
    );
  }
}

// Create a new report
export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportedId, type, description, vacancyId, messageId } = body;

    if (!reportedId || !type || !description) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 }
      );
    }

    // Check if reported user exists
    const reportedUser = await db.user.findUnique({
      where: { id: reportedId },
    });

    if (!reportedUser) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Can't report yourself
    if (reportedId === payload.userId) {
      return NextResponse.json(
        { error: 'Нельзя подать жалобу на себя' },
        { status: 400 }
      );
    }

    const report = await db.report.create({
      data: {
        reporterId: payload.userId,
        reportedId,
        type: type as ReportType,
        description,
        vacancyId,
        messageId,
        status: ReportStatus.PENDING,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании жалобы' },
      { status: 500 }
    );
  }
}
