import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VacancyStatus, VacancyCategory, AgeRequirement } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payload = await getCurrentUser();
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filters
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') as VacancyCategory | null;
    const city = searchParams.get('city') || '';
    const ageRequirement = searchParams.get('ageRequirement') as AgeRequirement | null;
    
    // Build where clause
    const where: any = {
      status: VacancyStatus.ACTIVE,
    };
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    if (category) {
      where.category = category;
    }
    
    if (city) {
      where.city = { contains: city };
    }
    
    if (ageRequirement) {
      where.ageRequirement = ageRequirement;
    }
    
    // Get vacancies with count
    const [vacancies, total] = await Promise.all([
      db.vacancy.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              logoUrl: true,
              rating: true,
              city: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      db.vacancy.count({ where }),
    ]);
    
    // Get application status for logged-in teenager
    let applicationsMap: Record<string, { status: string; chatRoomId: string | null }> = {};
    
    if (payload && payload.role === 'TEENAGER') {
      const vacancyIds = vacancies.map(v => v.id);
      const applications = await db.application.findMany({
        where: {
          teenagerId: payload.userId,
          vacancyId: { in: vacancyIds },
        },
        select: {
          vacancyId: true,
          status: true,
          chatRoom: {
            select: { id: true },
          },
        },
      });
      
      applicationsMap = applications.reduce((acc, app) => {
        acc[app.vacancyId] = {
          status: app.status,
          chatRoomId: app.chatRoom?.id || null,
        };
        return acc;
      }, {} as Record<string, { status: string; chatRoomId: string | null }>);
    }
    
    // Add application status to vacancies
    const vacanciesWithStatus = vacancies.map(vacancy => ({
      ...vacancy,
      applicationStatus: applicationsMap[vacancy.id]?.status || null,
      chatRoomId: applicationsMap[vacancy.id]?.chatRoomId || null,
    }));
    
    return NextResponse.json({
      vacancies: vacanciesWithStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching vacancies:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении вакансий' },
      { status: 500 }
    );
  }
}
