import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, VacancyStatus, VerificationStatus } from '@prisma/client';

export async function GET() {
  try {
    const payload = await getCurrentUser();

    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Get basic counts
    const [
      totalUsers,
      totalTeenagers,
      totalEmployers,
      totalVacancies,
      activeVacancies,
      pendingVacancies,
      rejectedVacancies,
      totalApplications,
      pendingConsents,
      verifiedConsents,
      totalReports,
      pendingReports,
      recentUsers,
      recentVacancies,
      pendingEmployers,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: UserRole.TEENAGER } }),
      db.user.count({ where: { role: UserRole.EMPLOYER } }),
      db.vacancy.count(),
      db.vacancy.count({ where: { status: VacancyStatus.ACTIVE } }),
      db.vacancy.count({ where: { status: VacancyStatus.ON_MODERATION } }),
      db.vacancy.count({ where: { status: VacancyStatus.REJECTED } }),
      db.application.count(),
      db.teenagerProfile.count({
        where: {
          consentStatus: VerificationStatus.PENDING,
          consentDocumentUrl: { not: null },
        },
      }),
      db.teenagerProfile.count({
        where: { consentStatus: VerificationStatus.VERIFIED },
      }),
      db.report.count(),
      db.report.count({ where: { status: 'PENDING' } }),
      db.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.vacancy.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.employerProfile.count({
        where: {
          verificationStatus: {
            in: [VerificationStatus.NOT_UPLOADED, VerificationStatus.PENDING],
          },
        },
      }),
    ]);

    // Get vacancies by category
    const vacanciesByCategory = await db.vacancy.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      where: {
        status: VacancyStatus.ACTIVE,
      },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        teenagers: totalTeenagers,
        employers: totalEmployers,
        recent: recentUsers,
      },
      vacancies: {
        total: totalVacancies,
        active: activeVacancies,
        pending: pendingVacancies,
        rejected: rejectedVacancies,
        recent: recentVacancies,
      },
      applications: {
        total: totalApplications,
      },
      consents: {
        pending: pendingConsents,
        verified: verifiedConsents,
      },
      employers: {
        pending: pendingEmployers,
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
      },
      charts: {
        registrationsByDay: [],
        vacanciesByCategory: vacanciesByCategory.map((item) => ({
          category: item.category,
          count: item._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении статистики' },
      { status: 500 }
    );
  }
}
