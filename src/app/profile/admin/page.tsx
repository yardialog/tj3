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
import { Label } from '@/components/ui/label';
import {
  Shield,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Loader2,
  CheckCircle,
  Users,
  Briefcase,
  FileText,
  AlertTriangle,
  Settings,
  BarChart3,
  Clock,
  Key
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface ProfileData {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    avatarUrl: string | null;
    phone: string | null;
    createdAt: string;
    lastLoginAt: string | null;
  };
  stats: {
    totalUsers: number;
    totalTeenagers: number;
    totalEmployers: number;
    totalVacancies: number;
    activeVacancies: number;
    pendingModeration: number;
    pendingConsents: number;
    pendingReports: number;
  };
}

export default function AdminProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuthStore();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
    } else if (authUser && authUser.role !== 'ADMIN') {
      router.push('/profile');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser && authUser.role === 'ADMIN') {
      fetchProfile();
    }
  }, [authUser]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
        setFormData({
          phone: data.user.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading || !authUser) {
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

  const stats = profileData?.stats;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-gradient-to-b from-red-500/10 via-red-500/5 to-background py-8">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white shadow-lg">
                    <Shield className="h-12 w-12" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-md">
                    <Key className="h-4 w-4 text-red-500" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      Администратор
                    </h1>
                    <Badge className="bg-red-500/10 text-red-600">Админ</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileData?.user.email}
                    </span>
                    {profileData?.user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {profileData.user.phone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)} variant="outline">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 border-b">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                    <div className="text-xs text-muted-foreground">Пользователей</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Briefcase className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.activeVacancies || 0}</div>
                    <div className="text-xs text-muted-foreground">Активных вакансий</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.pendingModeration || 0}</div>
                    <div className="text-xs text-muted-foreground">На модерации</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.pendingReports || 0}</div>
                    <div className="text-xs text-muted-foreground">Жалоб</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="md:col-span-2 space-y-6">
                  {/* Personal Info Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        Информация об аккаунте
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label>Телефон</Label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="+7 (999) 123-45-67"
                            />
                          </div>
                          <div className="flex gap-3 pt-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                              {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Сохранить
                            </Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                              <X className="h-4 w-4 mr-2" />
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Email</div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{profileData?.user.email}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Телефон</div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{profileData?.user.phone || 'Не указан'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Статус</div>
                              <Badge className="bg-green-500/10 text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />Активен
                              </Badge>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Роль</div>
                              <Badge className="bg-red-500/10 text-red-600">Администратор</Badge>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Platform Stats */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Статистика платформы
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">Подростки</span>
                          </div>
                          <div className="text-2xl font-bold">{stats?.totalTeenagers || 0}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-5 w-5 text-green-500" />
                            <span className="font-medium">Работодатели</span>
                          </div>
                          <div className="text-2xl font-bold">{stats?.totalEmployers || 0}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-5 w-5 text-purple-500" />
                            <span className="font-medium">Всего вакансий</span>
                          </div>
                          <div className="text-2xl font-bold">{stats?.totalVacancies || 0}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-5 w-5 text-yellow-500" />
                            <span className="font-medium">Согласий на проверке</span>
                          </div>
                          <div className="text-2xl font-bold">{stats?.pendingConsents || 0}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Управление</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/admin">
                          <Settings className="h-4 w-4 mr-3 text-red-500" />
                          Панель управления
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/admin?tab=vacancies">
                          <FileText className="h-4 w-4 mr-3 text-blue-500" />
                          Модерация вакансий
                          {stats?.pendingModeration ? (
                            <Badge className="ml-auto bg-yellow-500/10 text-yellow-600">
                              {stats.pendingModeration}
                            </Badge>
                          ) : null}
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/admin?tab=consents">
                          <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                          Согласия родителей
                          {stats?.pendingConsents ? (
                            <Badge className="ml-auto bg-yellow-500/10 text-yellow-600">
                              {stats.pendingConsents}
                            </Badge>
                          ) : null}
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/admin?tab=reports">
                          <AlertTriangle className="h-4 w-4 mr-3 text-orange-500" />
                          Жалобы
                          {stats?.pendingReports ? (
                            <Badge className="ml-auto bg-red-500/10 text-red-600">
                              {stats.pendingReports}
                            </Badge>
                          ) : null}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Account Info */}
                  <Card className="border-0 shadow-sm bg-muted/30">
                    <CardContent className="p-4 space-y-2">
                      <div className="text-xs text-muted-foreground">
                        Дата регистрации: {profileData?.user.createdAt ? new Date(profileData.user.createdAt).toLocaleDateString('ru-RU') : '—'}
                      </div>
                      {profileData?.user.lastLoginAt && (
                        <div className="text-xs text-muted-foreground">
                          Последний вход: {new Date(profileData.user.lastLoginAt).toLocaleDateString('ru-RU')}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Admin Notice */}
                  <Card className="border-0 shadow-sm bg-red-500/5 border-red-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-sm">Режим администратора</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Вы имеете полный доступ ко всем функциям платформы. 
                            Действия логируются в системе.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
