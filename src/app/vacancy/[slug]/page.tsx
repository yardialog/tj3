'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  MapPin,
  Clock,
  Banknote,
  Calendar,
  Users,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Building2,
  Eye,
  MessageSquare,
  Star,
  Shield,
  GraduationCap,
  Code,
  Megaphone,
  Bike,
  Sparkles,
  Coffee,
  MoreHorizontal,
  Share2,
  Heart,
  ChevronRight
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

const categoryIcons: Record<string, any> = {
  TUTORING: GraduationCap,
  IT: Code,
  PROMOTER: Megaphone,
  DELIVERY: Bike,
  CLEANING: Briefcase,
  ANIMATION: Sparkles,
  SERVICE: Coffee,
  OTHER: MoreHorizontal,
};

const categoryColors: Record<string, { bg: string; text: string; iconBg: string }> = {
  TUTORING: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-500/10' },
  IT: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-500/10' },
  PROMOTER: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', iconBg: 'bg-orange-500/10' },
  DELIVERY: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-500/10' },
  CLEANING: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-500/10' },
  ANIMATION: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-500/10' },
  SERVICE: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/10' },
  OTHER: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', iconBg: 'bg-slate-500/10' },
};

const scheduleLabels: Record<string, string> = {
  FULL_TIME: 'Полный день',
  PART_TIME: 'Частичная занятость',
  FLEXIBLE: 'Гибкий график',
  WEEKENDS: 'Выходные',
  EVENING: 'Вечернее время',
  SUMMER: 'Летняя подработка',
};

const ageLabels: Record<string, string> = {
  AGE_14_15: '14-15 лет',
  AGE_16_17: '16-17 лет',
  AGE_14_17: '14-17 лет',
};

const ageColors: Record<string, string> = {
  AGE_14_15: 'bg-green-500/10 text-green-600 dark:text-green-400',
  AGE_16_17: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  AGE_14_17: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
};

interface Vacancy {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  address: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFixed: number | null;
  salaryType: string;
  schedule: string;
  ageRequirement: string;
  requiredSkills: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    city: string;
    description: string | null;
    rating: number;
    reviewsCount: number;
  };
}

