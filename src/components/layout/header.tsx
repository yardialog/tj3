'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  User, 
  LogOut, 
  Briefcase, 
  MessageSquare, 
  Settings,
  Shield,
  Plus,
  LayoutDashboard
} from 'lucide-react';

const navLinks = [
  { href: '/vacancies', label: 'Вакансии' },
  { href: '/learn', label: 'Обучение' },
  { href: '/about', label: 'О проекте' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getInitials = () => {
    if (user?.teenager) {
      return `${user.teenager.firstName[0]}${user.teenager.lastName[0]}`;
    }
    if (user?.employer) {
      return user.employer.companyName.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.teenager) {
      return `${user.teenager.firstName} ${user.teenager.lastName}`;
    }
    if (user?.employer) {
      return user.employer.companyName;
    }
    return user?.email;
  };

  const getRoleBadge = () => {
    if (user?.role === 'TEENAGER') {
      return <Badge variant="secondary" className="ml-2">Подросток</Badge>;
    }
    if (user?.role === 'EMPLOYER') {
      return <Badge variant="default" className="ml-2">Работодатель</Badge>;
    }
    if (user?.role === 'ADMIN') {
      return <Badge variant="destructive" className="ml-2">Админ</Badge>;
    }
    return null;
  };

  const getProfileUrl = () => {
    if (user?.role === 'ADMIN') return '/profile/admin';
    if (user?.role === 'EMPLOYER') return '/profile/employer';
    return '/profile';
  };

  const getDashboardUrl = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'EMPLOYER') return '/dashboard/employer';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            TJ
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">TeenJob</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 flex items-center space-x-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline-block text-sm">{getDisplayName()}</span>
                  {getRoleBadge()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(getDashboardUrl())}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{user?.role === 'ADMIN' ? 'Админ-панель' : 'Дашборд'}</span>
                </DropdownMenuItem>
                {user?.role === 'EMPLOYER' && (
                  <DropdownMenuItem onClick={() => router.push('/vacancies/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Создать вакансию</span>
                  </DropdownMenuItem>
                )}
                {user?.role !== 'ADMIN' && (
                  <DropdownMenuItem onClick={() => router.push('/messages')}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Сообщения</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push(getProfileUrl())}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Профиль</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Войти
              </Button>
              <Button onClick={() => router.push('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col space-y-4 mt-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 mb-4 px-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{getDisplayName()}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => { router.push(getDashboardUrl()); setMobileMenuOpen(false); }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {user?.role === 'ADMIN' ? 'Админ-панель' : 'Дашборд'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start mt-2"
                      onClick={() => { router.push(getProfileUrl()); setMobileMenuOpen(false); }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Профиль
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start mt-4"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => { router.push('/login'); setMobileMenuOpen(false); }}
                    >
                      Войти
                    </Button>
                    <Button 
                      className="w-full mt-2"
                      onClick={() => { router.push('/register'); setMobileMenuOpen(false); }}
                    >
                      Регистрация
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
