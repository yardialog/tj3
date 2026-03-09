'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Save,
  Send,
  AlertCircle,
  Briefcase,
  MapPin,
  Banknote,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Shield,
  FileText,
  Hourglass,
  AlertTriangle,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const categories = [
  { value: 'TUTORING', label: 'Репетиторство', icon: '📚' },
  { value: 'IT', label: 'IT', icon: '💻' },
  { value: 'PROMOTER', label: 'Промоутер', icon: '📢' },
  { value: 'DELIVERY', label: 'Доставка', icon: '🚴' },
  { value: 'CLEANING', label: 'Уборка', icon: '🧹' },
  { value: 'ANIMATION', label: 'Аниматор', icon: '🎭' },
  { value: 'SERVICE', label: 'Сфера услуг', icon: '☕' },
  { value: 'OTHER', label: 'Другое', icon: '📋' },
];

const schedules = [
  { value: 'FULL_TIME', label: 'Полный день' },
  { value: 'PART_TIME', label: 'Частичная занятость' },
  { value: 'FLEXIBLE', label: 'Гибкий график' },
  { value: 'WEEKENDS', label: 'Выходные' },
  { value: 'EVENING', label: 'Вечернее время' },
  { value: 'SUMMER', label: 'Летняя подработка' },
];

const ageRequirements = [
  { value: 'AGE_14_15', label: '14-15 лет', desc: 'Для самых молодых' },
  { value: 'AGE_16_17', label: '16-17 лет', desc: 'Для старшеклассников' },
  { value: 'AGE_14_17', label: '14-17 лет', desc: 'Для всех подростков' },
];

