'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, FileText, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const skills = [
  { id: 'active', label: 'Активный' },
  { id: 'communication', label: 'Общение' },
  { id: 'computer', label: 'ПК / IT' },
  { id: 'creative', label: 'Творчество' },
  { id: 'responsible', label: 'Ответственность' },
  { id: 'teamwork', label: 'Работа в команде' },
  { id: 'english', label: 'Английский язык' },
  { id: 'driving', label: 'Вождение' },
  { id: 'cooking', label: 'Готовка' },
  { id: 'tutoring', label: 'Репетиторство' },
];

const steps = [
  { id: 1, title: 'Аккаунт', description: 'Email и пароль' },
  { id: 2, title: 'Личные данные', description: 'Имя, возраст, город' },
  { id: 3, title: 'Согласие родителей', description: 'Подтверждение' },
  { id: 4, title: 'Навыки', description: 'Выберите навыки' },
];

const teenagerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string()
    .min(8, 'Пароль должен быть минимум 8 символов')
    .regex(/[A-Z]/, 'Пароль должен содержать заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать цифру'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Имя должно быть минимум 2 символа'),
  lastName: z.string().min(2, 'Фамилия должна быть минимум 2 символа'),
  birthDate: z.string().refine((val) => {
    const date = new Date(val);
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
      age--;
    }
    return age >= 14 && age <= 17;
  }, 'Возраст должен быть от 14 до 17 лет'),
  city: z.string().min(2, 'Укажите город'),
  district: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Выберите хотя бы один навык'),
  hasParentConsent: z.boolean().refine(val => val === true, 'Необходимо согласие родителей'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type TeenagerFormData = z.infer<typeof teenagerSchema>;

interface TeenagerRegisterFormProps {
  onRegisteringChange?: (isRegistering: boolean) => void;
}

export function TeenagerRegisterForm({ onRegisteringChange }: TeenagerRegisterFormProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const form = useForm<TeenagerFormData>({
    resolver: zodResolver(teenagerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      city: '',
      district: '',
      skills: [],
      hasParentConsent: false,
    },
    mode: 'onChange',
  });

  const toggleSkill = (skillId: string) => {
    const newSkills = selectedSkills.includes(skillId)
      ? selectedSkills.filter(s => s !== skillId)
      : [...selectedSkills, skillId];
    setSelectedSkills(newSkills);
    form.setValue('skills', newSkills);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    let fields: (keyof TeenagerFormData)[] = [];
    
    switch (step) {
      case 1:
        fields = ['email', 'password', 'confirmPassword'];
        break;
      case 2:
        fields = ['firstName', 'lastName', 'birthDate', 'city'];
        break;
      case 3:
        fields = ['hasParentConsent'];
        break;
      case 4:
        fields = ['skills'];
        break;
    }
    
    const result = await form.trigger(fields);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    onRegisteringChange?.(true);
    try {
      const data = form.getValues();
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          role: 'TEENAGER',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка регистрации');
      }

      setUser(result.user);
      setRegisteredName(`${data.firstName} ${data.lastName}`);
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
      router.push('/dashboard');
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.id}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-16 h-0.5 mx-2 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Step 1: Account */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@mail.ru" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Минимум 8 символов" {...field} />
                      </FormControl>
                      <FormDescription>
                        Минимум 8 символов, заглавная буква и цифра
                      </FormDescription>
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
            )}

            {/* Step 2: Personal Data */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Имя</FormLabel>
                        <FormControl>
                          <Input placeholder="Иван" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Фамилия</FormLabel>
                        <FormControl>
                          <Input placeholder="Иванов" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Дата рождения</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Возраст должен быть от 14 до 17 лет
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
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
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Район (необязательно)</FormLabel>
                        <FormControl>
                          <Input placeholder="ЦАО" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Parent Consent */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card className="border-primary/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-semibold">Согласие родителей</h4>
                          <p className="text-sm text-muted-foreground">
                            Для работы несовершеннолетним требуется согласие родителей или законных представителей 
                            согласно ст. 63 ТК РФ.
                          </p>
                        </div>
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="hasParentConsent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Я получил согласие родителей на поиск работы
                              </FormLabel>
                              <FormDescription>
                                Подтверждая, вы удостоверяете, что ваши родители знают о вашей регистрации 
                                на платформе и не против вашего трудоустройства.
                              </FormDescription>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <p className="text-sm text-muted-foreground text-center">
                  После регистрации вы сможете загрузить сканированное согласие в профиль 
                  для подтверждения.
                </p>
              </div>
            )}

            {/* Step 4: Skills */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Выберите ваши навыки</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Выберите навыки, которые описывают вас. Это поможет работодателям найти вас.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant={selectedSkills.includes(skill.id) ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2 text-sm"
                      onClick={() => toggleSkill(skill.id)}
                    >
                      {skill.label}
                    </Badge>
                  ))}
                </div>
                
                {form.formState.errors.skills && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.skills.message}
                  </p>
                )}
                
                <FormField
                  control={form.control}
                  name="skills"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Регистрация...
                  </>
                ) : currentStep === 4 ? (
                  'Завершить регистрацию'
                ) : (
                  <>
                    Далее
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
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
              Добро пожаловать, {registeredName}!
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              Ваш аккаунт успешно создан. Теперь вы можете искать работу!
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-500/10 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                  Загрузите согласие родителей
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Для отклика на вакансии необходимо загрузить скан согласия родителей 
                  в личном кабинете.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mt-2">
            <h5 className="font-medium text-sm mb-2">Что делать дальше?</h5>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                Заполните профиль и загрузите согласие родителей
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                Ищите подходящие вакансии
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                Откликайтесь и общайтесь с работодателями
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button
              className="w-full bg-gradient-to-r from-primary to-blue-600"
              onClick={() => handleModalClose(false)}
            >
              Перейти в личный кабинет
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/vacancies')}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Смотреть вакансии
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
