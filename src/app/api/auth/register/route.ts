import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateAccessToken, generateRefreshToken, setAuthCookies, validateTeenagerAge, validateINN } from '@/lib/auth';
import { UserRole, VerificationStatus } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const teenagerRegisterSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль должен быть минимум 8 символов'),
  role: z.literal('TEENAGER'),
  firstName: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна быть минимум 2 символа'),
  birthDate: z.string(),
  city: z.string().min(2, 'Укажите город'),
  district: z.string().optional(),
  skills: z.array(z.string()).optional(),
  hasParentConsent: z.boolean().refine(val => val === true, 'Необходимо согласие родителей'),
});

const employerRegisterSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль должен быть минимум 8 символов'),
  role: z.literal('EMPLOYER'),
  companyName: z.string().min(2, 'Название компании должно быть минимум 2 символа'),
  inn: z.string(),
  city: z.string().min(2, 'Укажите город'),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, ...data } = body;

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    let user;

    if (role === 'TEENAGER') {
      // Validate teenager data
      const validatedData = teenagerRegisterSchema.parse(body);
      
      // Validate age
      const birthDate = new Date(validatedData.birthDate);
      const ageValidation = validateTeenagerAge(birthDate);
      
      if (!ageValidation.valid) {
        return NextResponse.json(
          { error: ageValidation.message },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password);

      // Create user with teenager profile
      user = await db.user.create({
        data: {
          email: validatedData.email,
          passwordHash,
          role: UserRole.TEENAGER,
          teenager: {
            create: {
              firstName: validatedData.firstName,
              lastName: validatedData.lastName,
              birthDate,
              city: validatedData.city,
              district: validatedData.district || null,
              skills: JSON.stringify(validatedData.skills || []),
              hasParentConsent: validatedData.hasParentConsent,
              consentStatus: VerificationStatus.NOT_UPLOADED,
            },
          },
        },
        include: {
          teenager: true,
        },
      });
    } else if (role === 'EMPLOYER') {
      // Validate employer data
      const validatedData = employerRegisterSchema.parse(body);
      
      // Validate INN
      const innValidation = validateINN(validatedData.inn);
      if (!innValidation.valid) {
        return NextResponse.json(
          { error: innValidation.message },
          { status: 400 }
        );
      }

      // Check if INN already exists
      const existingInn = await db.employerProfile.findFirst({
        where: { inn: validatedData.inn },
      });

      if (existingInn) {
        return NextResponse.json(
          { error: 'Компания с таким ИНН уже зарегистрирована' },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await hashPassword(validatedData.password);

      // Create user with employer profile
      user = await db.user.create({
        data: {
          email: validatedData.email,
          passwordHash,
          role: UserRole.EMPLOYER,
          employer: {
            create: {
              companyName: validatedData.companyName,
              inn: validatedData.inn,
              city: validatedData.city,
              website: validatedData.website || null,
              description: validatedData.description || null,
              verificationStatus: VerificationStatus.NOT_UPLOADED,
            },
          },
        },
        include: {
          employer: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Неверная роль' },
        { status: 400 }
      );
    }

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
      message: 'Регистрация успешна',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors);
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Ошибка валидации' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
