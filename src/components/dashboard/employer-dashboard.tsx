'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Briefcase, 
  MessageSquare, 
  Users,
  Plus,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { VerificationStatus } from '@prisma/client';

interface Vacancy {
  id: string;
  title: string;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  city: string;
}

interface Application {
  id: string;
  status: string;
  createdAt: string;
  teenager: {
    firstName: string;
    city: string;
  };
  vacancy: {
    title: string;
  };
}

export function EmployerDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vacanciesRes, appsRes] = await Promise.all([
        fetch('/api/vacancies/my'),
        fetch('/api/applications/incoming'),
      ]);
      
      if (vacanciesRes.ok) {
        const data = await vacanciesRes.json();
        setVacancies(data.vacancies || []);
      }
      
      if (appsRes.ok) {
        const data = await appsRes.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (user?.employer) {
      return user.employer.companyName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getVerificationBadge = () => {
    const status = user?.employer?.verificationStatus;
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <Badge className="bg-green-500">Верифицирован</Badge>;
      case VerificationStatus.PENDING:
        return <Badge variant="secondary">На проверке</Badge>;
      default:
        return <Badge variant="outline">Не верифицирован</Badge>;
    }
  };

  const getVacancyStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Активна</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Черновик</Badge>;
      case 'ON_MODERATION':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">На модерации</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Отклонена</Badge>;
      case 'ARCHIVED':
        return <Badge variant="outline" className="border-gray-400 text-gray-500">В архиве</Badge>;
      case 'CLOSED':
        return <Badge variant="outline" className="border-red-400 text-red-500">Закрыта</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return <Badge variant="secondary">Новый</Badge>;
      case 'VIEWED':
        return <Badge variant="outline">Просмотрен</Badge>;
      case 'ACCEPTED':
        return <Badge className="bg-green-500">Принят</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Отклонен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeVacancies = vacancies.filter(v => v.status === 'ACTIVE').length;
  const maxVacancies = 5;

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
                <AvatarImage src={user?.employer?.logoUrl || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user?.employer?.companyName}</h1>
                  {getVerificationBadge()}
                </div>
                <p className="text-muted-foreground">
                  {user?.employer?.city}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ИНН: {user?.employer?.inn}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Briefcase className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{activeVacancies}/{maxVacancies}</div>
              <div className="text-xs text-muted-foreground">Вакансий</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Users className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{applications.length}</div>
              <div className="text-xs text-muted-foreground">Откликов</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Eye className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">
                {vacancies.reduce((sum, v) => sum + v.viewsCount, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Просмотров</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto text-primary mb-1" />
              <div className="text-2xl font-bold">{user?.employer?.rating?.toFixed(1) || '0.0'}</div>
              <div className="text-xs text-muted-foreground">Рейтинг</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button className="h-auto py-6 flex-col gap-2" asChild>
          <Link href="/vacancies/create">
            <Plus className="h-6 w-6" />
            <span>Создать вакансию</span>
            <span className="text-xs opacity-80">
              {activeVacancies}/{maxVacancies} активно
            </span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
          <Link href="/applications">
            <Users className="h-6 w-6" />
            <span>Отклики</span>
            <span className="text-xs opacity-80">
              {applications.filter(a => a.status === 'SENT').length} новых
            </span>
          </Link>
        </Button>
        <Button variant="outline" className="h-auto py-6 flex-col gap-2" asChild>
          <Link href="/messages">
            <MessageSquare className="h-6 w-6" />
            <span>Сообщения</span>
            <span className="text-xs opacity-80">Чаты с кандидатами</span>
          </Link>
        </Button>
      </div>

      {/* My Vacancies */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Мои вакансии</CardTitle>
            <CardDescription>Управление вашими вакансиями</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vacancies/my">
              Все вакансии
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vacancies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>У вас пока нет вакансий</p>
              <Button className="mt-4" asChild>
                <Link href="/vacancies/create">Создать вакансию</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {vacancies.slice(0, 5).map((vacancy) => (
                <div key={vacancy.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{vacancy.title}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {vacancy.viewsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vacancy.applicationsCount}
                      </span>
                      <span>{vacancy.city}</span>
                    </div>
                  </div>
                  {getVacancyStatusBadge(vacancy.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Последние отклики</CardTitle>
            <CardDescription>Кандидаты на ваши вакансии</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Пока нет откликов</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{app.teenager.firstName}</p>
                    <p className="text-sm text-muted-foreground">
                      {app.vacancy.title} • {app.teenager.city}
                    </p>
                  </div>
                  {getApplicationStatusBadge(app.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
