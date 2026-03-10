'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  Eye,
  Users,
  MoreVertical,
  Archive,
  RotateCcw,
  XCircle,
  Loader2,
  Plus,
  Clock,
  CheckCircle2,
  FileText,
  Inbox,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vacancy {
  id: string;
  title: string;
  slug: string;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  createdAt: string;
  city: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryFixed: number | null;
  rejectionReason?: string | null;
}

type TabValue = 'all' | 'active' | 'draft' | 'archive' | 'closed';

export default function MyVacanciesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'archive' | 'restore' | 'close' | null;
    vacancy: Vacancy | null;
  }>({ open: false, type: null, vacancy: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVacancies = useCallback(async () => {
    try {
      const res = await fetch('/api/vacancies/my');
      if (res.ok) {
        const data = await res.json();
        setVacancies(data.vacancies || []);
      }
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'DRAFT':
        return <FileText className="h-4 w-4 text-gray-500" />;
      case 'ON_MODERATION':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'ARCHIVED':
        return <Inbox className="h-4 w-4 text-gray-400" />;
      case 'CLOSED':
        return <Trash2 className="h-4 w-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getSalaryText = (vacancy: Vacancy) => {
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

  const handleStatusChange = async () => {
    if (!actionDialog.vacancy || !actionDialog.type) return;

    setIsSubmitting(true);
    try {
      let newStatus: string;

      switch (actionDialog.type) {
        case 'archive':
          newStatus = 'ARCHIVED';
          break;
        case 'restore':
          newStatus = 'DRAFT';
          break;
        case 'close':
          newStatus = 'CLOSED';
          break;
        default:
          return;
      }

      const res = await fetch(`/api/vacancies/${actionDialog.vacancy.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast({
          title: 'Успешно',
          description: getSuccessMessage(actionDialog.type),
        });
        fetchVacancies();
      } else {
        const data = await res.json();
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: data.error || 'Не удалось изменить статус вакансии',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Произошла ошибка при изменении статуса',
      });
    } finally {
      setIsSubmitting(false);
      setActionDialog({ open: false, type: null, vacancy: null });
    }
  };

  const getSuccessMessage = (type: string) => {
    switch (type) {
      case 'archive':
        return 'Вакансия перенесена в архив';
      case 'restore':
        return 'Вакансия восстановлена из архива';
      case 'close':
        return 'Вакансия закрыта';
      default:
        return 'Статус обновлен';
    }
  };

  const getActionTitle = () => {
    switch (actionDialog.type) {
      case 'archive':
        return 'Перенести в архив';
      case 'restore':
        return 'Восстановить из архива';
      case 'close':
        return 'Закрыть вакансию';
      default:
        return '';
    }
  };

  const getActionDescription = () => {
    switch (actionDialog.type) {
      case 'archive':
        return 'Вакансия будет перенесена в архив. Вы сможете восстановить её в любой момент.';
      case 'restore':
        return 'Вакансия будет восстановлена как черновик. Вы сможете отправить её на модерацию после редактирования.';
      case 'close':
        return 'Вакансия будет полностью закрыта. Это действие нельзя отменить.';
      default:
        return '';
    }
  };

  const getAvailableActions = (vacancy: Vacancy) => {
    const actions: { type: 'archive' | 'restore' | 'close'; icon: React.ReactNode; label: string; className?: string }[] = [];

    switch (vacancy.status) {
      case 'ACTIVE':
        actions.push(
          { type: 'archive', icon: <Archive className="h-4 w-4" />, label: 'В архив' },
          { type: 'close', icon: <XCircle className="h-4 w-4" />, label: 'Закрыть', className: 'text-red-600' }
        );
        break;
      case 'DRAFT':
      case 'REJECTED':
        actions.push(
          { type: 'archive', icon: <Archive className="h-4 w-4" />, label: 'В архив' }
        );
        break;
      case 'ARCHIVED':
      case 'CLOSED':
        actions.push(
          { type: 'restore', icon: <RotateCcw className="h-4 w-4" />, label: 'Восстановить' }
        );
        break;
    }

    return actions;
  };

  const filteredVacancies = vacancies.filter((v) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return v.status === 'ACTIVE';
    if (activeTab === 'draft') return ['DRAFT', 'ON_MODERATION', 'REJECTED'].includes(v.status);
    if (activeTab === 'archive') return v.status === 'ARCHIVED';
    if (activeTab === 'closed') return v.status === 'CLOSED';
    return true;
  });

  const getTabCounts = () => ({
    all: vacancies.length,
    active: vacancies.filter(v => v.status === 'ACTIVE').length,
    draft: vacancies.filter(v => ['DRAFT', 'ON_MODERATION', 'REJECTED'].includes(v.status)).length,
    archive: vacancies.filter(v => v.status === 'ARCHIVED').length,
    closed: vacancies.filter(v => v.status === 'CLOSED').length,
  });

  const counts = getTabCounts();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Мои вакансии</h1>
          <p className="text-muted-foreground">Управление вашими вакансиями</p>
        </div>
        <Button asChild>
          <Link href="/vacancies/create">
            <Plus className="h-4 w-4 mr-2" />
            Создать вакансию
          </Link>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="all" className="gap-2">
            Все
            <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Активные
            <Badge variant="secondary" className="ml-1">{counts.active}</Badge>
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            <FileText className="h-4 w-4" />
            Черновики
            <Badge variant="secondary" className="ml-1">{counts.draft}</Badge>
          </TabsTrigger>
          <TabsTrigger value="archive" className="gap-2">
            <Inbox className="h-4 w-4" />
            Архив
            <Badge variant="secondary" className="ml-1">{counts.archive}</Badge>
          </TabsTrigger>
          <TabsTrigger value="closed" className="gap-2">
            <Trash2 className="h-4 w-4" />
            Закрытые
            <Badge variant="secondary" className="ml-1">{counts.closed}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredVacancies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  {activeTab === 'all' && 'У вас пока нет вакансий'}
                  {activeTab === 'active' && 'Нет активных вакансий'}
                  {activeTab === 'draft' && 'Нет черновиков'}
                  {activeTab === 'archive' && 'Архив пуст'}
                  {activeTab === 'closed' && 'Нет закрытых вакансий'}
                </p>
                {activeTab === 'all' && (
                  <Button asChild>
                    <Link href="/vacancies/create">Создать вакансию</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredVacancies.map((vacancy) => (
                <Card key={vacancy.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="flex-1 p-4 sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(vacancy.status)}
                              {getVacancyStatusBadge(vacancy.status)}
                            </div>
                            <h3 className="font-semibold text-lg mb-1">{vacancy.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {vacancy.city} • {getSalaryText(vacancy)}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {vacancy.viewsCount} просмотров
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {vacancy.applicationsCount} откликов
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            {vacancy.status === 'REJECTED' && vacancy.rejectionReason && (
                              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                  <strong>Причина отклонения:</strong> {vacancy.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {vacancy.status === 'ACTIVE' && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/vacancy/${vacancy.slug}`}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Просмотр
                                </Link>
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {getAvailableActions(vacancy).map((action) => (
                                  <DropdownMenuItem
                                    key={action.type}
                                    className={action.className}
                                    onClick={() => setActionDialog({ open: true, type: action.type, vacancy })}
                                  >
                                    {action.icon}
                                    <span className="ml-2">{action.label}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{getActionTitle()}</AlertDialogTitle>
            <AlertDialogDescription>{getActionDescription()}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isSubmitting}
              className={actionDialog.type === 'close' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Подтвердить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
