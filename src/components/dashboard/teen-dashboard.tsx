'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  MessageSquare, 
  FileCheck, 
  Star,
  ArrowRight,
  Clock,
  MapPin,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { VerificationStatus } from '@prisma/client';

interface Application {
  id: string;
  status: string;
  createdAt: string;
  vacancy: {
    id: string;
    title: string;
    city: string;
    employer: {
      companyName: string;
    };
  };
}

interface Vacancy {
  id: string;
  title: string;
  slug: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFixed: number | null;
  category: string;
  employer: {
    companyName: string;
  };
}

export function TeenDashboard() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendedVacancies, setRecommendedVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appsRes, vacanciesRes] = await Promise.all([
        fetch('/api/applications/my'),
        fetch('/api/vacancies?limit=3'),
      ]);
      
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }
      
      if (vacanciesRes.ok) {
        const vacanciesData = await vacanciesRes.json();
        setRecommendedVacancies(vacanciesData.vacancies || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.teenager) {
      return `${user.teenager.firstName[0]}${user.teenager.lastName[0]}`;
    }
    return 'U';
  };

  const getConsentStatusBadge = () => {
    const status = user?.teenager?.consentStatus;
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <Badge className="bg-green-500">Подтверждено</Badge>;
      case VerificationStatus.PENDING:
        return <Badge variant="secondary">На проверке</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge variant="destructive">Отклонено</Badge>;
      default:
        return <Badge variant="outline">Не загружено</Badge>;
    }
  };

  const formatSalary = (vacancy: Vacancy) => {
    if (vacancy.salaryFixed) {
      return `${vacancy.salaryFixed.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMin && vacancy.salaryMax) {
      return `${vacancy.salaryMin.toLocaleString('ru-RU')} - ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMin) {
      return `от ${vacancy.salaryMin.toLocaleString('ru-RU')} ₽`;
    }
    return 'По договоренности';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="secondary">Отправлен</Badge>;
      case 'VIEWED':
        return <Badge variant="outline">Просмотрен</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-500">Принят</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Отклонен</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-500">Завершен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const categoryLabels: Record<string, string> = {
    TUTORING: 'Репетиторство',
    IT: 'IT',
    PROMOTER: 'Промоутер',
    DELIVERY: 'Доставка',
    CLEANING: 'Уборка',
    ANIMATION: 'Аниматор',
    SERVICE: 'Сфера услуг',
    OTHER: 'Другое',
  };

  const skills = user?.teenager?.skills ? JSON.parse(user.teenager.skills as string) : [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">
                  Привет, {user?.teenager?.firstName}!
                </h1>
                <p className="text-muted-foreground">
                  {user?.teenager?.city}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skills.slice(0, 4).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Briefcase className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-xs text-muted-foreground">Откликов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <MessageSquare className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Сообщений</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Star className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{user?.teenager?.rating?.toFixed(1) || '0.0'}</div>
              <div className="text-xs text-muted-foreground">Рейтинг</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{user?.teenager?.completedJobs || 0}</div>
              <div className="text-xs text-muted-foreground">Работ</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Completion & Consent Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Согласие родителей
            </CardTitle>
            <CardDescription>
              Загрузите согласие для доступа к откликам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getConsentStatusBadge()}
                <span className="text-sm text-muted-foreground">
                  {user?.teenager?.consentStatus === VerificationStatus.VERIFIED 
                    ? 'Можно откликаться на вакансии' 
                    : 'Загрузите согласие в профиле'}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/profile">Загрузить</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3">
            <Button asChild>
              <Link href="/vacancies">
                <Briefcase className="mr-2 h-4 w-4" />
                Искать работу
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">
                Редактировать профиль
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Мои отклики</CardTitle>
            <CardDescription>Статус ваших откликов на вакансии</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applications">
              Все отклики
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет откликов</p>
              <Button className="mt-4" asChild>
                <Link href="/vacancies">Найти работу</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.vacancy.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.vacancy.employer.companyName} • {app.vacancy.city}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Vacancies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Рекомендуемые вакансии</CardTitle>
            <CardDescription>Подборка для вас</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vacancies">
              Все вакансии
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedVacancies.map((vacancy) => (
              <Link key={vacancy.id} href={`/vacancy/${vacancy.slug}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-4">
                    <Badge variant="secondary" className="mb-2">
                      {categoryLabels[vacancy.category] || vacancy.category}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2 mb-2">{vacancy.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {vacancy.city}
                      </div>
                      <div className="font-medium text-primary">
                        {formatSalary(vacancy)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
