import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth';
import { UserStatus } from '@prisma/client';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(1, 'Введите пароль'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
      include: {
        teenager: true,
        employer: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.status === UserStatus.BANNED) {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(validatedData.password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    // Return user without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Вход выполнен успешно',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Ошибка валидации' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    );
  }
}
