import Link from 'next/link';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  platform: [
    { name: 'О проекте', href: '/about' },
    { name: 'Вакансии', href: '/vacancies' },
    { name: 'Обучение', href: '/learn' },
    { name: 'Как это работает', href: '/#how-it-works' },
    { name: 'Для подростков', href: '/register?role=teenager' },
    { name: 'Для работодателей', href: '/register?role=employer' },
  ],
  support: [
    { name: 'Помощь', href: '/#faq' },
    { name: 'Безопасность', href: '/#safety' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Обратная связь', href: 'mailto:support@teenjob.ru' },
  ],
  legal: [
    { name: 'Пользовательское соглашение', href: '/terms' },
    { name: 'Политика конфиденциальности', href: '/privacy' },
    { name: 'Правила размещения', href: '/rules' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                TJ
              </div>
              <span className="text-xl font-bold">TeenJob</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Биржа труда для подростков 14–17 лет. Находим первую работу безопасно и быстро.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@teenjob.ru" className="hover:text-foreground transition-colors">support@teenjob.ru</a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>8 (800) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Уфа, Россия</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="font-semibold mb-4">Платформа</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold mb-4">Поддержка</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Правовая информация</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} TeenJob. Все права защищены.
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground">
              Сделано с заботой о подростках
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
