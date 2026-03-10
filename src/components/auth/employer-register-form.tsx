'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Building2, CheckCircle2, Hourglass, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const employerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string()
    .min(8, 'Пароль должен быть минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Название компании должно быть минимум 2 символа'),
  inn: z.string()
    .regex(/^\d{10}$/, 'ИНН должен содержать 10 цифр для юрлиц или 12 для ИП')
    .or(z.string().regex(/^\d{12}$/, 'ИНН должен содержать 10 цифр для юрлиц или 12 для ИП')),
  city: z.string().min(2, 'Укажите город'),
  website: z.string().url('Неверный формат URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Описание не более 500 символов').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type EmployerFormData = z.infer<typeof employerSchema>;

interface EmployerRegisterFormProps {
  onRegisteringChange?: (isRegistering: boolean) => void;
}

export function EmployerRegisterForm({ onRegisteringChange }: EmployerRegisterFormProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredCompany, setRegisteredCompany] = useState('');

  const form = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      companyName: '',
      inn: '',
      city: '',
      website: '',
      description: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: EmployerFormData) => {
    setIsLoading(true);
    onRegisteringChange?.(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          role: 'EMPLOYER',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка регистрации');
      }

      setUser(result.user);
      setRegisteredCompany(data.companyName);
      setShowSuccessModal(true);
    } catch (error) {
      onRegisteringChange?.(false);
      toast.error(error instanceof Error ? error.message : 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    setShowSuccessModal(open);
    if (!open) {
      onRegisteringChange?.(false);
      router.push('/dashboard/employer');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="border-primary/50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Регистрация работодателя</h4>
                <p className="text-sm text-muted-foreground">
                  После регистрации ваша компания пройдет верификацию по ИНН. 
                  Это займет 1-2 рабочих дня.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Section */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-medium">Данные аккаунта</h3>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="company@mail.ru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Минимум 8 символов" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Подтвердите пароль</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Повторите пароль" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Company Section */}
            <div className="space-y-4 pb-4 border-b">
              <h3 className="font-medium">Информация о компании</h3>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название компании</FormLabel>
                    <FormControl>
                      <Input placeholder="ООО Ромашка" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="inn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ИНН</FormLabel>
                    <FormControl>
                      <Input placeholder="1234567890" maxLength={12} {...field} />
                    </FormControl>
                    <FormDescription>
                      10 цифр для юридических лиц, 12 цифр для ИП
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Город</FormLabel>
                    <FormControl>
                      <Input placeholder="Уфа" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Сайт (необязательно)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://company.ru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>О компании (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Расскажите о вашей компании..." 
                        className="resize-none"
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 символов
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Requirements Info */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="text-muted-foreground">
                  <p className="font-medium text-foreground">Требования для размещения вакансий:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Верификация компании по ИНН</li>
                    <li>Не более 5 активных вакансий на компанию</li>
                    <li>Модерация всех вакансий перед публикацией</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-xl">
              Регистрация успешна!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              <strong>{registeredCompany}</strong> успешно зарегистрирована.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-amber-500/10 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Hourglass className="h-5 w-5 text-amber-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                  Верификация компании
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Ваша компания находится на проверке. Мы проверим ИНН и данные компании.
                  Обычно это занимает <strong>1-2 рабочих дня</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mt-2">
            <h5 className="font-medium text-sm mb-2">Что делать дальше?</h5>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Дождитесь верификации компании
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Создайте вакансии для подростков
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Получайте отклики и общайтесь с кандидатами
              </li>
            </ul>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-blue-600 mt-4"
            onClick={() => handleModalClose(false)}
          >
            Перейти в личный кабинет
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
