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
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Users,
  Plus,
  Loader2,
  Building2,
  FileText,
  MapPin,
  Calendar,
  ChevronRight,
  Ban,
  AlertCircle,
  Edit,
  User,
  Star,
  MessageSquare,
  Send,
  Phone,
  Mail,
  Award,
  Shield,
  Archive,
  RotateCcw,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';

interface Vacancy {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  city: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  rejectionReason: string | null;
}

interface Application {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  viewedAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  teenager: {
    id: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    teenager: {
      firstName: string;
      lastName: string;
      city: string;
      district?: string | null;
      bio?: string | null;
      skills?: string;
      rating: number;
      reviewsCount: number;
      completedJobs: number;
      birthDate: string;
      consentStatus: string;
    } | null;
  } | null;
  vacancy: {
    id: string;
    title: string;
  };
  chatRoom?: {
    id: string;
    isActive: boolean;
  } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Черновик', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', icon: Edit },
  ON_MODERATION: { label: 'На модерации', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', icon: Clock },
  REJECTED: { label: 'Отклонена', color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: XCircle },
  ACTIVE: { label: 'Активна', color: 'bg-green-500/10 text-green-600 dark:text-green-400', icon: CheckCircle },
  ARCHIVED: { label: 'Архив', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400', icon: Archive },
  CLOSED: { label: 'Закрыта', color: 'bg-red-500/10 text-red-600 dark:text-red-400', icon: Ban },
};

const applicationStatusConfig: Record<string, { label: string; color: string }> = {
  SENT: { label: 'Новый', color: 'bg-blue-500/10 text-blue-600' },
  VIEWED: { label: 'Просмотрен', color: 'bg-yellow-500/10 text-yellow-600' },
  ACCEPTED: { label: 'Принят', color: 'bg-green-500/10 text-green-600' },
  REJECTED: { label: 'Отклонён', color: 'bg-red-500/10 text-red-600' },
  COMPLETED: { label: 'Завершён', color: 'bg-purple-500/10 text-purple-600' },
  CANCELLED: { label: 'Отменён', color: 'bg-slate-500/10 text-slate-600' },
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

export default function EmployerDashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vacancies' | 'applications'>('vacancies');
  
  // Application details modal
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Vacancy management
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [vacancyAction, setVacancyAction] = useState<'archive' | 'restore' | 'close' | null>(null);
  const [isVacancyActionModalOpen, setIsVacancyActionModalOpen] = useState(false);
  const [isVacancyProcessing, setIsVacancyProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && user.role !== 'EMPLOYER') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'EMPLOYER') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vacanciesRes, applicationsRes] = await Promise.all([
        fetch('/api/vacancies/my'),
        fetch('/api/applications/incoming'),
      ]);

      if (vacanciesRes.ok) {
        const vacanciesData = await vacanciesRes.json();
        setVacancies(vacanciesData.vacancies || []);
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationClick = async (app: Application) => {
    setIsModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedApplication(null);
    
    try {
      const res = await fetch(`/api/applications/${app.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedApplication(data.application);
        
        // Update status in list if it was SENT
        if (app.status === 'SENT') {
          setApplications(prev => 
            prev.map(a => a.id === app.id ? { ...a, status: 'VIEWED' } : a)
          );
        }
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleAcceptApplication = async () => {
    if (!selectedApplication) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedApplication(data.application);
        setApplications(prev =>
          prev.map(a => a.id === selectedApplication.id ? { ...a, status: 'ACCEPTED' } : a)
        );
      }
    } catch (error) {
      console.error('Error accepting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApplication) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          rejectionReason: rejectionReason || undefined 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedApplication(data.application);
        setApplications(prev =>
          prev.map(a => a.id === selectedApplication.id ? { ...a, status: 'REJECTED', rejectionReason } : a)
        );
        setShowRejectForm(false);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteApplication = async () => {
    if (!selectedApplication) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/applications/${selectedApplication.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        const data = await res.json();
        setSelectedApplication(data.application);
        setApplications(prev =>
          prev.map(a => a.id === selectedApplication.id ? { ...a, status: 'COMPLETED' } : a)
        );
      }
    } catch (error) {
      console.error('Error completing application:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Vacancy management functions
  const handleVacancyAction = async () => {
    if (!selectedVacancy || !vacancyAction) return;
    
    setIsVacancyProcessing(true);
    try {
      const statusMap = {
        archive: 'ARCHIVED',
        restore: 'DRAFT',
        close: 'CLOSED',
      };

      const res = await fetch(`/api/vacancies/${selectedVacancy.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[vacancyAction] }),
      });

      if (res.ok) {
        const data = await res.json();
        setVacancies(prev =>
          prev.map(v => v.id === selectedVacancy.id ? { ...v, status: data.vacancy.status } : v)
        );
        setIsVacancyActionModalOpen(false);
        setSelectedVacancy(null);
        setVacancyAction(null);
      } else {
        const error = await res.json();
        console.error('Error:', error.error);
      }
    } catch (error) {
      console.error('Error updating vacancy:', error);
    } finally {
      setIsVacancyProcessing(false);
    }
  };

  const openVacancyActionModal = (vacancy: Vacancy, action: 'archive' | 'restore' | 'close') => {
    setSelectedVacancy(vacancy);
    setVacancyAction(action);
    setIsVacancyActionModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Calculate stats
  const stats = {
    totalVacancies: vacancies.length,
    activeVacancies: vacancies.filter(v => v.status === 'ACTIVE').length,
    pendingModeration: vacancies.filter(v => v.status === 'ON_MODERATION').length,
    totalApplications: applications.length,
    newApplications: applications.filter(a => a.status === 'SENT').length,
    acceptedApplications: applications.filter(a => a.status === 'ACCEPTED').length,
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
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Панель работодателя</h1>
                    <p className="text-muted-foreground">
                      {user.employer?.companyName}
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                <Link href="/vacancies/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Создать вакансию
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Verification Warning Banner */}
        {user.employer?.verificationStatus !== 'VERIFIED' && (
          <section className="py-4 border-b bg-amber-500/5">
            <div className="container px-4 mx-auto">
              <Card className="border-amber-500/50 bg-amber-500/5">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                          {user.employer?.verificationStatus === 'PENDING'
                            ? 'Компания на проверке'
                            : 'Требуется верификация компании'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {user.employer?.verificationStatus === 'PENDING'
                            ? 'Мы проверяем данные вашей компании. Обычно это занимает 1-2 рабочих дня.'
                            : 'Для публикации вакансий ваша компания должна пройти верификацию. Данные компании проверяются по ИНН.'}
                        </p>
                      </div>
                    </div>
                    {user.employer?.verificationStatus === 'REJECTED' && (
                      <Badge className="bg-red-500/10 text-red-600">
                        Отклонено
                      </Badge>
                    )}
                    {user.employer?.verificationStatus === 'PENDING' && (
                      <Badge className="bg-amber-500/10 text-amber-600">
                        На проверке
                      </Badge>
                    )}
                    {user.employer?.verificationStatus === 'NOT_UPLOADED' && (
                      <Badge className="bg-slate-500/10 text-slate-600">
                        Ожидает проверки
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-6 border-b">
          <div className="container px-4 mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Briefcase className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalVacancies}</div>
                  <div className="text-xs text-muted-foreground">Всего вакансий</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.activeVacancies}</div>
                  <div className="text-xs text-muted-foreground">Активных</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.pendingModeration}</div>
                  <div className="text-xs text-muted-foreground">На модерации</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <div className="text-xs text-muted-foreground">Откликов</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <Eye className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.newApplications}</div>
                  <div className="text-xs text-muted-foreground">Новых</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Vacancies/Applications List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Мои вакансии</CardTitle>
                      <div className="flex gap-1 bg-muted rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab('vacancies')}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                            activeTab === 'vacancies'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Вакансии
                        </button>
                        <button
                          onClick={() => setActiveTab('applications')}
                          className={`px-3 py-1.5 text-sm rounded-md transition-colors relative ${
                            activeTab === 'applications'
                              ? 'bg-background shadow-sm text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Отклики
                          {stats.newApplications > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                              {stats.newApplications}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : activeTab === 'vacancies' ? (
                      vacancies.length === 0 ? (
                        <div className="text-center py-8">
                          <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground mb-4">У вас пока нет вакансий</p>
                          <Button asChild>
                            <Link href="/vacancies/create">Создать первую вакансию</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {vacancies.map((vacancy) => {
                            const config = statusConfig[vacancy.status] || statusConfig.DRAFT;
                            const StatusIcon = config.icon;
                            return (
                              <div
                                key={vacancy.id}
                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <div className={`w-10 h-10 rounded-full ${config.color} bg-opacity-20 flex items-center justify-center flex-shrink-0`}>
                                  <StatusIcon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-medium truncate">{vacancy.title}</h4>
                                    <Badge className={config.color}>{config.label}</Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <span>{categoryLabels[vacancy.category] || vacancy.category}</span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {vacancy.city}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="h-3 w-3" />
                                      {vacancy.viewsCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {vacancy.applicationsCount}
                                    </span>
                                  </div>
                                  {vacancy.rejectionReason && (
                                    <div className="mt-2 flex items-start gap-2 text-sm text-red-500">
                                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                      <span>{vacancy.rejectionReason}</span>
                                    </div>
                                  )}
                                </div>
                                {/* Actions Dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {vacancy.status === 'ACTIVE' && (
                                      <>
                                        <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'archive')}>
                                          <Archive className="h-4 w-4 mr-2" />
                                          В архив
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => openVacancyActionModal(vacancy, 'close')}
                                          className="text-red-600"
                                        >
                                          <Ban className="h-4 w-4 mr-2" />
                                          Закрыть вакансию
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {vacancy.status === 'DRAFT' && (
                                      <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'archive')}>
                                        <Archive className="h-4 w-4 mr-2" />
                                        В архив
                                      </DropdownMenuItem>
                                    )}
                                    {vacancy.status === 'REJECTED' && (
                                      <>
                                        <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'restore')}>
                                          <RotateCcw className="h-4 w-4 mr-2" />
                                          В черновики
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'archive')}>
                                          <Archive className="h-4 w-4 mr-2" />
                                          В архив
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {vacancy.status === 'ARCHIVED' && (
                                      <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'restore')}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Восстановить в черновики
                                      </DropdownMenuItem>
                                    )}
                                    {vacancy.status === 'CLOSED' && (
                                      <DropdownMenuItem onClick={() => openVacancyActionModal(vacancy, 'restore')}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Восстановить в черновики
                                      </DropdownMenuItem>
                                    )}
                                    {vacancy.status === 'ON_MODERATION' && (
                                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                        Ожидает модерации
                                      </div>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          })}
                        </div>
                      )
                    ) : (
                      applications.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">У вас пока нет откликов</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {applications.map((app) => {
                            const config = applicationStatusConfig[app.status] || applicationStatusConfig.SENT;
                            const teenName = app.teenager?.teenager
                              ? `${app.teenager.teenager.firstName} ${app.teenager.teenager.lastName}`
                              : app.teenager?.email || 'Пользователь';
                            return (
                              <button
                                key={app.id}
                                onClick={() => handleApplicationClick(app)}
                                className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors w-full text-left"
                              >
                                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                                  <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className="font-medium">{teenName}</h4>
                                    <Badge className={config.color}>{config.label}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-1">
                                    На вакансию: {app.vacancy.title}
                                  </p>
                                  {app.message && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 italic">
                                      "{app.message}"
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDate(app.createdAt)}
                                  </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                              </button>
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
                      <Link href="/vacancies/create">
                        <Plus className="h-4 w-4 mr-3 text-green-500" />
                        Создать вакансию
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/vacancies">
                        <Briefcase className="h-4 w-4 mr-3 text-blue-500" />
                        Все вакансии
                      </Link>
                    </Button>
                    <Button asChild className="w-full justify-start" variant="outline">
                      <Link href="/profile/employer">
                        <Building2 className="h-4 w-4 mr-3 text-purple-500" />
                        Профиль компании
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Company Status Card */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Статус компании</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Email</span>
                        <span className="text-sm font-medium">{user.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">ИНН</span>
                        <span className="text-sm font-medium">{user.employer?.inn || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Город</span>
                        <span className="text-sm font-medium">{user.employer?.city || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Рейтинг</span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{user.employer?.rating || 0}</span>
                          <span className="text-yellow-500">★</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Верификация</span>
                        <Badge className={
                          user.employer?.verificationStatus === 'VERIFIED'
                            ? 'bg-green-500/10 text-green-600'
                            : user.employer?.verificationStatus === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-slate-500/10 text-slate-600'
                        }>
                          {user.employer?.verificationStatus === 'VERIFIED'
                            ? 'Подтверждена'
                            : user.employer?.verificationStatus === 'PENDING'
                            ? 'На проверке'
                            : 'Не верифицирована'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Limit Notice */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Лимит вакансий</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Вы можете создать до 5 активных вакансий.
                          Использовано: {stats.activeVacancies}/5
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Application Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {isLoadingDetails ? (
            <>
              <VisuallyHidden>
                <DialogTitle>Загрузка данных заявки</DialogTitle>
              </VisuallyHidden>
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </>
          ) : selectedApplication ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Заявка от {selectedApplication.teenager?.teenager 
                    ? `${selectedApplication.teenager.teenager.firstName} ${selectedApplication.teenager.teenager.lastName}`
                    : 'Пользователя'}
                </DialogTitle>
                <DialogDescription>
                  На вакансию: {selectedApplication.vacancy?.title || 'Вакансия'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Статус заявки</span>
                  <Badge className={applicationStatusConfig[selectedApplication.status]?.color || ''}>
                    {applicationStatusConfig[selectedApplication.status]?.label || selectedApplication.status}
                  </Badge>
                </div>

                {/* Teenager Info */}
                {selectedApplication.teenager?.teenager && (
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                          {selectedApplication.teenager.teenager.firstName[0]}
                          {selectedApplication.teenager.teenager.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {selectedApplication.teenager.teenager.firstName} {selectedApplication.teenager.teenager.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {calculateAge(selectedApplication.teenager.teenager.birthDate)} лет
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedApplication.teenager.teenager.city}
                              {selectedApplication.teenager.teenager.district && `, ${selectedApplication.teenager.teenager.district}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{selectedApplication.teenager.teenager.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({selectedApplication.teenager.teenager.reviewsCount} отзывов)</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>{selectedApplication.teenager.teenager.completedJobs} выполнено</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Контактная информация</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Email</div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{selectedApplication.teenager?.email}</span>
                        </div>
                        <a
                          href={`mailto:${selectedApplication.teenager?.email}`}
                          className="text-primary hover:text-primary/80 flex-shrink-0"
                          title="Написать email"
                        >
                          <Send className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    {selectedApplication.teenager?.phone && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-xs text-muted-foreground mb-1">Телефон</div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{selectedApplication.teenager.phone}</span>
                          </div>
                          <a
                            href={`tel:${selectedApplication.teenager.phone}`}
                            className="text-primary hover:text-primary/80 flex-shrink-0"
                            title="Позвонить"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                  {selectedApplication.status === 'ACCEPTED' && (
                    <div className="flex gap-2">
                      {selectedApplication.teenager?.phone && (
                        <Button asChild variant="outline" size="sm" className="flex-1">
                          <a href={`tel:${selectedApplication.teenager.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Позвонить
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={`mailto:${selectedApplication.teenager?.email}`}>
                          <Mail className="h-4 w-4 mr-2" />
                          Написать email
                        </a>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Consent Status */}
                {selectedApplication.teenager?.teenager && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm">Согласие родителей</span>
                    <Badge className={
                      selectedApplication.teenager.teenager.consentStatus === 'VERIFIED'
                        ? 'bg-green-500/10 text-green-600'
                        : selectedApplication.teenager.teenager.consentStatus === 'PENDING'
                        ? 'bg-yellow-500/10 text-yellow-600'
                        : 'bg-slate-500/10 text-slate-600'
                    }>
                      <Shield className="h-3 w-3 mr-1" />
                      {selectedApplication.teenager.teenager.consentStatus === 'VERIFIED'
                        ? 'Подтверждено'
                        : selectedApplication.teenager.teenager.consentStatus === 'PENDING'
                        ? 'На проверке'
                        : 'Не загружено'}
                    </Badge>
                  </div>
                )}

                {/* Skills */}
                {selectedApplication.teenager?.teenager?.skills && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Навыки
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {JSON.parse(selectedApplication.teenager.teenager.skills).map((skill: string) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bio */}
                {selectedApplication.teenager?.teenager?.bio && (
                  <div>
                    <div className="text-sm font-medium mb-2">О себе</div>
                    <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      {selectedApplication.teenager.teenager.bio}
                    </p>
                  </div>
                )}

                {/* Application Message */}
                {selectedApplication.message && (
                  <div>
                    <div className="text-sm font-medium mb-2">Сопроводительное сообщение</div>
                    <p className="text-sm bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg">
                      "{selectedApplication.message}"
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Отправлено: {formatDate(selectedApplication.createdAt)}</span>
                  {selectedApplication.viewedAt && (
                    <span>Просмотрено: {formatDate(selectedApplication.viewedAt)}</span>
                  )}
                  {selectedApplication.acceptedAt && (
                    <span>Принято: {formatDate(selectedApplication.acceptedAt)}</span>
                  )}
                </div>

                {/* Rejection Reason */}
                {selectedApplication.rejectionReason && (
                  <div className="p-3 rounded-lg bg-red-500/10 text-red-600">
                    <div className="text-sm font-medium mb-1">Причина отклонения</div>
                    <p className="text-sm">{selectedApplication.rejectionReason}</p>
                  </div>
                )}

                {/* Actions */}
                {(selectedApplication.status === 'SENT' || selectedApplication.status === 'VIEWED') && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-green-500 hover:bg-green-600"
                        onClick={handleAcceptApplication}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Принять
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => setShowRejectForm(true)}
                        disabled={isProcessing}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Отклонить
                      </Button>
                    </div>

                    {showRejectForm && (
                      <div className="space-y-3 p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                        <Label>Причина отклонения (необязательно)</Label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Укажите причину отклонения..."
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowRejectForm(false);
                              setRejectionReason('');
                            }}
                          >
                            Отмена
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRejectApplication}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Подтвердить отклонение
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Accepted Actions */}
                {selectedApplication.status === 'ACCEPTED' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="p-4 rounded-lg bg-green-500/10 text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-medium text-green-700 dark:text-green-400">Заявка принята</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Вы можете связаться с кандидатом через чат
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {selectedApplication.chatRoom && (
                        <Button asChild className="flex-1">
                          <Link href={`/messages?room=${selectedApplication.chatRoom.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Открыть чат
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCompleteApplication}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Завершить работу
                      </Button>
                    </div>
                  </div>
                )}

                {/* Completed Status */}
                {selectedApplication.status === 'COMPLETED' && (
                  <div className="p-4 rounded-lg bg-purple-500/10 text-center mt-4">
                    <CheckCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-medium text-purple-700 dark:text-purple-400">Работа завершена</p>
                  </div>
                )}

                {/* Rejected Status */}
                {selectedApplication.status === 'REJECTED' && (
                  <div className="p-4 rounded-lg bg-red-500/10 text-center mt-4">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="font-medium text-red-700 dark:text-red-400">Заявка отклонена</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <VisuallyHidden>
                <DialogTitle>Ошибка загрузки</DialogTitle>
              </VisuallyHidden>
              <div className="text-center py-12 text-muted-foreground">
                Не удалось загрузить данные заявки
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Vacancy Action Confirmation Modal */}
      <Dialog open={isVacancyActionModalOpen} onOpenChange={setIsVacancyActionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {vacancyAction === 'archive' && 'Архивировать вакансию'}
              {vacancyAction === 'restore' && 'Восстановить вакансию'}
              {vacancyAction === 'close' && 'Закрыть вакансию'}
            </DialogTitle>
            <DialogDescription>
              {vacancyAction === 'archive' && (
                <>
                  Вакансия «{selectedVacancy?.title}» будет перемещена в архив.
                  Вы сможете восстановить её в любой момент.
                </>
              )}
              {vacancyAction === 'restore' && (
                <>
                  Вакансия «{selectedVacancy?.title}» будет восстановлена как черновик.
                  После этого вы сможете отправить её на модерацию.
                </>
              )}
              {vacancyAction === 'close' && (
                <>
                  Вакансия «{selectedVacancy?.title}» будет закрыта и перемещена в архив.
                  Отклики на неё больше не принимаются.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsVacancyActionModalOpen(false);
                setSelectedVacancy(null);
                setVacancyAction(null);
              }}
              disabled={isVacancyProcessing}
            >
              Отмена
            </Button>
            <Button
              className={`flex-1 ${vacancyAction === 'close' ? 'bg-red-500 hover:bg-red-600' : ''}`}
              onClick={handleVacancyAction}
              disabled={isVacancyProcessing}
            >
              {isVacancyProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <>
                  {vacancyAction === 'archive' && <Archive className="h-4 w-4 mr-2" />}
                  {vacancyAction === 'restore' && <RotateCcw className="h-4 w-4 mr-2" />}
                  {vacancyAction === 'close' && <Ban className="h-4 w-4 mr-2" />}
                </>
              )}
              {vacancyAction === 'archive' && 'В архив'}
              {vacancyAction === 'restore' && 'Восстановить'}
              {vacancyAction === 'close' && 'Закрыть'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
