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
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  Briefcase,
  Edit2,
  Save,
  X,
  Loader2,
  Globe,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Users,
  Link as LinkIcon,
  Calendar
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
  profile: {
    id: string;
    companyName: string;
    inn: string;
    logoUrl: string | null;
    website: string | null;
    description: string | null;
    city: string;
    address: string | null;
    verificationStatus: string;
    rating: number;
    reviewsCount: number;
    activeVacanciesCount: number;
  } | null;
  vacancies: Array<{
    id: string;
    title: string;
    status: string;
    applicationsCount: number;
    createdAt: string;
  }>;
  stats: {
    totalVacancies: number;
    activeVacancies: number;
    totalApplications: number;
    rating: number;
    reviewsCount: number;
  };
}

export default function EmployerProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuthStore();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    inn: '',
    website: '',
    description: '',
    city: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
    } else if (authUser && authUser.role !== 'EMPLOYER') {
      router.push('/profile');
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser && authUser.role === 'EMPLOYER') {
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
        
        if (data.profile) {
          setFormData({
            companyName: data.profile.companyName || '',
            inn: data.profile.inn || '',
            website: data.profile.website || '',
            description: data.profile.description || '',
            city: data.profile.city || '',
            address: data.profile.address || '',
            phone: data.user.phone || '',
          });
        }
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

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Верифицирован</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />На проверке</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Отклонён</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600"><AlertCircle className="h-3 w-3 mr-1" />Не верифицирован</Badge>;
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

  const profile = profileData?.profile;
  const stats = profileData?.stats;
  const vacancies = profileData?.vacancies || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background py-8">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Logo */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile?.companyName?.[0]}
                  </div>
                  {profile?.rating > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-md flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold">{profile.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {profile?.companyName}
                    </h1>
                    <Badge className="bg-blue-500/10 text-blue-600">Работодатель</Badge>
                    {getVerificationStatusBadge(profile?.verificationStatus || 'NOT_UPLOADED')}
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile?.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileData?.user.email}
                    </span>
                    {profile?.website && (
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Сайт
                      </a>
                    )}
                  </div>
                </div>

                {/* Edit Button */}
                {!isEditing && (
                  <div className="flex gap-3">
                    <Button asChild className="bg-gradient-to-r from-primary to-blue-600">
                      <Link href="/vacancies/create">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Создать вакансию
                      </Link>
                    </Button>
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit2 className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </div>
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
                    <Briefcase className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.totalVacancies || 0}</div>
                    <div className="text-xs text-muted-foreground">Вакансий</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.activeVacancies || 0}</div>
                    <div className="text-xs text-muted-foreground">Активных</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
                    <div className="text-xs text-muted-foreground">Откликов</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.reviewsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Отзывов</div>
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
                  {/* Company Info Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Информация о компании
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Название компании</Label>
                              <Input
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                placeholder="ООО Компания"
                              />
                            </div>
                            <div>
                              <Label>ИНН</Label>
                              <Input
                                value={formData.inn}
                                onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                                placeholder="1234567890"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Город</Label>
                              <Input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Уфа"
                              />
                            </div>
                            <div>
                              <Label>Телефон</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+7 (999) 123-45-67"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Сайт</Label>
                              <Input
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://example.com"
                              />
                            </div>
                            <div>
                              <Label>Адрес офиса</Label>
                              <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="ул. Примерная, 1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Описание компании</Label>
                            <Textarea
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              placeholder="Расскажите о вашей компании..."
                              rows={4}
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
                              <div className="text-sm text-muted-foreground mb-1">ИНН</div>
                              <div className="font-mono">{profile?.inn}</div>
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
                              <div className="text-sm text-muted-foreground mb-1">Сайт</div>
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                {profile?.website ? (
                                  <a 
                                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {profile.website}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">Не указан</span>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Адрес</div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{profile?.address || 'Не указан'}</span>
                              </div>
                            </div>
                          </div>
                          {profile?.description && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">О компании</div>
                              <p className="text-sm">{profile.description}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Vacancies */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Активные вакансии
                        </CardTitle>
                        <Button asChild size="sm">
                          <Link href="/dashboard/employer">Все вакансии</Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {vacancies.length === 0 ? (
                        <div className="text-center py-6">
                          <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground text-sm mb-3">У вас пока нет активных вакансий</p>
                          <Button asChild size="sm">
                            <Link href="/vacancies/create">Создать вакансию</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {vacancies.map((vacancy) => (
                            <div
                              key={vacancy.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                              <div>
                                <h4 className="font-medium">{vacancy.title}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {vacancy.applicationsCount} откликов
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              <Badge className="bg-green-500/10 text-green-600">Активна</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Status & Actions */}
                <div className="space-y-6">
                  {/* Verification Status */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Статус верификации
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Компания</span>
                        {getVerificationStatusBadge(profile?.verificationStatus || 'NOT_UPLOADED')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Аккаунт</span>
                        <Badge className="bg-green-500/10 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />Активен
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/vacancies/create">
                          <Briefcase className="h-4 w-4 mr-3 text-green-500" />
                          Создать вакансию
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/dashboard/employer">
                          <Users className="h-4 w-4 mr-3 text-blue-500" />
                          Управлять вакансиями
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
