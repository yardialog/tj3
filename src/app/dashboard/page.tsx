'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  MessageSquare,
  Plus,
  Loader2,
  User,
  Ban,
  Shield,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  viewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  vacancy: {
    id: string;
    title: string;
    city: string;
    employer: {
      companyName: string;
    };
  };
}

interface Report {
  id: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  reportedUser: {
    id: string;
    email: string;
    role: string;
    teenager: { firstName: string; lastName: string } | null;
    employer: { companyName: string } | null;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  SENT: { label: 'Отправлен', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', icon: Send },
  VIEWED: { label: 'Просмотрен', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Eye },
  ACCEPTED: { label: 'Принят', color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
  REJECTED: { label: 'Отклонён', color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
  COMPLETED: { label: 'Завершён', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', icon: CheckCircle },
  CANCELLED: { label: 'Отменён', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', icon: X },
};

const reportTypes: Record<string, { label: string; description: string }> = {
  INAPPROPRIATE_CONTENT: { label: 'Неуместный контент', description: 'Оскорбления, ненормативная лексика' },
  SPAM: { label: 'Спам', description: 'Массовая рассылка, реклама' },
  FRAUD: { label: 'Мошенничество', description: 'Попытка обмана, фейковые вакансии' },
  HARASSMENT: { label: 'Домогательства', description: 'Угрозы, преследование' },
  OTHER: { label: 'Другое', description: 'Иные нарушения' },
};

const reportStatusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'На рассмотрении', color: 'bg-yellow-500/10 text-yellow-600' },
  REVIEWED: { label: 'Рассмотрена', color: 'bg-blue-500/10 text-blue-600' },
  RESOLVED: { label: 'Решена', color: 'bg-green-500/10 text-green-600' },
  DISMISSED: { label: 'Отклонена', color: 'bg-slate-500/10 text-slate-600' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [applications, setApplications] = useState<Application[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'reports'>('applications');

  // Report form state
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportedEmail: '',
    type: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'TEENAGER') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'TEENAGER') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, reportsRes] = await Promise.all([
        fetch('/api/applications/my'),
        fetch('/api/reports'),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData.applications || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.reportedEmail || !reportForm.type || !reportForm.description) {
      setReportError('Заполните все поля');
      return;
    }

    setIsSubmitting(true);
    setReportError('');

    try {
      // First find the user by email
      const searchRes = await fetch(`/api/users/search?email=${encodeURIComponent(reportForm.reportedEmail)}`);
      if (!searchRes.ok) {
        setReportError('Пользователь не найден');
        setIsSubmitting(false);
        return;
      }

      const { user: reportedUser } = await searchRes.json();

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportedId: reportedUser.id,
          type: reportForm.type,
          description: reportForm.description,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setReportForm({ reportedEmail: '', type: '', description: '' });
        setTimeout(() => {
          setShowReportDialog(false);
          setReportSuccess(false);
          fetchData();
        }, 1500);
      } else {
        const data = await res.json();
        setReportError(data.error || 'Ошибка при отправке жалобы');
      }
    } catch (error) {
      setReportError('Ошибка при отправке жалобы');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate stats
  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'SENT' || a.status === 'VIEWED').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    completed: applications.filter(a => a.status === 'COMPLETED').length,
  };

  if (authLoading || !user) {
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
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background py-8">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Личный кабинет</h1>
                    <p className="text-muted-foreground">
                      {user.teenager?.firstName} {user.teenager?.lastName}
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link href="/vacancies">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Искать вакансии
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-6 border-b">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Всего откликов</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.pending}</div>
                  <div className="text-xs text-muted-foreground">На рассмотрении</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.accepted}</div>
                  <div className="text-xs text-muted-foreground">Принято</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.completed}</div>
                  <div className="text-xs text-muted-foreground">Завершено</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Applications/Reports List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Мои отклики</CardTitle>
                      <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab('applications')}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            activeTab === 'applications'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Отклики
                        </button>
                        <button
                          onClick={() => setActiveTab('reports')}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            activeTab === 'reports'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Жалобы
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : activeTab === 'applications' ? (
                      applications.length === 0 ? (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">У вас пока нет откликов</p>
                          <Button asChild>
                            <Link href="/vacancies">Найти вакансии</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {applications.map((app) => {
                            const config = statusConfig[app.status] || statusConfig.SENT;
                            const StatusIcon = config.icon;
                            return (
                              <div
                                key={app.id}
                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className={`w-10 h-10 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                  <StatusIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-medium truncate">{app.vacancy.title}</h4>
                                    <Badge className={config.color}>{config.label}</Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Building2 className="h-3 w-3" />
                                      {app.vacancy.employer.companyName}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {app.vacancy.city}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(app.createdAt)}
                                    </span>
                                  </div>
                                  {app.rejectionReason && (
                                    <p className="mt-2 text-sm text-red-500">
                                      Причина: {app.rejectionReason}
                                    </p>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      reports.length === 0 ? (
                        <div className="text-center py-8">
                          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">У вас нет поданных жалоб</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {reports.map((report) => {
                            const typeInfo = reportTypes[report.type] || { label: report.type };
                            const statusInfo = reportStatusConfig[report.status] || { label: report.status, color: '' };
                            const reportedName = report.reportedUser.employer?.companyName ||
                              (report.reportedUser.teenager ?
                                `${report.reportedUser.teenager.firstName} ${report.reportedUser.teenager.lastName}` :
                                report.reportedUser.email);

                            return (
                              <div
                                key={report.id}
                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                              >
                                <div className={`w-10 h-10 rounded-full ${statusInfo.color} flex items-center justify-center flex-shrink-0`}>
                                  <AlertTriangle className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-medium">{typeInfo.label}</h4>
                                    <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    На: {reportedName}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {report.description}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDate(report.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Быстрые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/vacancies">
                        <Briefcase className="h-4 w-4 mr-3 text-blue-500" />
                        Искать вакансии
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-3 text-purple-500" />
                        Мой профиль
                      </Link>
                    </Button>
                    <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                      <DialogTrigger asChild>
                        <Button className="w-full justify-start" variant="outline">
                          <AlertTriangle className="h-4 w-4 mr-3 text-red-500" />
                          Подать жалобу
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Подать жалобу
                          </DialogTitle>
                          <DialogDescription>
                            Сообщите о нарушении правил платформы
                          </DialogDescription>
                        </DialogHeader>
                        {reportSuccess ? (
                          <div className="text-center py-6">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <p className="font-medium">Жалоба отправлена</p>
                            <p className="text-sm text-muted-foreground">
                              Мы рассмотрим её в ближайшее время
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4 pt-4">
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Email пользователя</label>
                              <Input
                                placeholder="email@example.com"
                                value={reportForm.reportedEmail}
                                onChange={(e) => setReportForm({ ...reportForm, reportedEmail: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Тип нарушения</label>
                              <Select
                                value={reportForm.type}
                                onValueChange={(value) => setReportForm({ ...reportForm, type: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите тип" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(reportTypes).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                      <div>
                                        <div>{value.label}</div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Описание</label>
                              <Textarea
                                placeholder="Опишите ситуацию подробно..."
                                value={reportForm.description}
                                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                rows={4}
                              />
                            </div>
                            {reportError && (
                              <p className="text-sm text-red-500">{reportError}</p>
                            )}
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowReportDialog(false)}
                              >
                                Отмена
                              </Button>
                              <Button
                                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                                onClick={handleSubmitReport}
                                disabled={isSubmitting}
                              >
                                {isSubmitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Отправить'
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Profile Status Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Статус профиля</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Город</span>
                        <span className="text-sm font-medium">{user.teenager?.city || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Рейтинг</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{user.teenager?.rating || 0}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Согласие родителей</span>
                        <Badge className={
                          user.teenager?.consentStatus === 'VERIFIED'
                            ? 'bg-green-500/10 text-green-600'
                            : user.teenager?.consentStatus === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }>
                          {user.teenager?.consentStatus === 'VERIFIED'
                            ? 'Подтверждено'
                            : user.teenager?.consentStatus === 'PENDING'
                            ? 'На проверке'
                            : 'Не загружено'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-blue-500/5">
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">Нужна помощь?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Наша поддержка готова ответить на ваши вопросы
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      Написать в поддержку
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
