import { db } from '@/lib/db';
import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcryptjs';
import { UserRole, UserStatus, VerificationStatus } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'teenjob-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'teenjob-refresh-secret-change-in-production';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

// Generate access token
export async function generateAccessToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);
}

// Generate refresh token
export async function generateRefreshToken(payload: JWTPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secret);
}

// Verify access token
export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Verify refresh token
export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_REFRESH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

// Set auth cookies
export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });
  
  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

// Clear auth cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

// Get current user from cookies
export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  
  if (!accessToken) {
    return null;
  }
  
  return verifyAccessToken(accessToken);
}

// Get user with profile from database
export async function getUserWithProfile(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      teenager: true,
      employer: true,
    },
  });
  
  return user;
}

// Calculate age from birth date
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Validate teenager age (14-17 years)
export function validateTeenagerAge(birthDate: Date): { valid: boolean; message: string } {
  const age = calculateAge(birthDate);
  
  if (age < 14) {
    return { valid: false, message: 'Регистрация доступна только с 14 лет' };
  }
  
  if (age > 17) {
    return { valid: false, message: 'Платформа предназначена для подростков 14-17 лет' };
  }
  
  return { valid: true, message: '' };
}

// Validate INN (Russian Individual Taxpayer Number)
export function validateINN(inn: string): { valid: boolean; message: string } {
  const cleanInn = inn.replace(/\D/g, '');
  
  if (cleanInn.length !== 10 && cleanInn.length !== 12) {
    return { valid: false, message: 'ИНН должен содержать 10 или 12 цифр' };
  }
  
  // Basic checksum validation for 10-digit INN (companies)
  if (cleanInn.length === 10) {
    const weights = [2, 4, 10, 3, 5, 9, 4, 6, 8];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanInn[i]) * weights[i];
    }
    const checkDigit = (sum % 11) % 10;
    if (checkDigit !== parseInt(cleanInn[9])) {
      return { valid: false, message: 'Неверный ИНН' };
    }
  }
  
  return { valid: true, message: '' };
}

// Create slug from title
export function createSlug(title: string): string {
  if (!title || title.trim().length === 0) {
    return 'vacancy';
  }
  
  const transliteration: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
    'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
    'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
    'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'H', 'Ц': 'C', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '',
    'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
  };
  
  let slug = title.toLowerCase();
  
  // Transliterate Russian characters
  for (const [ru, en] of Object.entries(transliteration)) {
    slug = slug.replace(new RegExp(ru, 'g'), en);
  }
  
  // Replace spaces and special characters
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  
  // If slug is empty after processing, generate a default
  if (!slug || slug.trim().length === 0) {
    slug = 'vacancy';
  }
  
  return slug;
}

// Generate unique slug
export async function generateUniqueSlug(title: string): Promise<string> {
  let baseSlug = createSlug(title);
  
  // Ensure baseSlug is not empty
  if (!baseSlug || baseSlug.trim().length === 0) {
    baseSlug = 'vacancy';
  }
  
  let slug = baseSlug;
  let counter = 1;
  
  try {
    while (await db.vacancy.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  } catch (error) {
    console.error('Error checking slug uniqueness:', error);
    // Return a unique slug with timestamp if DB check fails
    return `${baseSlug}-${Date.now()}`;
  }
  
  return slug;
}

// Check profanity in text
export async function containsProfanity(text: string): Promise<boolean> {
  const bannedWords = await db.bannedWord.findMany();
  const lowerText = text.toLowerCase();
  
  for (const { word } of bannedWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

// Mask contact info in text
export function maskContactInfo(text: string): string {
  // Mask phone numbers
  text = text.replace(
    /(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/g,
    '[телефон скрыт]'
  );
  
  // Mask emails
  text = text.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    '[email скрыт]'
  );
  
  // Mask common social media patterns
  text = text.replace(
    /(?:vk\.com|instagram\.com|t\.me|telegram\.me)\/[a-zA-Z0-9_]+/gi,
    '[соц. сеть скрыта]'
  );
  
  return text;
}
