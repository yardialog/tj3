'use client';

import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { UserRound, Building2, FileSearch, MessageCircle, CheckCircle2 } from 'lucide-react';

const teenSteps = [
  {
    icon: UserRound,
    title: 'Зарегистрируйся',
    description: 'Создай профиль и укажи свои навыки',
  },
  {
    icon: FileSearch,
    title: 'Найди вакансию',
    description: 'Используй фильтры для поиска подходящей работы',
  },
  {
    icon: MessageCircle,
    title: 'Откликнись',
    description: 'Отправь отклик и дождись ответа работодателя',
  },
  {
    icon: CheckCircle2,
    title: 'Начни работать',
    description: 'Получи первый опыт и заработок',
  },
];

const employerSteps = [
  {
    icon: Building2,
    title: 'Зарегистрируй компанию',
    description: 'Пройди верификацию по ИНН',
  },
  {
    icon: FileSearch,
    title: 'Создай вакансию',
    description: 'Опиши требования и условия работы',
  },
  {
    icon: MessageCircle,
    title: 'Выбери кандидата',
    description: 'Рассмотри отклики и проведи собеседование',
  },
  {
    icon: CheckCircle2,
    title: 'Найми сотрудника',
    description: 'Оформи отношения и начни сотрудничество',
  },
];

export function HowItWorksSection() {
  const { user } = useAuthStore();
  const isEmployer = user?.role === 'EMPLOYER';
  const steps = isEmployer ? employerSteps : teenSteps;

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Как это работает?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {isEmployer 
              ? 'Найдите ответственных молодых сотрудников за 4 простых шага'
              : 'Найди свою первую работу за 4 простых шага'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="pt-6 text-center">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
              {/* Arrow between cards (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-muted-foreground/20" />
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
