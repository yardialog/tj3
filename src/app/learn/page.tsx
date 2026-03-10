import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  FileText,
  Target,
  Shield,
  MessageSquare,
  Clock,
  ArrowRight,
  BookOpen,
  Star,
  CheckCircle,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';

const courses = [
  {
    id: 'how-to-use-site',
    title: 'Как пользоваться TeenJob',
    description: 'Полное руководство по поиску работы на платформе: от регистрации до трудоустройства. Освойте все функции платформы.',
    duration: '45 мин',
    level: 'Начинающий',
    category: 'Платформа',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    lessons: 8,
    popular: true,
  },
  {
    id: 'how-to-write-resume',
    title: 'Как составить резюме',
    description: 'Научитесь создавать эффективное резюме, которое привлечёт внимание работодателей. Даже без опыта работы!',
    duration: '50 мин',
    level: 'Начинающий',
    category: 'Карьера',
    icon: FileText,
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    lessons: 10,
    popular: true,
  },
  {
    id: 'find-your-job',
    title: 'Какая работа тебе подходит',
    description: 'Пройдите тест и узнайте, какие профессии и вакансии лучше всего соответствуют вашим интересам и навыкам.',
    duration: '60 мин',
    level: 'Начинающий',
    category: 'Профориентация',
    icon: Target,
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    lessons: 9,
    popular: true,
  },
  {
    id: 'interview-tips',
    title: 'Как пройти собеседование',
    description: 'Полное руководство по подготовке к собеседованию: от внешнего вида до ответов на сложные вопросы.',
    duration: '70 мин',
    level: 'Средний',
    category: 'Карьера',
    icon: MessageSquare,
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    lessons: 12,
    popular: false,
  },
  {
    id: 'first-job-rights',
    title: 'Права несовершеннолетнего работника',
    description: 'Всё о трудовых правах подростков: возраст, рабочий день, зарплата, отпуск, защита прав по ТК РФ.',
    duration: '55 мин',
    level: 'Важное',
    category: 'Права',
    icon: Shield,
    color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    lessons: 10,
    popular: false,
  },
  {
    id: 'financial-literacy',
    title: 'Финансовая грамотность',
    description: 'Учимся правильно распоряжаться первым заработком: копить, тратить с умом, защищаться от мошенников.',
    duration: '60 мин',
    level: 'Начинающий',
    category: 'Финансы',
    icon: GraduationCap,
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    lessons: 10,
    popular: false,
  },
];

const categories = [
  { name: 'Все', count: courses.length },
  { name: 'Платформа', count: courses.filter(c => c.category === 'Платформа').length },
  { name: 'Карьера', count: courses.filter(c => c.category === 'Карьера').length },
  { name: 'Профориентация', count: courses.filter(c => c.category === 'Профориентация').length },
  { name: 'Права', count: courses.filter(c => c.category === 'Права').length },
  { name: 'Финансы', count: courses.filter(c => c.category === 'Финансы').length },
];

const stats = [
  { value: '6', label: 'Курсов', icon: BookOpen },
  { value: '59', label: 'Уроков', icon: GraduationCap },
  { value: '6.5ч', label: 'Обучения', icon: Clock },
  { value: 'Бесплатно', label: 'Навсегда', icon: Award },
];

const benefits = [
  {
    icon: TrendingUp,
    title: 'Найти работу быстрее',
    description: 'Грамотное резюме и подготовка к собеседованию увеличат ваши шансы в 3 раза.',
    color: 'bg-green-500/10 text-green-500'
  },
  {
    icon: Shield,
    title: 'Избежать ошибок',
    description: 'Узнайте о подводных камнях первой работы и как их избежать до трудоустройства.',
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    icon: Target,
    title: 'Выбрать профессию',
    description: 'Тесты на профориентацию помогут понять, какая работа вам подходит лучше всего.',
    color: 'bg-purple-500/10 text-purple-500'
  },
  {
    icon: Users,
    title: 'Знать свои права',
    description: 'Разберитесь в ТК РФ и научитесь защищать свои права как работник-подросток.',
    color: 'bg-orange-500/10 text-orange-500'
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background">
          <div className="container px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-purple-500/10 text-purple-600" variant="secondary">
                <GraduationCap className="h-3 w-3 mr-1" />
                Обучение
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Учись находить{' '}
                <span className="text-primary">работу мечты</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Бесплатные курсы для подростков: от первого резюме до успешного трудоустройства. 
                Всё, что нужно знать о работе — в одном месте.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mt-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="border-0 shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur">
                    <CardContent className="p-4 text-center">
                      <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Popular Courses */}
        <section className="py-12">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Популярные курсы</h2>
                <p className="text-muted-foreground">Начните с этих курсов для быстрого старта</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.filter(c => c.popular).map((course) => {
                const Icon = course.icon;
                return (
                  <Card key={course.id} className="border-0 shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-xl ${course.color} flex items-center justify-center`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Star className="h-3 w-3 mr-1 fill-primary" />
                          Популярный
                        </Badge>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.lessons} уроков
                        </span>
                      </div>

                      <Button asChild className="w-full bg-gradient-to-r from-primary to-blue-600 group-hover:opacity-90">
                        <Link href={`/learn/${course.id}`}>
                          Начать обучение
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* All Courses */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Все курсы</h2>
                <p className="text-muted-foreground">Выберите интересующий вас курс</p>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    index === 0
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white dark:bg-slate-800 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const Icon = course.icon;
                return (
                  <Link key={course.id} href={`/learn/${course.id}`}>
                    <Card className="border-0 shadow-sm hover:shadow-lg transition-all group cursor-pointer bg-white dark:bg-slate-900 h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl ${course.color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {course.level}
                          </Badge>
                        </div>
                        
                        <Badge variant="secondary" className="mb-2 text-xs">
                          {course.category}
                        </Badge>
                        
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {course.lessons}
                            </span>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Learn Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Зачем учиться?</h2>
                <p className="text-muted-foreground">Наши курсы помогут вам стать успешнее</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{benefit.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Course Features */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Что внутри курсов?</h2>
                <p className="text-muted-foreground">Структурированный контент для эффективного обучения</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Пошаговые уроки</h3>
                    <p className="text-sm text-muted-foreground">
                      Каждый курс разбит на логические уроки с конкретными целями
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Чек-листы</h3>
                    <p className="text-sm text-muted-foreground">
                      Готовые списки действий для проверки и применения знаний
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                      <Award className="h-6 w-6 text-purple-500" />
                    </div>
                    <h3 className="font-semibold mb-2">Примеры</h3>
                    <p className="text-sm text-muted-foreground">
                      Реальные примеры резюме, откликов, ответов на собеседовании
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 bg-gradient-to-r from-purple-500 to-primary text-white">
                <CardContent className="p-8 md:p-12 text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Начните учиться прямо сейчас
                  </h2>
                  <p className="text-white/80 mb-8 max-w-xl mx-auto">
                    Все курсы полностью бесплатны. Пройдите их в удобное время и найдите первую работу быстрее!
                  </p>
                  <Button asChild size="lg" variant="secondary" className="text-primary">
                    <Link href="/register?role=teenager">
                      Зарегистрироваться бесплатно
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
