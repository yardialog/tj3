import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, generateUniqueSlug } from '@/lib/auth';
import { db } from '@/lib/db';
import { VacancyCategory, VacancyStatus, AgeRequirement, WorkSchedule, VerificationStatus } from '@prisma/client';
import { z } from 'zod';

const createVacancySchema = z.object({
  title: z.string().min(5, 'Заголовок должен быть минимум 5 символов').max(100),
  description: z.string().min(50, 'Описание должно быть минимум 50 символов').max(5000),
  category: z.enum([
    'TUTORING', 'IT', 'PROMOTER', 'DELIVERY', 'CLEANING', 
    'ANIMATION', 'SERVICE', 'OTHER'
  ]),
  ageRequirement: z.enum(['AGE_14_15', 'AGE_16_17', 'AGE_14_17']).optional(),
  requiredSkills: z.array(z.string()).optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  salaryFixed: z.number().min(0).optional(),
  salaryType: z.enum(['fixed', 'range', 'negotiable']).default('fixed'),
  schedule: z.enum([
    'FULL_TIME', 'PART_TIME', 'FLEXIBLE', 'WEEKENDS', 'EVENING', 'SUMMER'
  ]),
  city: z.string().min(2, 'Укажите город'),
  address: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await getCurrentUser();
    console.log('Create vacancy - payload:', payload);

    if (!payload) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    if (payload.role !== 'EMPLOYER' && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Доступ только для работодателей' },
        { status: 403 }
      );
    }

    // Get employer profile
    const employer = await db.employerProfile.findUnique({
      where: { userId: payload.userId },
      include: {
        vacancies: {
          where: { status: VacancyStatus.ACTIVE },
        },
      },
    });

    console.log('Employer found:', employer ? employer.id : 'not found');

    if (!employer) {
      return NextResponse.json(
        { error: 'Профиль работодателя не найден' },
        { status: 404 }
      );
    }

    // Check if employer is verified
    const isVerified = employer.verificationStatus === VerificationStatus.VERIFIED;
    console.log('Employer verified:', isVerified);

    // Check active vacancies limit
    const activeCount = employer.vacancies.length;
    console.log('Active vacancies:', activeCount);
    
    if (activeCount >= 5) {
      return NextResponse.json(
        { error: 'Достигнут лимит активных вакансий (5)' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const validatedData = createVacancySchema.parse(body);
    console.log('Validated data:', validatedData);

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.title);
    console.log('Generated slug:', slug);

    // Determine status:
    // - If employer is not verified, can only save as DRAFT
    // - If employer is verified, can save as DRAFT or ON_MODERATION
    let status: VacancyStatus;
    if (!isVerified) {
      // Non-verified employer can only create drafts
      status = VacancyStatus.DRAFT;
    } else {
      // Verified employer can publish to moderation
      status = body.status === 'ON_MODERATION' ? VacancyStatus.ON_MODERATION : VacancyStatus.DRAFT;
    }
    console.log('Vacancy status will be:', status);

    // Create vacancy
    const vacancy = await db.vacancy.create({
      data: {
        employerId: employer.id,
        title: validatedData.title,
        slug,
        description: validatedData.description,
        category: validatedData.category as VacancyCategory,
        ageRequirement: (validatedData.ageRequirement || 'AGE_14_17') as AgeRequirement,
        requiredSkills: JSON.stringify(validatedData.requiredSkills || []),
        salaryMin: validatedData.salaryMin || null,
        salaryMax: validatedData.salaryMax || null,
        salaryFixed: validatedData.salaryFixed || null,
        salaryType: validatedData.salaryType,
        schedule: validatedData.schedule as WorkSchedule,
        city: validatedData.city,
        address: validatedData.address || null,
        status,
        publishedAt: status === VacancyStatus.ON_MODERATION ? new Date() : null,
      },
    });

    console.log('Created vacancy:', vacancy.id);

    return NextResponse.json({
      message: status === VacancyStatus.ON_MODERATION
        ? 'Вакансия отправлена на модерацию'
        : 'Вакансия сохранена в черновиках',
      vacancy,
      needsVerification: !isVerified,
    });
  } catch (error) {
    console.error('Error creating vacancy:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Ошибка валидации' },
        { status: 400 }
      );
    }

    // Handle specific Prisma errors
    if (error instanceof Error) {
      const errorMessage = error.message;
      console.error('Error message:', errorMessage);
      
      // Check for unique constraint violations
      if (errorMessage.includes('Unique constraint') || errorMessage.includes('unique')) {
        return NextResponse.json(
          { error: 'Вакансия с таким названием уже существует' },
          { status: 400 }
        );
      }
      
      // Check for database connection issues
      if (errorMessage.includes('connect') || errorMessage.includes('Connection')) {
        return NextResponse.json(
          { error: 'Ошибка подключения к базе данных' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Ошибка при создании вакансии: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка') },
      { status: 500 }
    );
  }
}
