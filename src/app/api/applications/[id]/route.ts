import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get application details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const application = await db.application.findUnique({
      where: { id },
      include: {
        teenager: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatarUrl: true,
            teenager: {
              select: {
                firstName: true,
                lastName: true,
                city: true,
                district: true,
                bio: true,
                skills: true,
                rating: true,
                reviewsCount: true,
                completedJobs: true,
                birthDate: true,
                consentStatus: true,
              },
            },
          },
        },
        vacancy: {
          include: {
            employer: {
              select: {
                id: true,
                companyName: true,
                city: true,
                rating: true,
              },
            },
          },
        },
        chatRoom: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 100,
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Check access rights
    const isEmployer = payload.role === 'EMPLOYER';
    const isTeenager = payload.role === 'TEENAGER';

    if (isEmployer) {
      const employer = await db.employerProfile.findUnique({
        where: { userId: payload.userId },
      });
      if (!employer || application.vacancy.employerId !== employer.id) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }
    } else if (isTeenager) {
      if (application.teenagerId !== payload.userId) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    // Mark as viewed for employer
    if (isEmployer && application.status === 'SENT') {
      await db.application.update({
        where: { id },
        data: {
          status: 'VIEWED',
          viewedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

// PUT - Update application status (accept/reject/complete)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const payload = await getCurrentUser();

    if (!payload) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { status, rejectionReason } = body;

    const application = await db.application.findUnique({
      where: { id },
      include: {
        vacancy: {
          include: { employer: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
    }

    // Validate status transition
    const validStatuses = ['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Недопустимый статус' }, { status: 400 });
    }

    // Check permissions
    if (payload.role === 'EMPLOYER') {
      const employer = await db.employerProfile.findUnique({
        where: { userId: payload.userId },
      });
      
      if (!employer || application.vacancy.employerId !== employer.id) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }

      // Employer can accept, reject, or mark as completed
      const allowedTransitions: Record<string, string[]> = {
        SENT: ['ACCEPTED', 'REJECTED'],
        VIEWED: ['ACCEPTED', 'REJECTED'],
        ACCEPTED: ['COMPLETED', 'REJECTED'],
      };

      if (!allowedTransitions[application.status]?.includes(status)) {
        return NextResponse.json({ 
          error: `Невозможно изменить статус с "${application.status}" на "${status}"` 
        }, { status: 400 });
      }

      // Update application
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'ACCEPTED') {
        updateData.acceptedAt = new Date();
        
        // Create chat room
        const existingRoom = await db.chatRoom.findUnique({
          where: { applicationId: id },
        });
        
        if (!existingRoom) {
          await db.chatRoom.create({
            data: {
              applicationId: id,
              teenagerId: application.teenagerId,
              employerId: employer.id,
            },
          });
        }
      } else if (status === 'REJECTED') {
        updateData.rejectedAt = new Date();
        if (rejectionReason) {
          updateData.rejectionReason = rejectionReason;
        }
      } else if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }

      const updated = await db.application.update({
        where: { id },
        data: updateData,
        include: {
          teenager: {
            select: {
              id: true,
              email: true,
              phone: true,
              avatarUrl: true,
              teenager: {
                select: {
                  firstName: true,
                  lastName: true,
                  city: true,
                  district: true,
                  bio: true,
                  skills: true,
                  rating: true,
                  reviewsCount: true,
                  completedJobs: true,
                  birthDate: true,
                  consentStatus: true,
                },
              },
            },
          },
          vacancy: {
            select: {
              id: true,
              title: true,
            },
          },
          chatRoom: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
      });

      // Create notification for teenager
      const notificationData: { type: string; title: string; content: string } = {
        type: status === 'ACCEPTED' ? 'APPLICATION_ACCEPTED' : 
              status === 'REJECTED' ? 'APPLICATION_REJECTED' : 'SYSTEM',
        title: status === 'ACCEPTED' ? 'Заявка принята!' : 
               status === 'REJECTED' ? 'Заявка отклонена' : 'Работа завершена',
        content: status === 'ACCEPTED' 
          ? `Ваша заявка на вакансию "${application.vacancy.title}" принята!`
          : status === 'REJECTED'
          ? `Ваша заявка на вакансию "${application.vacancy.title}" отклонена.`
          : `Работа по вакансии "${application.vacancy.title}" отмечена как завершенная.`,
      };

      await db.notification.create({
        data: {
          userId: application.teenagerId,
          type: notificationData.type as any,
          title: notificationData.title,
          content: notificationData.content,
          linkUrl: `/dashboard`,
        },
      });

      return NextResponse.json({ application: updated });
    } 
    
    if (payload.role === 'TEENAGER') {
      if (application.teenagerId !== payload.userId) {
        return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
      }

      // Teenager can only cancel their application
      if (status !== 'CANCELLED') {
        return NextResponse.json({ error: 'Вы можете только отменить свою заявку' }, { status: 400 });
      }

      const allowedTransitions = ['SENT', 'VIEWED'];
      if (!allowedTransitions.includes(application.status)) {
        return NextResponse.json({ error: 'Невозможно отменить эту заявку' }, { status: 400 });
      }

      const updated = await db.application.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json({ application: updated });
    }

    return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
