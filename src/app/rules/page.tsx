import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Правила размещения вакансий</h1>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <Shield className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">Важно!</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Все вакансии проходят обязательную модерацию. Вакансии, нарушающие правила, будут отклонены.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
                <h2>1. Требования к работодателю</h2>
                <ul>
                  <li>Действующая компания или ИП с подтверждённым ИНН</li>
                  <li>Достоверная информация о компании</li>
                  <li>Контактные данные для связи</li>
                  <li>Отсутствие нарушений на платформе</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4">2. Что можно размещать</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Подработка для подростков 14–17 лет</p>
                      <p className="text-sm text-muted-foreground">Промоутер, курьер, репетитор, аниматор и др.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Гибкий график</p>
                      <p className="text-sm text-muted-foreground">Вечернее время, выходные, летняя подработка</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Безопасная работа</p>
                      <p className="text-sm text-muted-foreground">Без тяжёлых условий, в общественных местах</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">Официальное оформление</p>
                      <p className="text-sm text-muted-foreground">Трудовой договор или ГПХ с согласием родителей</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-semibold mb-4">3. Что нельзя размещать</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Вакансии с предоплатой</p>
                      <p className="text-sm text-muted-foreground">Работодатель не должен требовать деньги</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Контактные данные в описании</p>
                      <p className="text-sm text-muted-foreground">Телефоны, email, соцсети автоматически скрываются</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Опасная работа</p>
                      <p className="text-sm text-muted-foreground">Тяжёлые условия, ночное время, алкоголь/табак</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Мошеннические предложения</p>
                      <p className="text-sm text-muted-foreground">Сетевой маркетинг, пирамиды, онлайн-казино</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-600 dark:text-red-400">Непристойный контент</p>
                      <p className="text-sm text-muted-foreground">Оскорбления, дискриминация, запрещённая тематика</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6 md:p-8 prose prose-sm max-w-none">
                <h2>4. Требования к описанию</h2>
                <ul>
                  <li><strong>Название:</strong> понятное, отражающее суть работы</li>
                  <li><strong>Описание:</strong> минимум 50 символов, чёткие задачи и требования</li>
                  <li><strong>Зарплата:</strong> честная, соответствует рынку</li>
                  <li><strong>Местоположение:</strong> точный город, адрес при необходимости</li>
                  <li><strong>Категория:</strong> соответствующая типу работы</li>
                </ul>

                <h2>5. Лимиты размещения</h2>
                <p>
                  Каждый работодатель может иметь до <strong>5 активных вакансий</strong> одновременно.
                  Черновики и архивированные вакансии не учитываются в лимите.
                </p>

                <h2>6. Модерация</h2>
                <p>
                  Все вакансии проверяются модераторами в течение 1–2 рабочих дней.
                  При отклонении указывается причина. Вы можете исправить вакансию и отправить повторно.
                </p>

                <h2>7. Ответственность</h2>
                <p>
                  При нарушении правил работодатель может получить предупреждение или блокировку аккаунта.
                  Серьёзные нарушения приводят к永久ной блокировке.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-amber-500/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-600 dark:text-amber-400">Нужна помощь?</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Если у вас есть вопросы по размещению, напишите нам: <br />
                      <a href="mailto:support@teenjob.ru" className="text-primary hover:underline">support@teenjob.ru</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-muted-foreground text-xs mt-8 text-center">
              Последнее обновление: январь 2025 г.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
