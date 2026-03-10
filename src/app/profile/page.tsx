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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Briefcase,
  Edit2,
  Save,
  X,
  Loader2,
  Award,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Building2
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
    firstName: string;
    lastName: string;
    birthDate: string;
    city: string;
    district: string | null;
    bio: string | null;
    skills: string;
    hasParentConsent: boolean;
    consentStatus: string;
    rating: number;
    reviewsCount: number;
    completedJobs: number;
  } | null;
  stats: {
    applicationsCount: number;
    activeApplications: number;
    completedJobs: number;
    rating: number;
    reviewsCount: number;
  };
}

const skillOptions = [
  'Работа с компьютером',
  'Работа с детьми',
  'Курьерская доставка',
  'Уборка',
  'Репетиторство',
  'Продажи',
  'Общение с людьми',
  'Творчество',
  'Спорт',
  'Фото/Видео',
  'SMM',
  'Иностранные языки',
];

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuthStore();
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    city: '',
    district: '',
    bio: '',
    phone: '',
    skills: [] as string[],
  });

  useEffect(() => {
    if (!authLoading && !authUser) {
      router.push('/login');
    } else if (authUser && authUser.role !== 'TEENAGER') {
      // Redirect to appropriate profile page
      if (authUser.role === 'EMPLOYER') {
        router.push('/profile/employer');
      } else if (authUser.role === 'ADMIN') {
        router.push('/profile/admin');
      }
    }
  }, [authUser, authLoading, router]);

  useEffect(() => {
    if (authUser) {
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
        
        // Initialize form data
        if (data.profile) {
          setFormData({
            firstName: data.profile.firstName || '',
            lastName: data.profile.lastName || '',
            birthDate: data.profile.birthDate ? data.profile.birthDate.split('T')[0] : '',
            city: data.profile.city || '',
            district: data.profile.district || '',
            bio: data.profile.bio || '',
            phone: data.user.phone || '',
            skills: data.profile.skills ? JSON.parse(data.profile.skills) : [],
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

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
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

  const getConsentStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Подтверждено</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" />На проверке</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/10 text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Отклонено</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600"><AlertCircle className="h-3 w-3 mr-1" />Не загружено</Badge>;
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
  const age = profile?.birthDate ? calculateAge(profile.birthDate) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Profile Header */}
        <section className="bg-gradient-to-b from-primary/5 via-primary/3 to-background py-8">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {profile?.firstName?.[0]}{profile?.lastName?.[0]}
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
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <Badge className="bg-primary/10 text-primary">Подросток</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    {age && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {age} лет
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile?.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {profileData?.user.email}
                    </span>
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
                    <FileText className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.applicationsCount || 0}</div>
                    <div className="text-xs text-muted-foreground">Откликов</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.activeApplications || 0}</div>
                    <div className="text-xs text-muted-foreground">В процессе</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{stats?.completedJobs || 0}</div>
                    <div className="text-xs text-muted-foreground">Выполнено</div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Award className="h-6 w-6 text-purple-500 mx-auto mb-2" />
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
                  {/* Personal Info Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        Личная информация
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Имя</Label>
                              <Input
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Иван"
                              />
                            </div>
                            <div>
                              <Label>Фамилия</Label>
                              <Input
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Иванов"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Дата рождения</Label>
                              <Input
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
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
                              <Label>Город</Label>
                              <Input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Уфа"
                              />
                            </div>
                            <div>
                              <Label>Район</Label>
                              <Input
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                placeholder="Калининский"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>О себе</Label>
                            <Textarea
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                              placeholder="Расскажите о себе, своих увлечениях и опыте..."
                              rows={3}
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
                              <div className="text-sm text-muted-foreground mb-1">Дата рождения</div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('ru-RU') : 'Не указана'}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Район</div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{profile?.district || 'Не указан'}</span>
                              </div>
                            </div>
                          </div>
                          {profile?.bio && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">О себе</div>
                              <p className="text-sm">{profile.bio}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Skills Card */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Навыки и умения
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          {skillOptions.map((skill) => (
                            <button
                              key={skill}
                              onClick={() => toggleSkill(skill)}
                              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                formData.skills.includes(skill)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted hover:bg-muted/80'
                              }`}
                            >
                              {skill}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile?.skills ? (
                            JSON.parse(profile.skills).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="px-3 py-1">
                                {skill}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">Навыки не указаны</p>
                          )}
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
                        <span className="text-sm text-muted-foreground">Согласие родителей</span>
                        {getConsentStatusBadge(profile?.consentStatus || 'NOT_UPLOADED')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Аккаунт</span>
                        <Badge className="bg-green-500/10 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />Активен
                        </Badge>
                      </div>
                      {profile?.consentStatus === 'NOT_UPLOADED' && (
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Загрузить согласие
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Быстрые действия</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/dashboard">
                          <Briefcase className="h-4 w-4 mr-3 text-blue-500" />
                          Мои отклики
                        </Link>
                      </Button>
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/vacancies">
                          <FileText className="h-4 w-4 mr-3 text-green-500" />
                          Искать вакансии
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
