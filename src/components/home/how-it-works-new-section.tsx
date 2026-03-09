'use client';

import { GraduationCap, Building2, Search, Send, CheckCircle, Briefcase, Users, FileCheck } from 'lucide-react';

const howItWorksTeen = [
  {
    step: 1,
    title: 'Зарегистрируйся',
    description: 'Создай профиль и укажи свои навыки и интересы',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    step: 2,
    title: 'Найди вакансию',
    description: 'Используй фильтры для поиска подходящей работы рядом с домом',
    icon: Search,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    step: 3,
    title: 'Откликнись',
    description: 'Отправь отклик и дождись ответа работодателя',
    icon: Send,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    step: 4,
    title: 'Начни работать',
    description: 'Пройди собеседование и получи первую работу',
    icon: CheckCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

const howItWorksEmployer = [
  {
    step: 1,
    title: 'Зарегистрируй компанию',
    description: 'Пройди верификацию по ИНН для подтверждения компании',
    icon: Building2,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
  {
    step: 2,
    title: 'Создай вакансию',
    description: 'Опиши требования и условия работы для подростков',
    icon: Briefcase,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    step: 3,
    title: 'Выбери кандидата',
    description: 'Рассмотри отклики и проведи собеседование',
    icon: Users,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    step: 4,
    title: 'Найми сотрудника',
    description: 'Оформи отношения и начни сотрудничество',
    icon: FileCheck,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
];

export function HowItWorksNewSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Как это работает</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Простой и безопасный путь к первой работе
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* For Teens */}
          <div className="bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold">Для подростков</h3>
            </div>
            <div className="space-y-4">
              {howItWorksTeen.map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Employers */}
          <div className="bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold">Для работодателей</h3>
            </div>
            <div className="space-y-4">
              {howItWorksEmployer.map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
