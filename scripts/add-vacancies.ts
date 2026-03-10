import { PrismaClient, VacancyCategory, VacancyStatus, AgeRequirement, WorkSchedule } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Найти работодателя по email
  const user = await prisma.user.findUnique({
    where: { email: 'hr@techstart.ru' },
    include: { employer: true },
  });

  if (!user || !user.employer) {
    console.error('Работодатель не найден!');
    return;
  }

  const employerId = user.employer.id;
  console.log(`Работодатель найден: ${user.employer.companyName} (ID: ${employerId})`);

  const vacancies = [
    {
      title: 'Помощник по работе с социальными сетями',
      slug: 'pomoshchnik-po-rabote-s-socialnymi-setyami',
      description: 'Ищем творческого подростка для помощи в ведении социальных сетей компании. Вы будете помогать создавать контент, отвечать на комментарии, следить за трендами. Опыт не обязателен — всему научим! Нужны: креативность, грамотная речь, активность в соцсетях. Работа удалённая, гибкий график.',
      category: VacancyCategory.IT,
      ageRequirement: AgeRequirement.AGE_14_17,
      salaryFixed: 15000,
      salaryType: 'fixed',
      schedule: WorkSchedule.FLEXIBLE,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Промоутер на выходные',
      slug: 'promouter-na-vyhodnye',
      description: 'Требуются промоутеры для раздачи листовок и привлечения клиентов. Работа на свежем воздухе в торговых центрах. Общительность и активность приветствуются. Униформа предоставляется. Возможность совмещать с учёбой.',
      category: VacancyCategory.PROMOTER,
      ageRequirement: AgeRequirement.AGE_14_17,
      salaryFixed: 1200,
      salaryType: 'fixed',
      schedule: WorkSchedule.WEEKENDS,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Курьер-доставщик',
      slug: 'kurer-dostavshchik',
      description: 'Ищем ответственных курьеров для доставки мелкогабаритных грузов. Требуется знание города, наличие велосипеда или самоката. Оплата за каждую доставку + чаевые. Гибкий график, возможность работать после школы.',
      category: VacancyCategory.DELIVERY,
      ageRequirement: AgeRequirement.AGE_16_17,
      salaryMin: 800,
      salaryMax: 2000,
      salaryType: 'range',
      schedule: WorkSchedule.FLEXIBLE,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Репетитор по математике для младших классов',
      slug: 'repetitor-po-matematike-dlya-mladshih-klassov',
      description: 'Ищем старшеклассников с отличными знаниями по математике для помощи ученикам 1-6 классов. Занятия онлайн или очно. Почасовая оплата. Нужны: терпение, грамотная речь, умение объяснять материал. Справка об успеваемости приветствуется.',
      category: VacancyCategory.TUTORING,
      ageRequirement: AgeRequirement.AGE_16_17,
      salaryFixed: 400,
      salaryType: 'fixed',
      schedule: WorkSchedule.EVENING,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Аниматор на детские праздники',
      slug: 'animator-na-detskie-prazdniki',
      description: 'Ищем энергичных и артистичных подростков для работы аниматорами на детских праздниках. Проведение игр, конкурсов, шоу-программ. Опыт работы с детьми приветствуется, но не обязателен. Костюмы и реквизит предоставляются. Работа по выходным и праздникам.',
      category: VacancyCategory.ANIMATION,
      ageRequirement: AgeRequirement.AGE_16_17,
      salaryFixed: 2000,
      salaryType: 'fixed',
      schedule: WorkSchedule.WEEKENDS,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Помощник в кафе',
      slug: 'pomoshchnik-v-kafe',
      description: 'Требуется помощник в уютное кафе. Обязанности: уборка столов, помощь на кухне, работа с кассой (обучаем). График гибкий, можно работать после школы или в выходные. Бесплатное питание во время смены. Дружный коллектив!',
      category: VacancyCategory.SERVICE,
      ageRequirement: AgeRequirement.AGE_16_17,
      salaryFixed: 18000,
      salaryType: 'fixed',
      schedule: WorkSchedule.PART_TIME,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Тестировщик мобильных приложений',
      slug: 'testirovshchik-mobilnyh-prilozheniy',
      description: 'Ищем подростков для тестирования мобильных приложений. Нужно пробовать новые приложения, находить ошибки, писать отчёты. Требуется внимательность, смартфон на Android или iOS, базовое понимание работы приложений. Работа удалённая.',
      category: VacancyCategory.IT,
      ageRequirement: AgeRequirement.AGE_14_17,
      salaryFixed: 300,
      salaryType: 'fixed',
      schedule: WorkSchedule.FLEXIBLE,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
    {
      title: 'Уборщик помещений',
      slug: 'uborshchik-pomeshcheniy',
      description: 'Требуется помощник по уборке офисных помещений. Работа лёгкая, не требует специальной подготовки. График: после 16:00 в будни или в выходные. Инвентарь и моющие средства предоставляются. Подходит для совмещения с учёбой.',
      category: VacancyCategory.CLEANING,
      ageRequirement: AgeRequirement.AGE_14_17,
      salaryFixed: 500,
      salaryType: 'fixed',
      schedule: WorkSchedule.EVENING,
      city: 'Москва',
      status: VacancyStatus.ACTIVE,
      publishedAt: new Date(),
    },
  ];

  for (const vacancy of vacancies) {
    try {
      const created = await prisma.vacancy.create({
        data: {
          ...vacancy,
          employerId,
        },
      });
      console.log(`✅ Создана вакансия: ${created.title}`);
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`⚠️ Вакансия уже существует: ${vacancy.title}`);
      } else {
        console.error(`❌ Ошибка создания ${vacancy.title}:`, error.message);
      }
    }
  }

  // Обновить счётчик вакансий у работодателя
  const count = await prisma.vacancy.count({
    where: { employerId, status: VacancyStatus.ACTIVE },
  });

  await prisma.employerProfile.update({
    where: { id: employerId },
    data: { activeVacanciesCount: count },
  });

  console.log(`\n🎉 Готово! Активных вакансий у работодателя: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
