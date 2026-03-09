import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAccessToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: {
        teenager: true,
        employer: {
          include: {
            vacancies: {
              where: { status: 'ACTIVE' },
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Get additional stats based on role
    let stats = {};
    
    if (user.role === 'TEENAGER' && user.teenager) {
      const applicationsCount = await db.application.count({
        where: { teenagerId: user.id }
      });
      const activeApplications = await db.application.count({
        where: { 
          teenagerId: user.id,
          status: { in: ['SENT', 'VIEWED', 'ACCEPTED'] }
        }
      });
      const completedJobs = await db.application.count({
        where: { 
          teenagerId: user.id,
          status: 'COMPLETED'
        }
      });
      
      stats = {
        applicationsCount,
        activeApplications,
        completedJobs,
        rating: user.teenager.rating,
        reviewsCount: user.teenager.reviewsCount
      };
    }
    
    if (user.role === 'EMPLOYER' && user.employer) {
      const totalVacancies = await db.vacancy.count({
        where: { employerId: user.employer.id }
      });
      const activeVacancies = await db.vacancy.count({
        where: { 
          employerId: user.employer.id,
          status: 'ACTIVE'
        }
      });
      const totalApplications = await db.application.count({
        where: {
          vacancy: { employerId: user.employer.id }
        }
      });
      
      stats = {
        totalVacancies,
        activeVacancies,
        totalApplications,
        rating: user.employer.rating,
        reviewsCount: user.employer.reviewsCount
      };
    }

    if (user.role === 'ADMIN') {
      const totalUsers = await db.user.count();
      const totalTeenagers = await db.user.count({ where: { role: 'TEENAGER' } });
      const totalEmployers = await db.user.count({ where: { role: 'EMPLOYER' } });
      const totalVacancies = await db.vacancy.count();
      const activeVacancies = await db.vacancy.count({ where: { status: 'ACTIVE' } });
      const pendingModeration = await db.vacancy.count({ where: { status: 'ON_MODERATION' } });
      const pendingConsents = await db.teenagerProfile.count({ 
        where: { consentStatus: 'PENDING' } 
      });
      const pendingReports = await db.report.count({ 
        where: { status: 'PENDING' } 
      });
      
      stats = {
        totalUsers,
        totalTeenagers,
        totalEmployers,
        totalVacancies,
        activeVacancies,
        pendingModeration,
        pendingConsents,
        pendingReports
      };
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      profile: user.teenager || user.employer || null,
      vacancies: user.employer?.vacancies || [],
      stats
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('accessToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      phone, 
      avatarUrl,
      // Teenager fields
      firstName,
      lastName,
      birthDate,
      city,
      district,
      bio,
      skills,
      // Employer fields
      companyName,
      inn,
      logoUrl,
      website,
      description,
      address
    } = body;

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      include: { teenager: true, employer: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    // Update common user fields
    await db.user.update({
      where: { id: user.id },
      data: {
        phone,
        avatarUrl
      }
    });

    // Update role-specific profile
    if (user.role === 'TEENAGER' && user.teenager) {
      await db.teenagerProfile.update({
        where: { userId: user.id },
        data: {
          firstName,
          lastName,
          birthDate: birthDate ? new Date(birthDate) : undefined,
          city,
          district,
          bio,
          skills: skills ? JSON.stringify(skills) : undefined
        }
      });
    }

    if (user.role === 'EMPLOYER' && user.employer) {
      await db.employerProfile.update({
        where: { userId: user.id },
        data: {
          companyName,
          inn,
          logoUrl,
          website,
          description,
          city,
          address
        }
      });
    }

    return NextResponse.json({ message: 'Профиль обновлен' });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
