import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { VacancyStatus, VacancyCategory, AgeRequirement } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
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
    
    return NextResponse.json({
      vacancies,
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
