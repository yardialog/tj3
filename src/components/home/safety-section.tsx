import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  CheckCircle, 
  FileCheck, 
  MessageSquareWarning, 
  Ban,
  Eye,
  AlertTriangle
} from 'lucide-react';

const safetyFeatures = [
  {
    icon: FileCheck,
    title: 'Верификация работодателей',
    description: 'Проверка ИНН и документов компании перед размещением вакансий',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Eye,
    title: 'Модерация вакансий',
    description: 'Каждая вакансия проходит проверку на соответствие правилам',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: MessageSquareWarning,
    title: 'Фильтр нежелательного контента',
    description: 'Автоматическая блокировка нецензурной лексики и спама',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    icon: Ban,
    title: 'Защита контактов',
    description: 'Личные данные открываются только после принятия отклика',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
];

const safetyTips = [
  'Никогда не платите за трудоустройство',
  'Встречайтесь с работодателем в общественных местах',
  'Сообщите родителям о предстоящей встрече',
  'Не передавайте паспортные данные по телефону',
  'Оформите трудовой договор перед началом работы',
];

export function SafetySection() {
  return (
    <section id="safety" className="py-16 md:py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20">
            <Shield className="w-3 h-3 mr-1" />
            Безопасность
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Правила безопасности
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Важные советы для безопасного поиска работы
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Safety Features */}
          <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 rounded-2xl p-6 md:p-8">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Наши меры защиты
            </h3>
            <div className="space-y-4">
              {safetyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-card rounded-2xl p-6 md:p-8 border-0 shadow-sm">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Советы для подростков
            </h3>
            <ul className="space-y-4">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${
                    index < 2 ? 'bg-red-500' : index < 4 ? 'bg-amber-500' : 'bg-green-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm pt-1">{tip}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Важно:</strong> Если вы столкнулись с мошенничеством или 
                  нарушением правил, немедленно сообщите нам через кнопку «Пожаловаться».
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
