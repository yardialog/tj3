'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Code, 
  Megaphone, 
  Bike, 
  Sparkles, 
  Coffee, 
  Briefcase,
  MoreHorizontal 
} from 'lucide-react';

const categories = [
  {
    id: 'TUTORING',
    name: 'Репетиторство',
    icon: GraduationCap,
    count: 156,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    hoverBg: 'group-hover:bg-blue-500/20',
  },
  {
    id: 'IT',
    name: 'IT',
    icon: Code,
    count: 243,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    hoverBg: 'group-hover:bg-purple-500/20',
  },
  {
    id: 'PROMOTER',
    name: 'Промоутер',
    icon: Megaphone,
    count: 189,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    hoverBg: 'group-hover:bg-orange-500/20',
  },
  {
    id: 'DELIVERY',
    name: 'Доставка',
    icon: Bike,
    count: 134,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    hoverBg: 'group-hover:bg-green-500/20',
  },
  {
    id: 'ANIMATION',
    name: 'Аниматор',
    icon: Sparkles,
    count: 87,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    hoverBg: 'group-hover:bg-pink-500/20',
  },
  {
    id: 'SERVICE',
    name: 'Сфера услуг',
    icon: Coffee,
    count: 201,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    hoverBg: 'group-hover:bg-amber-500/20',
  },
  {
    id: 'CLEANING',
    name: 'Уборка',
    icon: Briefcase,
    count: 95,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    hoverBg: 'group-hover:bg-cyan-500/20',
  },
  {
    id: 'OTHER',
    name: 'Другое',
    icon: MoreHorizontal,
    count: 112,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    hoverBg: 'group-hover:bg-slate-500/20',
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Популярные категории</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Выбери направление, которое тебе интересно
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/vacancies?category=${category.id}`}>
              <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 rounded-full ${category.bgColor} ${category.hoverBg} flex items-center justify-center mx-auto mb-4 transition-colors`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} вакансий</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
