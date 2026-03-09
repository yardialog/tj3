import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Target, 
  Lightbulb, 
  Users, 
  Shield, 
  Rocket,
  Star,
  Globe
} from 'lucide-react';

const missionPoints = [
  {
    icon: Shield,
    title: 'Безопасность',
    description: 'Создаём защищённую среду, где подростки могут безопасно искать работу',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Lightbulb,
    title: 'Развитие',
    description: 'Помогаем молодым людям получить первый опыт и развить навыки',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: Users,
    title: 'Доверие',
    description: 'Строим прозрачные отношения между работодателями и подростками',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Rocket,
    title: 'Возможности',
    description: 'Открываем двери к тысячам вакансий от проверенных компаний',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

const stats = [
  { value: '10,000+', label: 'Подростков нашли работу', icon: Star },
  { value: '5,000+', label: 'Проверенных вакансий', icon: Globe },
  { value: '98%', label: 'Довольных пользователей', icon: Heart },
];

export function AboutNewSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        {/* Mission Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Наша миссия</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Мы верим, что каждый подросток заслуживает возможность получить первый опыт работы 
            в безопасной и поддерживающей среде. TeenJob — мост между амбициозной молодёжью 
            и ответственными работодателями.
          </p>
        </div>

        {/* Mission Points */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {missionPoints.map((point, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card/80">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 rounded-full ${point.bgColor} flex items-center justify-center mx-auto mb-4`}>
                  <point.icon className={`h-7 w-7 ${point.color}`} />
                </div>
                <h3 className="font-semibold mb-2">{point.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {point.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-primary/5 via-blue-500/5 to-purple-500/5 rounded-2xl p-6 md:p-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12 text-center">
          <blockquote className="text-xl md:text-2xl font-medium italic text-muted-foreground max-w-3xl mx-auto">
            "Каждый великий профессионал когда-то был подростком, ищущим свой путь. 
            Мы помогаем сделать первый шаг."
          </blockquote>
        </div>
      </div>
    </section>
  );
}