const skillOptions = [
  { name: 'Активность', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { name: 'Общение', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { name: 'Ответственность', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  { name: 'Работа в команде', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  { name: 'ПК / IT', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  { name: 'Английский язык', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { name: 'Творчество', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  { name: 'Готовка', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  { name: 'Вождение', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
];

export default function CreateVacancyPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, authenticatedFetch } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isModeration, setIsModeration] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [activeVacanciesCount, setActiveVacanciesCount] = useState(0);

  const MAX_VACANCIES = 5;
  const isLimitReached = activeVacanciesCount >= MAX_VACANCIES;

  // Check if employer is verified
  const isVerified = user?.employer?.verificationStatus === 'VERIFIED';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ageRequirement: 'AGE_14_17',
    schedule: 'FLEXIBLE',
    city: user?.employer?.city || '',
    address: '',
    salaryType: 'fixed',
    salaryFixed: '',
    salaryMin: '',
    salaryMax: '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'EMPLOYER') {
      router.push('/');
    }
  }, [user, authLoading, isAuthenticated, router]);

  // Fetch active vacancies count
  useEffect(() => {
    const fetchVacanciesCount = async () => {
      try {
        const response = await authenticatedFetch('/api/vacancies/my');
        if (response.ok) {
          const data = await response.json();
          const active = data.vacancies?.filter((v: { status: string }) => v.status === 'ACTIVE').length || 0;
          setActiveVacanciesCount(active);
        }
      } catch (error) {
        console.error('Error fetching vacancies count:', error);
      }
    };

    if (isAuthenticated && user?.role === 'EMPLOYER') {
      fetchVacanciesCount();
    }
  }, [isAuthenticated, user, authenticatedFetch]);

  if (authLoading) {
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

  if (!isAuthenticated || user?.role !== 'EMPLOYER') {
    return null;
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (!formData.title || !formData.description || !formData.category || !formData.city) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (formData.description.length < 50) {
      toast.error('Описание должно содержать минимум 50 символов');
      return;
    }

    // If not verified and trying to publish, show warning
    if (!isVerified && publish) {
      toast.error('Ваша компания должна быть верифицирована для публикации вакансий');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authenticatedFetch('/api/vacancies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          salaryFixed: formData.salaryFixed ? parseInt(formData.salaryFixed) : null,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          requiredSkills: selectedSkills,
          status: publish ? 'ON_MODERATION' : 'DRAFT',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Сессия истекла. Пожалуйста, войдите снова.');
          router.push('/login');
          return;
        }
        throw new Error(data.error || 'Ошибка при создании вакансии');
      }

      setIsModeration(publish);
      setNeedsVerification(data.needsVerification || false);
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании вакансии');
    } finally {
      setIsLoading(false);
    }
  };

  const getSkillColor = (skill: string) => {
    const found = skillOptions.find(s => s.name === skill);
    return found?.color || 'bg-muted text-foreground';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background">
          <div className="container px-4 py-8 md:py-12">
            {/* Back button */}
            <Button variant="ghost" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground" asChild>
              <Link href="/dashboard/employer">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Назад к дашборду
              </Link>
            </Button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Создание вакансии</h1>
                <p className="text-muted-foreground">
                  Заполните информацию о вакансии. После отправки она пройдет модерацию.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-8">
          <div className="container px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <h2 className="text-xl font-bold">Основная информация</h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="title" className="text-base font-medium">Название вакансии *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Например: Промоутер на выставку"
                          className="mt-2 h-12"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base font-medium">Описание *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Опишите задачи, требования и условия работы..."
                          className="mt-2 min-h-[180px]"
                        />
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            Минимум 50 символов
                          </p>
                          <p className={`text-xs ${formData.description.length < 50 ? 'text-red-500' : 'text-green-500'}`}>
                            {formData.description.length}/5000
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="category" className="text-base font-medium">Категория *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => setFormData({ ...formData, category: value })}
                          >
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <span className="mr-2">{cat.icon}</span>
                                  {cat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="ageRequirement" className="text-base font-medium">Возраст *</Label>
                          <Select
                            value={formData.ageRequirement}
                            onValueChange={(value) => setFormData({ ...formData, ageRequirement: value })}
                          >
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ageRequirements.map((age) => (
                                <SelectItem key={age.value} value={age.value}>
                                  <div className="flex flex-col">
                                    <span>{age.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-500" />
                      </div>
                      <h2 className="text-xl font-bold">Местоположение</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-base font-medium">Город *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Уфа"
                            className="mt-2 h-12"
                          />
                        </div>

                        <div>
                          <Label htmlFor="schedule" className="text-base font-medium">График работы</Label>
                          <Select
                            value={formData.schedule}
                            onValueChange={(value) => setFormData({ ...formData, schedule: value })}
                          >
                            <SelectTrigger className="mt-2 h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {schedules.map((sch) => (
                                <SelectItem key={sch.value} value={sch.value}>
                                  {sch.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-base font-medium">Адрес (необязательно)</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="ул. Примерная, д. 1"
                          className="mt-2 h-12"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Укажите точный адрес, если это важно для работы
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Salary Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Banknote className="h-5 w-5 text-amber-500" />
                      </div>
                      <h2 className="text-xl font-bold">Оплата</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant={formData.salaryType === 'fixed' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, salaryType: 'fixed' })}
                          className={formData.salaryType === 'fixed' ? 'bg-primary' : ''}
                        >
                          Фиксированная
                        </Button>
                        <Button
                          type="button"
                          variant={formData.salaryType === 'range' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, salaryType: 'range' })}
                          className={formData.salaryType === 'range' ? 'bg-primary' : ''}
                        >
                          Диапазон
                        </Button>
                        <Button
                          type="button"
                          variant={formData.salaryType === 'negotiable' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFormData({ ...formData, salaryType: 'negotiable' })}
                          className={formData.salaryType === 'negotiable' ? 'bg-primary' : ''}
                        >
                          По договоренности
                        </Button>
                      </div>

                      {formData.salaryType === 'fixed' && (
                        <div className="max-w-xs">
                          <Label htmlFor="salaryFixed" className="text-base font-medium">Сумма (₽)</Label>
                          <Input
                            id="salaryFixed"
                            type="number"
                            value={formData.salaryFixed}
                            onChange={(e) => setFormData({ ...formData, salaryFixed: e.target.value })}
                            placeholder="5000"
                            className="mt-2 h-12"
                          />
                        </div>
                      )}

                      {formData.salaryType === 'range' && (
                        <div className="grid grid-cols-2 gap-4 max-w-md">
                          <div>
                            <Label htmlFor="salaryMin" className="text-base font-medium">От (₽)</Label>
                            <Input
                              id="salaryMin"
                              type="number"
                              value={formData.salaryMin}
                              onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                              placeholder="3000"
                              className="mt-2 h-12"
                            />
                          </div>
                          <div>
                            <Label htmlFor="salaryMax" className="text-base font-medium">До (₽)</Label>
                            <Input
                              id="salaryMax"
                              type="number"
                              value={formData.salaryMax}
                              onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                              placeholder="5000"
                              className="mt-2 h-12"
                            />
                          </div>
                        </div>
                      )}

                      {formData.salaryType === 'negotiable' && (
                        <p className="text-muted-foreground">
                          Зарплата будет обсуждаться индивидуально с каждым кандидатом
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">Требуемые навыки</h2>
                        <p className="text-sm text-muted-foreground">
                          Выберите навыки, которые важны для этой работы
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skillOptions.map((skill) => {
                        const isSelected = selectedSkills.includes(skill.name);
                        return (
                          <button
                            key={skill.name}
                            type="button"
                            onClick={() => toggleSkill(skill.name)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              isSelected
                                ? `${skill.color} ring-2 ring-primary/20`
                                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {skill.name}
                          </button>
                        );
                      })}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Выбрано: {selectedSkills.length} навыков
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Limit Reached Warning */}
                {isLimitReached && (
                  <Card className="border-red-500/50 bg-red-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">
                            Достигнут лимит вакансий
                          </h4>
                          <p className="text-sm text-muted-foreground mb-3">
                            У вас уже <strong>{activeVacanciesCount}</strong> активных вакансий из <strong>{MAX_VACANCIES}</strong> возможных.
                            Чтобы создать новую, архивируйте или закройте существующие.
                          </p>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/vacancies/my">
                              <Archive className="h-4 w-4 mr-2" />
                              Управлять вакансиями
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Verification Warning - Show if not verified */}
                {!isVerified && (
                  <Card className="border-amber-500/50 bg-amber-500/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <Hourglass className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                            Требуется верификация
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Ваша компания должна быть верифицирована для публикации вакансий.
                            Вы можете сохранить вакансию как черновик и отправить её после верификации.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions Card */}
                <Card className="border-0 shadow-lg sticky top-4">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Действия</h3>

                    <div className="space-y-3">
                      {isLimitReached ? (
                        <Button
                          className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          size="lg"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Лимит вакансий достигнут
                        </Button>
                      ) : isVerified ? (
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-blue-600"
                          onClick={() => handleSubmit(true)}
                          disabled={isLoading}
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Отправка...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Отправить на модерацию
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                          disabled
                          size="lg"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Требуется верификация
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleSubmit(false)}
                        disabled={isLoading || isLimitReached}
                        size="lg"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить черновик
                      </Button>
                    </div>

                    <Separator className="my-6" />

                    {/* Vacancies Counter */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Активных вакансий</span>
                        <span className={`font-bold ${isLimitReached ? 'text-red-500' : 'text-foreground'}`}>
                          {activeVacanciesCount}/{MAX_VACANCIES}
                        </span>
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isLimitReached ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${(activeVacanciesCount / MAX_VACANCIES) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Form Status */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">Статус заполнения</h4>

                      <div className="flex items-center gap-2 text-sm">
                        {formData.title ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={formData.title ? 'text-foreground' : 'text-muted-foreground'}>
                          Название
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {formData.description.length >= 50 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={formData.description.length >= 50 ? 'text-foreground' : 'text-muted-foreground'}>
                          Описание
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {formData.category ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={formData.category ? 'text-foreground' : 'text-muted-foreground'}>
                          Категория
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        {formData.city ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className={formData.city ? 'text-foreground' : 'text-muted-foreground'}>
                          Город
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Moderation Info Card */}
                <Card className="border-0 bg-gradient-to-br from-primary/5 to-blue-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Модерация</h4>
                        <p className="text-sm text-muted-foreground">
                          После отправки вакансия пройдет проверку. Обычно это занимает 1-2 рабочих дня.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips Card */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Советы
                    </h4>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Опишите задачи понятно и подробно
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Укажите реальную зарплату
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Не указывайте контакты в описании
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        Выберите подходящие навыки
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

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4">
              {needsVerification ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Hourglass className="h-8 w-8 text-amber-500" />
                </div>
              ) : isModeration ? (
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Hourglass className="h-8 w-8 text-amber-500" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              )}
            </div>
            <DialogTitle className="text-xl">
              {needsVerification
                ? 'Требуется верификация!'
                : isModeration
                ? 'Вакансия отправлена на модерацию!'
                : 'Черновик сохранён!'}
            </DialogTitle>
            <DialogDescription className="text-center mt-2">
              {needsVerification ? (
                <>
                  Ваша вакансия <strong>{formData.title}</strong> сохранена как черновик.
                  <br /><br />
                  <span className="text-amber-600 dark:text-amber-400">
                    Для публикации вакансии ваша компания должна быть верифицирована.
                  </span>
                  <br /><br />
                  После верификации вы сможете отправить вакансию на модерацию.
                </>
              ) : isModeration ? (
                <>
                  Ваша вакансия <strong>{formData.title}</strong> отправлена на проверку.
                  <br /><br />
                  Обычно модерация занимает 1-2 рабочих дня.
                  <br />
                  Мы уведомим вас о результате по email.
                </>
              ) : (
                <>
                  Черновик вакансии <strong>{formData.title}</strong> сохранён.
                  <br /><br />
                  Вы можете вернуться к редактированию в любой момент.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              className="w-full bg-gradient-to-r from-primary to-blue-600"
              onClick={() => router.push('/dashboard/employer')}
            >
              Перейти в дашборд
            </Button>
            {(isModeration || needsVerification) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowSuccessModal(false);
                  setFormData({
                    title: '',
                    description: '',
                    category: '',
                    ageRequirement: 'AGE_14_17',
                    schedule: 'FLEXIBLE',
                    city: user?.employer?.city || '',
                    address: '',
                    salaryType: 'fixed',
                    salaryFixed: '',
                    salaryMin: '',
                    salaryMax: '',
                  });
                  setSelectedSkills([]);
                }}
              >
                Создать ещё одну вакансию
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
