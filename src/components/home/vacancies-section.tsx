'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Search, 
  MapPin, 
  Clock, 
  Banknote, 
  Briefcase,
  ArrowRight,
  Loader2,
  Users
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
    companyName: string;
    logoUrl: string | null;
    rating: number;
  };
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

const categoryColors: Record<string, { bg: string; text: string }> = {
  TUTORING: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  IT: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  PROMOTER: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  DELIVERY: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400' },
  CLEANING: { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  ANIMATION: { bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
  SERVICE: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  OTHER: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
};

export function VacanciesSection() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedCity) params.append('city', selectedCity);
      params.append('limit', '12');

      const response = await fetch(`/api/vacancies?${params.toString()}`);
      const data = await response.json();
      setVacancies(data.vacancies || []);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setIsLoading(false);
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
    return categoryColors[category] || { bg: 'bg-slate-500/10', text: 'text-slate-600' };
  };

  return (
    <section id="vacancies" className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Актуальные вакансии
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Найдите подходящую работу из тысяч проверенных вакансий
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-xl p-4 md:p-6 mb-8 border-0 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск вакансий..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="border-0 bg-background">
                <SelectValue placeholder="Категория" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchVacancies} className="w-full bg-gradient-to-r from-primary to-blue-600">
              <Search className="mr-2 h-4 w-4" />
              Найти
            </Button>
          </div>
        </div>

        {/* Vacancies Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : vacancies.length === 0 ? (
          <div className="text-center py-12 bg-primary/5 rounded-xl">
            <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Вакансии не найдены</h3>
            <p className="text-muted-foreground">
              Попробуйте изменить параметры поиска
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vacancies.map((vacancy) => {
              const color = getCategoryColor(vacancy.category);
              return (
                <Card key={vacancy.id} className="flex flex-col border-0 shadow-sm hover:shadow-lg transition-all group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className={`mb-2 ${color.bg} ${color.text} hover:${color.bg}`}>
                          {categoryLabels[vacancy.category] || vacancy.category}
                        </Badge>
                        <h3 className="font-semibold text-lg line-clamp-2">
                          <Link 
                            href={`/vacancy/${vacancy.slug}`}
                            className="hover:text-primary transition-colors"
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
                      <Badge variant="outline" className="text-xs">
                        {ageLabels[vacancy.ageRequirement] || vacancy.ageRequirement}
                      </Badge>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Show More Button */}
        {vacancies.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild className="px-8">
              <Link href="/vacancies">
                Смотреть все вакансии
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
