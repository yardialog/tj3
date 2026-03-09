import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, Users, Shield, Star, Zap } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Все работодатели проходят верификацию. Вакансии модерируются.',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Target,
    title: 'Точный поиск',
    description: 'Фильтры по возрасту, категории, графику и местоположению.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Users,
    title: 'Поддержка',
    description: 'Помощь в спорных ситуациях и консультации по трудовым вопросам.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Heart,
    title: 'Забота',
    description: 'Согласие родителей, защита персональных данных по 152-ФЗ.',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            О проекте TeenJob
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы создали платформу, которая помогает подросткам найти безопасную работу 
            и получить первый опыт
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow text-center">
              <CardContent className="p-6">
                <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl p-6 md:p-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Наша миссия
              </h3>
              <p className="text-muted-foreground mb-4">
                Мы верим, что первый опыт работы формирует ответственное отношение к труду 
                и помогает подросткам определиться с будущей профессией. TeenJob — это мост 
                между амбициозными молодыми людьми и ответственными работодателями.
              </p>
              <p className="text-muted-foreground">
                Платформа создана при поддержке профильных министерств и соответствует 
                всем требованиям российского законодательства о труде несовершеннолетних.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">4.9 рейтинг</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Быстрый старт</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-xl p-6 text-center border-0 shadow-sm">
                <div className="text-4xl font-bold text-primary mb-2">2024</div>
                <p className="text-sm text-muted-foreground">Год запуска</p>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border-0 shadow-sm">
                <div className="text-4xl font-bold text-blue-500 mb-2">50+</div>
                <p className="text-sm text-muted-foreground">Городов</p>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border-0 shadow-sm">
                <div className="text-4xl font-bold text-purple-500 mb-2">8</div>
                <p className="text-sm text-muted-foreground">Категорий</p>
              </div>
              <div className="bg-card rounded-xl p-6 text-center border-0 shadow-sm">
                <div className="text-4xl font-bold text-green-500 mb-2">24/7</div>
                <p className="text-sm text-muted-foreground">Поддержка</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
