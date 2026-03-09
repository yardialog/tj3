import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken, setAuthCookies, getUserWithProfile } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Try access token first
    if (accessToken) {
      const payload = await verifyAccessToken(accessToken);

      if (payload) {
        const user = await getUserWithProfile(payload.userId);

        if (user) {
          const { passwordHash: _, ...userWithoutPassword } = user;
          return NextResponse.json({ user: userWithoutPassword });
        }
      }
    }

    // Access token is invalid or expired, try refresh token
    if (refreshToken) {
      const payload = await verifyRefreshToken(refreshToken);

      if (payload) {
        const user = await getUserWithProfile(payload.userId);

        if (user) {
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

          const { passwordHash: _, ...userWithoutPassword } = user;
          return NextResponse.json({ user: userWithoutPassword });
        }
      }
    }

    // No valid tokens
    return NextResponse.json(
      { error: 'Не авторизован' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении данных пользователя' },
      { status: 500 }
    );
  }
}