export default function VacancyPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchVacancy();
  }, [resolvedParams.slug]);

  const fetchVacancy = async () => {
    try {
      const response = await fetch(`/api/vacancies/${resolvedParams.slug}`);
      if (response.ok) {
        const data = await response.json();
        setVacancy(data.vacancy);
        setHasApplied(data.hasApplied || false);
      }
    } catch (error) {
      console.error('Error fetching vacancy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'TEENAGER') {
      toast.error('Откликаться могут только подростки');
      return;
    }

    setIsApplying(true);
    try {
      const response = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: vacancy?.id,
          message: applyMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отклике');
      }

      toast.success('Отклик успешно отправлен!');
      setHasApplied(true);
      setDialogOpen(false);
      setApplyMessage('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при отклике');
    } finally {
      setIsApplying(false);
    }
  };

  const formatSalary = () => {
    if (!vacancy) return '';
    if (vacancy.salaryFixed) {
      return `${vacancy.salaryFixed.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMin && vacancy.salaryMax) {
      return `${vacancy.salaryMin.toLocaleString('ru-RU')} - ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMin) {
      return `от ${vacancy.salaryMin.toLocaleString('ru-RU')} ₽`;
    }
    if (vacancy.salaryMax) {
      return `до ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`;
    }
    return 'По договоренности';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const canApply = () => {
    if (!isAuthenticated || !user || user.role !== 'TEENAGER') return false;
    if (hasApplied) return false;

    const teen = user.teenager;
    if (!teen) return false;

    const age = calculateAge(new Date(teen.birthDate));
    const req = vacancy?.ageRequirement;

    if (req === 'AGE_14_15' && (age < 14 || age > 15)) return false;
    if (req === 'AGE_16_17' && (age < 16 || age > 17)) return false;

    return true;
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getRequiredSkills = () => {
    if (!vacancy?.requiredSkills) return [];
    try {
      return JSON.parse(vacancy.requiredSkills);
    } catch {
      return [];
    }
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || { bg: 'bg-slate-500/10', text: 'text-slate-600', iconBg: 'bg-slate-500/10' };
  };

  if (isLoading || authLoading) {
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

  if (!vacancy) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Вакансия не найдена</h1>
            <p className="text-muted-foreground mb-4">
              Возможно, вакансия была удалена или никогда не существовала
            </p>
            <Button asChild>
              <Link href="/vacancies">К списку вакансий</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const color = getCategoryColor(vacancy.category);
  const CategoryIcon = categoryIcons[vacancy.category] || Briefcase;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumbs */}
        <section className="bg-muted/30 border-b">
          <div className="container px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/vacancies" className="hover:text-primary transition-colors">Вакансии</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{vacancy.title}</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background">
          <div className="container px-4 py-8 md:py-12">
            {/* Back button */}
            <Button variant="ghost" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/vacancies">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к вакансиям
              </Link>
            </Button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Header Card */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-xl ${color.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <CategoryIcon className={`h-7 w-7 ${color.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Badge className={`${color.bg} ${color.text} hover:${color.bg} mb-3`}>
                          {categoryLabels[vacancy.category] || vacancy.category}
                        </Badge>
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{vacancy.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {vacancy.employer.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-blue-500" />
                            {vacancy.city}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl">
                      <div className="text-center p-3">
                        <Banknote className="h-5 w-5 mx-auto mb-2 text-green-500" />
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{formatSalary()}</div>
                        <div className="text-xs text-muted-foreground">Зарплата</div>
                      </div>
                      <div className="text-center p-3">
                        <Clock className="h-5 w-5 mx-auto mb-2 text-purple-500" />
                        <div className="text-sm font-medium">{scheduleLabels[vacancy.schedule] || vacancy.schedule}</div>
                        <div className="text-xs text-muted-foreground">График</div>
                      </div>
                      <div className="text-center p-3">
                        <Users className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                        <div className="text-sm font-medium">{ageLabels[vacancy.ageRequirement] || vacancy.ageRequirement}</div>
                        <div className="text-xs text-muted-foreground">Возраст</div>
                      </div>
                      <div className="text-center p-3">
                        <Calendar className="h-5 w-5 mx-auto mb-2 text-orange-500" />
                        <div className="text-sm font-medium">{formatRelativeDate(vacancy.createdAt)}</div>
                        <div className="text-xs text-muted-foreground">Опубликовано</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {vacancy.viewsCount} просмотров
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {vacancy.applicationsCount} откликов
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Description */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Описание вакансии
                    </h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <p className="whitespace-pre-wrap">{vacancy.description}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Требования
                    </h2>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Возраст</div>
                          <div className="font-medium">{ageLabels[vacancy.ageRequirement] || vacancy.ageRequirement}</div>
                        </div>
                      </div>

                      {getRequiredSkills().length > 0 && (
                        <div>
                          <div className="text-sm font-medium mb-3">Необходимые навыки</div>
                          <div className="flex flex-wrap gap-2">
                            {getRequiredSkills().map((skill: string) => (
                              <Badge key={skill} variant="outline" className="px-3 py-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Address */}
                {vacancy.address && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-6 md:p-8">
                      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Адрес
                      </h2>
                      <p className="text-muted-foreground">{vacancy.address}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Card */}
                <Card className="border-0 shadow-lg sticky top-4">
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                        {formatSalary()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vacancy.salaryType === 'HOURLY' ? 'в час' : vacancy.salaryType === 'DAILY' ? 'в день' : vacancy.salaryType === 'MONTHLY' ? 'в месяц' : 'за работу'}
                      </div>
                    </div>

                    {hasApplied ? (
                      <div className="text-center py-6 bg-green-500/10 rounded-xl">
                        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                        <p className="font-medium text-green-600 dark:text-green-400">Вы уже откликнулись</p>
                        <Button variant="outline" className="mt-4" asChild>
                          <Link href="/dashboard">К откликам</Link>
                        </Button>
                      </div>
                    ) : (
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90"
                            size="lg"
                            disabled={!canApply() && isAuthenticated}
                          >
                            {isAuthenticated && user?.role !== 'TEENAGER'
                              ? 'Только для подростков'
                              : !isAuthenticated
                                ? 'Войти для отклика'
                                : 'Откликнуться'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Откликнуться на вакансию</DialogTitle>
                            <DialogDescription>
                              Добавьте сообщение для работодателя (необязательно)
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label htmlFor="message">Сообщение</Label>
                              <Textarea
                                id="message"
                                placeholder="Расскажите о себе..."
                                value={applyMessage}
                                onChange={(e) => setApplyMessage(e.target.value)}
                                rows={4}
                              />
                            </div>
                            <Button
                              className="w-full bg-gradient-to-r from-primary to-blue-600"
                              onClick={handleApply}
                              disabled={isApplying}
                            >
                              {isApplying ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Отправка...
                                </>
                              ) : (
                                'Отправить отклик'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {!isAuthenticated && (
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        <Link href="/login" className="text-primary hover:underline">
                          Войдите
                        </Link>{' '}
                        или{' '}
                        <Link href="/register" className="text-primary hover:underline">
                          зарегистрируйтесь
                        </Link>
                      </p>
                    )}

                    <Separator className="my-6" />

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        Сохранить
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Employer Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Работодатель
                    </h3>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={vacancy.employer.logoUrl || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-lg">
                          {vacancy.employer.companyName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{vacancy.employer.companyName}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vacancy.employer.city}
                        </p>
                      </div>
                    </div>

                    {vacancy.employer.rating > 0 && (
                      <div className="flex items-center gap-2 mb-3 p-3 bg-muted/50 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{vacancy.employer.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({vacancy.employer.reviewsCount} отзывов)
                        </span>
                      </div>
                    )}

                    {vacancy.employer.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vacancy.employer.description}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Safety Card */}
                <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Shield className="h-5 w-5" />
                      Будьте осторожны
                    </h4>
                    <ul className="text-sm space-y-2 text-amber-700 dark:text-amber-300">
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        Не платите за трудоустройство
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        Встречайтесь в общественных местах
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        Оформите договор перед работой
                      </li>
                    </ul>
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
