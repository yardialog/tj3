'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Briefcase,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Building2,
  Clock,
  BarChart3,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { toast } from 'sonner';

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

interface Stats {
  users: {
    total: number;
    teenagers: number;
    employers: number;
    recent: number;
  };
  vacancies: {
    total: number;
    active: number;
    pending: number;
    rejected: number;
    recent: number;
  };
  applications: {
    total: number;
  };
  consents: {
    pending: number;
    verified: number;
  };
  employers: {
    pending: number;
  };
  reports: {
    total: number;
    pending: number;
  };
  charts: {
    registrationsByDay: { date: string; count: number }[];
    vacanciesByCategory: { category: string; count: number }[];
  };
}

interface Vacancy {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  salaryFixed: number | null;
  salaryMin: number | null;
  salaryMax: number | null;
  createdAt: string;
  employer: {
    id: string;
    companyName: string;
    inn: string;
    verificationStatus: string;
  };
}

interface ConsentRequest {
  id: string;
  firstName: string;
  lastName: string;
  city: string;
  consentDocumentUrl: string | null;
  consentUploadedAt: string | null;
  createdAt: string;
  user: {
    email: string;
  };
}

interface EmployerRequest {
  id: string;
  companyName: string;
  inn: string;
  city: string;
  website: string | null;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [consents, setConsents] = useState<ConsentRequest[]>([]);
  const [employers, setEmployers] = useState<EmployerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedVacancyId, setSelectedVacancyId] = useState<string | null>(null);
  const [rejectEmployerDialogOpen, setRejectEmployerDialogOpen] = useState(false);
  const [selectedEmployerId, setSelectedEmployerId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchData();
    }
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, vacanciesRes, consentsRes, employersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/vacancies'),
        fetch('/api/admin/consents'),
        fetch('/api/admin/employers'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }

      if (vacanciesRes.ok) {
        const data = await vacanciesRes.json();
        setVacancies(data.vacancies || []);
      }

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(data.consents || []);
      }

      if (employersRes.ok) {
        const data = await employersRes.json();
        setEmployers(data.employers || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVacancy = async (vacancyId: string) => {
    try {
      const response = await fetch(`/api/admin/vacancies/${vacancyId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ошибка при одобрении');
      }

      toast.success('Вакансия одобрена');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при одобрении вакансии');
    }
  };

  const handleRejectVacancy = async () => {
    if (!selectedVacancyId || !rejectReason.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    try {
      const response = await fetch(`/api/admin/vacancies/${selectedVacancyId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отклонении');
      }

      toast.success('Вакансия отклонена');
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedVacancyId(null);
      fetchData();
    } catch (error) {
      toast.error('Ошибка при отклонении вакансии');
    }
  };

  const handleApproveConsent = async (teenagerId: string) => {
    try {
      const response = await fetch(`/api/admin/consents/${teenagerId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ошибка при одобрении');
      }

      toast.success('Согласие подтверждено');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при подтверждении согласия');
    }
  };

  const handleRejectConsent = async (teenagerId: string) => {
    try {
      const response = await fetch(`/api/admin/consents/${teenagerId}/reject`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ошибка при отклонении');
      }

      toast.success('Согласие отклонено');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при отклонении согласия');
    }
  };

  const handleApproveEmployer = async (employerId: string) => {
    try {
      const response = await fetch(`/api/admin/employers/${employerId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Ошибка при одобрении');
      }

      toast.success('Работодатель верифицирован');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при верификации работодателя');
    }
  };

  const handleRejectEmployer = async () => {
    if (!selectedEmployerId || !rejectReason.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }

    try {
      const response = await fetch(`/api/admin/employers/${selectedEmployerId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отклонении');
      }

      toast.success('Работодатель отклонен');
      setRejectEmployerDialogOpen(false);
      setRejectReason('');
      setSelectedEmployerId(null);
      fetchData();
    } catch (error) {
      toast.error('Ошибка при отклонении работодателя');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatSalary = (vacancy: Vacancy) => {
    if (vacancy.salaryFixed) {
      return `${vacancy.salaryFixed.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMin && vacancy.salaryMax) {
      return `${vacancy.salaryMin.toLocaleString('ru-RU')} - ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`;
    }
    return 'По договоренности';
  };

  if (authLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Админ-панель</h1>
              <p className="text-muted-foreground">Модерация и управление платформой</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Пользователей</p>
                        <p className="text-2xl font-bold">{stats?.users.total || 0}</p>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +{stats?.users.recent || 0} за неделю
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Вакансий</p>
                        <p className="text-2xl font-bold">{stats?.vacancies.total || 0}</p>
                        <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                          <ArrowUpRight className="h-3 w-3" />
                          +{stats?.vacancies.recent || 0} за неделю
                        </p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Откликов</p>
                        <p className="text-2xl font-bold">{stats?.applications.total || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Всего</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Жалоб</p>
                        <p className="text-2xl font-bold">{stats?.reports.pending || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">На рассмотрении</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-orange-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* User Stats */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-500" />
                      Подростки
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{stats?.users.teenagers || 0}</div>
                    <p className="text-sm text-muted-foreground">
                      Согласий проверено: {stats?.consents.verified || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      Работодатели
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">{stats?.users.employers || 0}</div>
                    <p className="text-sm text-muted-foreground">
                      Активных вакансий: {stats?.vacancies.active || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      На модерации
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-2xl font-bold">{stats?.vacancies.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">Вакансий</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats?.consents.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">Согласий</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats?.employers.pending || 0}</div>
                        <p className="text-xs text-muted-foreground">Работодателей</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Moderation Tabs */}
              <Tabs defaultValue="employers" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 max-w-lg">
                  <TabsTrigger value="employers" className="relative">
                    Работодатели
                    {(stats?.employers.pending || 0) > 0 && (
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-600">
                        {stats?.employers.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="vacancies" className="relative">
                    Вакансии
                    {(stats?.vacancies.pending || 0) > 0 && (
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-600">
                        {stats?.vacancies.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="consents" className="relative">
                    Согласия
                    {(stats?.consents.pending || 0) > 0 && (
                      <Badge className="ml-2 bg-yellow-500/10 text-yellow-600">
                        {stats?.consents.pending}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="stats">Статистика</TabsTrigger>
                </TabsList>

                {/* Employers Moderation */}
                <TabsContent value="employers">
                  {employers.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Нет работодателей на проверке</p>
                        <p className="text-sm text-muted-foreground">Все работодатели верифицированы</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {employers.map((employer) => (
                        <Card key={employer.id} className="border-0 shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm font-medium">
                                    {employer.companyName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{employer.companyName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      ИНН: {employer.inn} • {employer.city}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Email: {employer.user.email}
                                    </p>
                                  </div>
                                </div>
                                {employer.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {employer.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 text-sm">
                                  {employer.website && (
                                    <Badge variant="outline" className="text-blue-600">
                                      <a href={employer.website} target="_blank" rel="noopener noreferrer">
                                        {employer.website}
                                      </a>
                                    </Badge>
                                  )}
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(employer.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                                  onClick={() => handleApproveEmployer(employer.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Верифицировать
                                </Button>
                                <Dialog open={rejectEmployerDialogOpen && selectedEmployerId === employer.id} onOpenChange={(open) => {
                                  setRejectEmployerDialogOpen(open);
                                  if (open) setSelectedEmployerId(employer.id);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Отклонить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Отклонить работодателя</DialogTitle>
                                      <DialogDescription>
                                        Укажите причину отклонения. Это сообщение будет отправлено работодателю.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="employer-reason">Причина отклонения</Label>
                                      <Textarea
                                        id="employer-reason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Например: ИНН не найден в базе..."
                                        className="mt-2"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setRejectEmployerDialogOpen(false)}>
                                        Отмена
                                      </Button>
                                      <Button variant="destructive" onClick={handleRejectEmployer}>
                                        Отклонить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Vacancies Moderation */}
                <TabsContent value="vacancies">
                  {vacancies.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="py-12 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Нет вакансий на модерации</p>
                        <p className="text-sm text-muted-foreground">Все вакансии проверены</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {vacancies.map((vacancy) => (
                        <Card key={vacancy.id} className="border-0 shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-sm font-medium">
                                    {vacancy.employer.companyName.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">{vacancy.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      {vacancy.employer.companyName} • ИНН: {vacancy.employer.inn}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                  {vacancy.description}
                                </p>
                                <div className="flex flex-wrap gap-2 text-sm">
                                  <Badge className="bg-purple-500/10 text-purple-600">
                                    {categoryLabels[vacancy.category] || vacancy.category}
                                  </Badge>
                                  <Badge variant="outline">{vacancy.city}</Badge>
                                  <Badge variant="outline" className="text-green-600">
                                    {formatSalary(vacancy)}
                                  </Badge>
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(vacancy.createdAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                                  onClick={() => handleApproveVacancy(vacancy.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Одобрить
                                </Button>
                                <Dialog open={rejectDialogOpen && selectedVacancyId === vacancy.id} onOpenChange={(open) => {
                                  setRejectDialogOpen(open);
                                  if (open) setSelectedVacancyId(vacancy.id);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Отклонить
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Отклонить вакансию</DialogTitle>
                                      <DialogDescription>
                                        Укажите причину отклонения. Это сообщение будет отправлено работодателю.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <Label htmlFor="reason">Причина отклонения</Label>
                                      <Textarea
                                        id="reason"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Например: Вакансия содержит контактную информацию..."
                                        className="mt-2"
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                                        Отмена
                                      </Button>
                                      <Button variant="destructive" onClick={handleRejectVacancy}>
                                        Отклонить
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Consents Moderation */}
                <TabsContent value="consents">
                  {consents.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="py-12 text-center">
                        <FileCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
                        <p className="text-lg font-medium">Нет согласий на проверке</p>
                        <p className="text-sm text-muted-foreground">Все документы проверены</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {consents.map((consent) => (
                        <Card key={consent.id} className="border-0 shadow-sm">
                          <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                  <UserCheck className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">
                                    {consent.firstName} {consent.lastName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {consent.user.email} • {consent.city}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Загружено: {consent.consentUploadedAt ? formatDate(consent.consentUploadedAt) : 'Не загружено'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {consent.consentDocumentUrl && (
                                  <Button variant="outline" size="sm" asChild>
                                    <a href={consent.consentDocumentUrl} target="_blank" rel="noopener noreferrer">
                                      <Eye className="h-4 w-4 mr-1" />
                                      Просмотр
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-green-500/20 text-green-600 hover:bg-green-500/10"
                                  onClick={() => handleApproveConsent(consent.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Подтвердить
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleRejectConsent(consent.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Statistics Tab */}
                <TabsContent value="stats">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Vacancies by Category */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-purple-500" />
                          Вакансии по категориям
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stats?.charts.vacanciesByCategory.map((item) => (
                            <div key={item.category} className="flex items-center justify-between">
                              <span className="text-sm">
                                {categoryLabels[item.category] || item.category}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{
                                      width: `${Math.min(100, (item.count / (stats?.vacancies.active || 1)) * 100)}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Vacancy Status */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-green-500" />
                          Статус вакансий
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>Активные</span>
                            </div>
                            <span className="font-bold">{stats?.vacancies.active || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-yellow-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <span>На модерации</span>
                            </div>
                            <span className="font-bold">{stats?.vacancies.pending || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <XCircle className="h-5 w-5 text-red-500" />
                              <span>Отклонённые</span>
                            </div>
                            <span className="font-bold">{stats?.vacancies.rejected || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Users Summary */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          Пользователи
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-blue-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <UserCheck className="h-5 w-5 text-blue-500" />
                              <span>Подростки</span>
                            </div>
                            <span className="font-bold">{stats?.users.teenagers || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-purple-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-5 w-5 text-purple-500" />
                              <span>Работодатели</span>
                            </div>
                            <span className="font-bold">{stats?.users.employers || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <TrendingUp className="h-5 w-5 text-green-500" />
                              <span>Новые за неделю</span>
                            </div>
                            <span className="font-bold">+{stats?.users.recent || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Reports */}
                    <Card className="border-0 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Жалобы
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-orange-500/5 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-orange-500" />
                              <span>На рассмотрении</span>
                            </div>
                            <span className="font-bold">{stats?.reports.pending || 0}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileCheck className="h-5 w-5 text-muted-foreground" />
                              <span>Всего жалоб</span>
                            </div>
                            <span className="font-bold">{stats?.reports.total || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
