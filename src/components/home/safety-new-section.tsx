import { Card, CardContent } from '@/components/ui/card';
import { Shield, Users, CheckCircle, Eye, Lock, HeartHandshake } from 'lucide-react';

const safetyFeatures = [
  {
    icon: CheckCircle,
    title: 'Проверка работодателей',
    description: 'Все работодатели проходят верификацию по ИНН перед публикацией вакансий',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Users,
    title: 'Согласие родителей',
    description: 'Обязательное согласие родителей для подростков до 18 лет',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Eye,
    title: 'Модерация вакансий',
    description: 'Каждая вакансия проверяется модераторами на соответствие правилам',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Lock,
    title: 'Защита данных',
    description: 'Контакты открываются только после принятия отклика работодателем',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: Shield,
    title: 'Безопасный чат',
    description: 'Телефон и email скрываются до подтверждения сотрудничества',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
  {
    icon: HeartHandshake,
    title: 'Поддержка 24/7',
    description: 'Наша команда всегда готова помочь в любой ситуации',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
  },
];

export function SafetyNewSection() {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Безопасность — наш приоритет</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Мы создали безопасную среду для молодых работников
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyFeatures.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
