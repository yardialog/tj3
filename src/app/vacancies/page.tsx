'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/stores/auth-store';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MapPin,
  Clock,
  Banknote,
  Briefcase,
  ArrowRight,
  Loader2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Code,
  Megaphone,
  Bike,
  Sparkles,
  Coffee,
  MoreHorizontal,
  Users,
  Building2,
  Calendar,
  SlidersHorizontal,
  MessageCircle,
  CheckCircle,
  XCircle,
  Eye,
  Send
} from 'lucide-react';

interface Vacancy {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFixed: number | null;
  salaryType: string;
  schedule: string;
  ageRequirement: string;
  createdAt: string;
  employer: {
    id: string;
    companyName: string;
    logoUrl: string | null;
    rating: number;
    city: string;
    userId: string;
  };
  applicationStatus?: string | null;
  chatRoomId?: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

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

function VacanciesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { toast } = useToast();

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Apply dialog state
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedVacancy, setSelectedVacancy] = useState<Vacancy | null>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  
  // Viewed vacancies (localStorage)
  const [viewedVacancies, setViewedVacancies] = useState<Set<string>>(new Set());

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'all');
  const [selectedAge, setSelectedAge] = useState<string>(searchParams.get('ageRequirement') || 'all');
  const [selectedSchedule, setSelectedSchedule] = useState<string>(searchParams.get('schedule') || 'all');

  // Load viewed vacancies from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('viewedVacancies');
      if (stored) {
        setViewedVacancies(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.error('Error loading viewed vacancies:', e);
    }
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchVacancies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, selectedCategory, selectedCity, selectedAge]);

  const fetchVacancies = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity && selectedCity !== 'all') params.append('city', selectedCity);
      if (selectedAge && selectedAge !== 'all') params.append('ageRequirement', selectedAge);
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());

      const response = await fetch(`/api/vacancies?${params.toString()}`);
      const data = await response.json();
      setVacancies(data.vacancies || []);
      setPagination(prev => ({
        ...prev,
        ...data.pagination,
      }));
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenApplyDialog = (vacancy: Vacancy) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vacancies');
      return;
    }
    if (user?.role !== 'TEENAGER') {
      toast({
        title: 'Ошибка',
        description: 'Откликаться на вакансии могут только подростки',
        variant: 'destructive',
      });
      return;
    }
    setSelectedVacancy(vacancy);
    setApplyMessage('');
    setApplyDialogOpen(true);
  };
  
  const handleApply = async () => {
    if (!selectedVacancy) return;
    
    setIsApplying(true);
    try {
      const response = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: selectedVacancy.id,
          message: applyMessage || undefined,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Отклик отправлен',
        });
        setApplyDialogOpen(false);
        // Update vacancy status locally
        setVacancies(prev => prev.map(v => 
          v.id === selectedVacancy.id 
            ? { ...v, applicationStatus: 'SENT' }
            : v
        ));
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить отклик',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Произошла ошибка при отправке отклика',
        variant: 'destructive',
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleOpenChat = (vacancy: Vacancy) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vacancies');
      return;
    }
    router.push('/messages');
  };
  
  const markAsViewed = (vacancyId: string) => {
    if (!viewedVacancies.has(vacancyId)) {
      const newSet = new Set(viewedVacancies);
      newSet.add(vacancyId);
      setViewedVacancies(newSet);
      try {
        localStorage.setItem('viewedVacancies', JSON.stringify([...newSet]));
      } catch (e) {
        console.error('Error saving viewed vacancies:', e);
      }
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchVacancies();
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? 'all' : categoryId);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setSelectedAge('all');
    setSelectedSchedule('all');
    setPagination(prev => ({ ...prev, page: 1 }));
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
    if (vacancy.salaryMax) {
      return `до ${vacancy.salaryMax.toLocaleString('ru-RU')} ₽`;
    }
    return 'По договоренности';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || { bg: 'bg-slate-500/10', text: 'text-slate-600', iconBg: 'bg-slate-500/10' };
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedCity !== 'all' || selectedAge !== 'all' || selectedSchedule !== 'all';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background">
          <div className="container px-4 py-12 md:py-16">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Все вакансии
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Найдите подходящую работу из тысяч проверенных вакансий для подростков
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl p-4 md:p-6 border-0 shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Поиск вакансий..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 h-12 text-lg border-0 bg-background"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                      <SelectTrigger className="w-full md:w-40 h-12 border-0 bg-background">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        <SelectValue placeholder="Город" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все города</SelectItem>
                        <SelectItem value="Уфа">Уфа</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleSearch}
                      className="h-12 px-6 bg-gradient-to-r from-primary to-blue-600"
                    >
                      <Search className="h-5 w-5 md:mr-2" />
                      <span className="hidden md:inline">Найти</span>
                    </Button>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="text-muted-foreground"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                  )}
                  <div className="flex-1" />
                  <div className="text-sm text-muted-foreground">
                    Найдено: <span className="font-semibold text-foreground">{pagination.total}</span> вакансий
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 bg-primary/5">
          <div className="container px-4 mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {Object.entries(categoryLabels).map(([key, label]) => {
                const colors = getCategoryColor(key);
                const Icon = categoryIcons[key] || Briefcase;
                const isSelected = selectedCategory === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryClick(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.text} ring-2 ring-primary/20`
                        : 'bg-card hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Extended Filters */}
        {showFilters && (
          <section className="py-6 border-b bg-card/50">
            <div className="container px-4 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Возраст</label>
                  <Select value={selectedAge} onValueChange={setSelectedAge}>
                    <SelectTrigger className="border-0 bg-background">
                      <SelectValue placeholder="Любой возраст" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любой возраст</SelectItem>
                      {Object.entries(ageLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">График</label>
                  <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                    <SelectTrigger className="border-0 bg-background">
                      <SelectValue placeholder="Любой график" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Любой график</SelectItem>
                      {Object.entries(scheduleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-end">
                  <Button onClick={handleSearch} className="w-full bg-gradient-to-r from-primary to-blue-600">
                    Применить фильтры
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Vacancies Grid */}
        <section className="py-12 md:py-16">
          <div className="container px-4 mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : vacancies.length === 0 ? (
              <div className="text-center py-16 bg-primary/5 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Вакансии не найдены</h3>
                <p className="text-muted-foreground mb-4">
                  Попробуйте изменить параметры поиска
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Сбросить фильтры
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {vacancies.map((vacancy) => {
                  const color = getCategoryColor(vacancy.category);
                  const CategoryIcon = categoryIcons[vacancy.category] || Briefcase;
                  const isViewed = viewedVacancies.has(vacancy.id);
                  const applicationStatus = vacancy.applicationStatus;
                  const hasChat = !!vacancy.chatRoomId;
                  const isRejected = applicationStatus === 'REJECTED';
                  const isAccepted = applicationStatus === 'ACCEPTED';
                  const isApplied = applicationStatus === 'SENT' || applicationStatus === 'VIEWED';
                  
                  return (
                    <Card key={vacancy.id} className={`flex flex-col border-0 shadow-sm hover:shadow-lg transition-all group relative ${isViewed ? 'opacity-80' : ''}`}>
                      {/* Status badges */}
                      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
                        {isViewed && !applicationStatus && (
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Просмотрено
                          </Badge>
                        )}
                        {isRejected && (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Вам отказали
                          </Badge>
                        )}
                        {isAccepted && (
                          <Badge className="bg-green-500 text-white text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Принят
                          </Badge>
                        )}
                        {isApplied && !isAccepted && !isRejected && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                            <Send className="h-3 w-3 mr-1" />
                            Отклик отправлен
                          </Badge>
                        )}
                      </div>
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className={`w-10 h-10 rounded-lg ${color.iconBg} flex items-center justify-center mb-3`}>
                              <CategoryIcon className={`h-5 w-5 ${color.text}`} />
                            </div>
                            <Badge className={`mb-2 ${color.bg} ${color.text} hover:${color.bg}`}>
                              {categoryLabels[vacancy.category] || vacancy.category}
                            </Badge>
                            <h3 className="font-semibold text-lg line-clamp-2">
                              <Link
                                href={`/vacancy/${vacancy.slug}`}
                                className="hover:text-primary transition-colors"
                                onClick={() => markAsViewed(vacancy.id)}
                              >
                                {vacancy.title}
                              </Link>
                            </h3>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {vacancy.description}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                            <span>{vacancy.city}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-purple-500" />
                            <span>{scheduleLabels[vacancy.schedule] || vacancy.schedule}</span>
                          </div>
                          <div className="flex items-center font-medium text-green-600 dark:text-green-400">
                            <Banknote className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span>{formatSalary(vacancy)}</span>
                          </div>
                        </div>
                      </CardContent>
                      
                      {/* Action buttons */}
                      <div className="px-6 pb-4 space-y-2">
                        {user?.role === 'TEENAGER' && (
                          <>
                            {!applicationStatus && (
                              <Button 
                                className="w-full" 
                                onClick={() => handleOpenApplyDialog(vacancy)}
                                disabled={isRejected}
                              >
                                Откликнуться
                              </Button>
                            )}
                            {(isApplied || isAccepted) && hasChat && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                onClick={() => handleOpenChat(vacancy)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Написать в чат
                              </Button>
                            )}
                            {isApplied && !hasChat && (
                              <Button 
                                variant="outline" 
                                className="w-full" 
                                disabled
                              >
                                Ожидайте ответа
                              </Button>
                            )}
                            {isRejected && (
                              <Button variant="outline" className="w-full" disabled>
                                <XCircle className="h-4 w-4 mr-2" />
                                Отказано
                              </Button>
                            )}
                          </>
                        )}
                        {user?.role === 'EMPLOYER' && vacancy.employer.userId === user.id && (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/vacancies/edit/${vacancy.id}`}>
                              Редактировать
                            </Link>
                          </Button>
                        )}
                        {(!user || user.role === 'ADMIN') && !isAuthenticated && (
                          <Button 
                            variant="outline" 
                            className="w-full" 
                            onClick={() => router.push('/login?redirect=/vacancies')}
                          >
                            Войти для отклика
                          </Button>
                        )}
                      </div>
                      
                      <CardFooter className="pt-0 border-t bg-muted/30">
                        <div className="flex items-center justify-between w-full pt-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-xs font-medium text-white">
                              {vacancy.employer.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[100px]">
                                {vacancy.employer.companyName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(vacancy.createdAt)}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={`text-xs ${ageColors[vacancy.ageRequirement] || ''}`}>
                            {ageLabels[vacancy.ageRequirement] || vacancy.ageRequirement}
                          </Badge>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={pagination.page === pageNum ? 'bg-primary' : ''}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary/5">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Почему выбирают нас</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <Briefcase className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">5,000+</div>
                  <div className="text-sm text-muted-foreground">Вакансий</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <Building2 className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">2,000+</div>
                  <div className="text-sm text-muted-foreground">Работодателей</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">10,000+</div>
                  <div className="text-sm text-muted-foreground">Подростков</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm text-center">
                <CardContent className="p-6">
                  <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">50,000+</div>
                  <div className="text-sm text-muted-foreground">Откликов</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container px-4 mx-auto">
            <Card className="border-0 bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-500/10">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Не нашли подходящую вакансию?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Зарегистрируйтесь и получайте уведомления о новых вакансиях, соответствующих вашим интересам
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-gradient-to-r from-primary to-blue-600">
                    <Link href="/register?role=teenager">
                      Создать аккаунт
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/">
                      На главную
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Apply Dialog */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Откликнуться на вакансию</DialogTitle>
            <DialogDescription>
              {selectedVacancy && (
                <span className="font-medium text-foreground">
                  {selectedVacancy.title} — {selectedVacancy.employer.companyName}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Сообщение работодателю (необязательно)
              </label>
              <Textarea
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                placeholder="Расскажите о себе и почему вы хотите получить эту работу..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {applyMessage.length}/1000 символов
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleApply} disabled={isApplying}>
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  'Отправить отклик'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function VacanciesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    }>
      <VacanciesPageContent />
    </Suspense>
  );
}
