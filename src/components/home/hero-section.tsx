'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Briefcase, Shield, Sparkles, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container relative px-4 py-16 md:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <Badge variant="secondary" className="text-sm bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20">
              <Shield className="w-3 h-3 mr-1" />
              Безопасно
            </Badge>
            <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20">
              <Users className="w-3 h-3 mr-1" />
              10,000+ подростков
            </Badge>
            <Badge variant="secondary" className="text-sm bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
              <Briefcase className="w-3 h-3 mr-1" />
              5,000+ вакансий
            </Badge>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Найди свою первую{' '}
            <span className="text-primary">работу</span>
            <br />
            безопасно и легко
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
            TeenJob — платформа для подростков 14-17 лет, где можно найти проверенные вакансии 
            от надежных работодателей. Все вакансии проходят модерацию.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" asChild className="text-lg px-8 bg-gradient-to-r from-primary to-blue-600 hover:opacity-90">
              <Link href="/register">
                Начать поиск
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/vacancies">
                Смотреть вакансии
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl">
            <div className="bg-card rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <Users className="h-6 w-6 text-blue-500 mb-2" />
              <div className="text-2xl md:text-3xl font-bold">10K+</div>
              <div className="text-sm text-muted-foreground">Подростков</div>
            </div>
            <div className="bg-card rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <Briefcase className="h-6 w-6 text-purple-500 mb-2" />
              <div className="text-2xl md:text-3xl font-bold">5K+</div>
              <div className="text-sm text-muted-foreground">Вакансий</div>
            </div>
            <div className="bg-card rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <Sparkles className="h-6 w-6 text-green-500 mb-2" />
              <div className="text-2xl md:text-3xl font-bold">2K+</div>
              <div className="text-sm text-muted-foreground">Работодателей</div>
            </div>
            <div className="bg-card rounded-xl p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
              <div className="text-2xl md:text-3xl font-bold">98%</div>
              <div className="text-sm text-muted-foreground">Довольных</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
