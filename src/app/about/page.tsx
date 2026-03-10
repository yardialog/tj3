import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  FileText,
  GraduationCap,
  Headphones,
  Rocket,
  Users,
  Building2,
  Heart,
  CheckCircle,
  XCircle,
  ArrowRight,
  Star,
  Briefcase,
  Phone,
  Mail
} from 'lucide-react';

const comparisonData = [
  { criteria: 'Возрастной ценз', traditional: 'Преимущественно 18+', ours: 'Специально для 14–17 лет' },
  { criteria: 'Безопасность', traditional: 'Модерация объявлений (часто формальная)', ours: 'Личная верификация работодателей' },
  { criteria: 'График', traditional: 'Полный день, строгие требования', ours: 'Гибкий график, подстройка под уроки' },
  { criteria: 'Требования', traditional: 'Опыт работы обязателен', ours: 'Опыт не нужен, всему научим' },
  { criteria: 'Документы', traditional: 'Самостоятельное оформление', ours: 'Помощь в оформлении договоров' },
  { criteria: 'Поддержка', traditional: 'Техподдержка по сайту', ours: 'Кураторство и помощь родителям' },
];

const features = [
  {
    icon: Shield,
    title: '100% Безопасность',
    description: 'Все работодатели проходят строгую проверку службы безопасности. Никаких «серых» схем и подозрительных предложений.',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    icon: FileText,
    title: 'Официальное оформление',
    description: 'Мы следим за соблюдением ТК РФ для несовершеннолетних: сокращенный день, запрет на вредное производство.',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    icon: GraduationCap,
    title: 'Учеба в приоритете',
    description: 'Вакансии с гибким графиком. Работай после уроков, в выходные или на каникулах.',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    icon: Headphones,
    title: 'Поддержка 24/7',
    description: 'Персональный куратор для подростка и консультация для родителей по вопросам трудового договора.',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    icon: Rocket,
    title: 'Карьерный старт',
    description: 'Вакансии не только «раздать листовки», но и стажировки в IT, дизайне, маркетинге и управлении.',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/3 to-background">
          <div className="container px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-primary/10 text-primary" variant="secondary">
                О проекте
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Мы меняем подход к{' '}
                <span className="text-primary">подростковому труду</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Традиционные сайты поиска работы созданы для взрослых. Мы же создали среду, где подросток чувствует себя уверенно, а родители спокойны за безопасность. Наша цель — не просто дать заработок, а помочь выбрать профессию, научиться финансовой грамотности и получить официальный трудовой стаж до совершеннолетия.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Почему выбирают нас?</h2>
              <p className="text-muted-foreground text-lg">5 причин доверить нам свой первый заработок</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Stats Card */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-blue-500/5">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-primary">10K+</div>
                      <div className="text-sm text-muted-foreground">Подростков</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-primary">5K+</div>
                      <div className="text-sm text-muted-foreground">Вакансий</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-primary">2K+</div>
                      <div className="text-sm text-muted-foreground">Работодателей</div>
                    </div>
                    <div className="text-center p-3">
                      <div className="text-3xl font-bold text-primary">98%</div>
                      <div className="text-sm text-muted-foreground">Довольных</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Чем мы отличаемся от других площадок</h2>
              <p className="text-muted-foreground text-lg">Сравнение с традиционными сайтами поиска работы</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-4 font-semibold">Критерий</th>
                        <th className="text-left p-4 font-semibold">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-muted-foreground" />
                            Традиционные сайты
                          </div>
                        </th>
                        <th className="text-left p-4 font-semibold">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            TeenJob
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-4 font-medium">{row.criteria}</td>
                          <td className="p-4 text-muted-foreground">{row.traditional}</td>
                          <td className="p-4 text-green-600 dark:text-green-400 font-medium">{row.ours}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* For Parents Section */}
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-pink-500/10 text-pink-600" variant="secondary">
                    👨‍👩‍👧 Для родителей
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Спокойствие за вашего ребенка
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Мы понимаем ваши опасения. Поэтому мы создали систему, которая гарантирует безопасность и законность каждой вакансии.
                  </p>
                  <ul className="space-y-3">
                    {[
                      'Проверяем юридическую чистоту компаний',
                      'Предоставляем шаблоны безопасных трудовых договоров',
                      'Информируем о правах несовершеннолетних работников',
                      'Гарантируем, что работа не повлияет на успеваемость',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500/5 to-purple-500/5">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
                          <Heart className="h-10 w-10 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Нужна консультация?</h3>
                        <p className="text-muted-foreground mb-6">
                          Наши специалисты ответят на все вопросы о трудоустройстве несовершеннолетних
                        </p>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>8 (800) 123-45-67</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>support@teenjob.ru</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* For Employers Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-blue-500/5 via-primary/3 to-background">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-green-500/5 text-center">
                          <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="font-semibold">10,000+</div>
                          <div className="text-xs text-muted-foreground">Кандидатов</div>
                        </div>
                        <div className="p-4 rounded-xl bg-blue-500/5 text-center">
                          <Briefcase className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                          <div className="font-semibold">Готовые</div>
                          <div className="text-xs text-muted-foreground">Документы</div>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/5 text-center">
                          <Star className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                          <div className="font-semibold">Высокая</div>
                          <div className="text-xs text-muted-foreground">Вовлеченность</div>
                        </div>
                        <div className="p-4 rounded-xl bg-orange-500/5 text-center">
                          <Building2 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                          <div className="font-semibold">Социальная</div>
                          <div className="text-xs text-muted-foreground">Ответственность</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="order-1 md:order-2">
                  <Badge className="mb-4 bg-blue-500/10 text-blue-600" variant="secondary">
                    🏢 Для работодателей
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Мотивированная молодежь для ваших задач
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Ищете стажеров, промоутеров или помощников на летний период? Получите доступ к базе лояльных и энергичных кандидатов.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'Доступ к базе лояльных и энергичных кандидатов',
                      'Готовые пакеты документов для найма несовершеннолетних',
                      'Низкий ФОТ при высокой вовлеченности',
                      'Имидж социально ответственной компании',
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-blue-600">
                    <Link href="/vacancies/create">
                      Разместить вакансию
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 bg-gradient-to-r from-primary to-blue-600 text-white">
                <CardContent className="p-8 md:p-12 text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    Готовы начать?
                  </h2>
                  <p className="text-white/80 mb-8 max-w-xl mx-auto">
                    Присоединяйтесь к TeenJob сегодня. Найдите первую работу или идеального кандидата — безопасно и просто.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" variant="secondary" className="text-primary">
                      <Link href="/register?role=teenager">
                        Я подросток
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      <Link href="/register?role=employer">
                        Я работодатель
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
