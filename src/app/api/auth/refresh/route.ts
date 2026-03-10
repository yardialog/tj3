import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token не найден' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      // Clear invalid cookies
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { error: 'Недействительный refresh token' },
        { status: 401 }
      );
    }

    // Check if user still exists and is active
    const user = await db.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');

      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = await generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set new cookies
    await setAuthCookies(newAccessToken, newRefreshToken);

    return NextResponse.json({
      message: 'Токен обновлён',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении токена' },
      { status: 500 }
    );
  }
}
