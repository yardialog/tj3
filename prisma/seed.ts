import { db } from '../src/lib/db';
import { UserRole, UserStatus, VerificationStatus, VacancyStatus, VacancyCategory, AgeRequirement, WorkSchedule } from '@prisma/client';
import { hash } from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPasswordHash = await hash('Admin123', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@teenjob.ru' },
    update: {},
    create: {
      email: 'admin@teenjob.ru',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log('Created admin:', admin.email);

  // Create teenager users
  const teenPasswordHash = await hash('Teen1234', 12);
  
  const teen1 = await db.user.upsert({
    where: { email: 'ivan@example.com' },
    update: {},
    create: {
      email: 'ivan@example.com',
      passwordHash: teenPasswordHash,
      role: UserRole.TEENAGER,
      status: UserStatus.ACTIVE,
      teenager: {
        create: {
          firstName: 'Иван',
          lastName: 'Иванов',
          birthDate: new Date('2008-05-15'),
          city: 'Уфа',
          district: 'Центр',
          skills: JSON.stringify(['Активный', 'Общение', 'ПК / IT']),
          hasParentConsent: true,
          consentStatus: VerificationStatus.VERIFIED,
        },
      },
    },
    include: { teenager: true },
  });
  console.log('Created teenager:', teen1.email);

  const teen2 = await db.user.upsert({
    where: { email: 'maria@example.com' },
    update: {},
    create: {
      email: 'maria@example.com',
      passwordHash: teenPasswordHash,
      role: UserRole.TEENAGER,
      status: UserStatus.ACTIVE,
      teenager: {
        create: {
          firstName: 'Мария',
          lastName: 'Петрова',
          birthDate: new Date('2007-08-22'),
          city: 'Уфа',
          district: 'Сипайлово',
          skills: JSON.stringify(['Творчество', 'Ответственность', 'Английский язык']),
          hasParentConsent: true,
          consentStatus: VerificationStatus.VERIFIED,
        },
      },
    },
    include: { teenager: true },
  });
  console.log('Created teenager:', teen2.email);

  // Create employer users
  const employerPasswordHash = await hash('Employer123', 12);

  const employer1 = await db.user.upsert({
    where: { email: 'hr@techstart.ru' },
    update: {},
    create: {
      email: 'hr@techstart.ru',
      passwordHash: employerPasswordHash,
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
      employer: {
        create: {
          companyName: 'TechStart',
          inn: '7736257845',
          city: 'Уфа',
          description: 'IT-компания, разрабатывающая мобильные приложения. Приглашаем молодых специалистов на стажировку.',
          website: 'https://techstart.ru',
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    },
    include: { employer: true },
  });
  console.log('Created employer:', employer1.email);

  const employer2 = await db.user.upsert({
    where: { email: 'info@coffeehouse.ru' },
    update: {},
    create: {
      email: 'info@coffeehouse.ru',
      passwordHash: employerPasswordHash,
      role: UserRole.EMPLOYER,
      status: UserStatus.ACTIVE,
      employer: {
        create: {
          companyName: 'Coffee House',
          inn: '7838275916',
          city: 'Уфа',
          description: 'Сеть кофеен. Ищем бариста и помощников на лето.',
          verificationStatus: VerificationStatus.VERIFIED,
        },
      },
    },
    include: { employer: true },
  });
  console.log('Created employer:', employer2.email);

  // Create vacancies for TechStart
  if (employer1.employer) {
    const techstartVacancies = [
      {
        title: 'Помощник разработчика на лето',
        slug: 'pomoshchnik-razrabotchika-na-leto',
        description: `Ищем активного подростка 16-17 лет на летнюю стажировку.

Что предстоит делать:
- Помогать разработчикам с тестированием приложений
- Участвовать в создании документации
- Изучать основы программирования

Требования:
- Базовые знания программирования (любой язык)
- Желание учиться новому
- Ответственность

Предоставляем:
- Официальное оформление
- Обучение от опытных разработчиков
- Гибкий график`,
        category: VacancyCategory.IT,
        ageRequirement: AgeRequirement.AGE_16_17,
        salaryFixed: 20000,
        salaryType: 'fixed',
        schedule: WorkSchedule.SUMMER,
        city: 'Уфа',
      },
      {
        title: 'Тестировщик мобильных приложений',
        slug: 'testirovshchik-mobilnykh-prilozheniy',
        description: `Приглашаем подростков 14-15 лет на позицию тестировщика.

Обязанности:
- Тестирование мобильных приложений
- Поиск и описание багов
- Обратная связь по интерфейсу

Требования:
- Владение смартфоном на Android или iOS
- Внимательность к деталям
- Умение чётко формулировать мысли

График: 2-3 часа в день после школы`,
        category: VacancyCategory.IT,
        ageRequirement: AgeRequirement.AGE_14_15,
        salaryMin: 8000,
        salaryMax: 12000,
        salaryType: 'range',
        schedule: WorkSchedule.EVENING,
        city: 'Уфа',
      },
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
      },
      {
        title: 'Промоутер на выходные',
        slug: 'promouter-na-vyhodnye-techstart',
        description: 'Требуются промоутеры для раздачи листовок и привлечения клиентов. Работа на свежем воздухе в торговых центрах. Общительность и активность приветствуются. Униформа предоставляется. Возможность совмещать с учёбой.',
        category: VacancyCategory.PROMOTER,
        ageRequirement: AgeRequirement.AGE_14_17,
        salaryFixed: 1200,
        salaryType: 'fixed',
        schedule: WorkSchedule.WEEKENDS,
        city: 'Москва',
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
      },
      {
        title: 'Тестировщик мобильных приложений (удалённо)',
        slug: 'testirovshchik-mobilnyh-prilozheniy-remote',
        description: 'Ищем подростков для тестирования мобильных приложений. Нужно пробовать новые приложения, находить ошибки, писать отчёты. Требуется внимательность, смартфон на Android или iOS, базовое понимание работы приложений. Работа удалённая.',
        category: VacancyCategory.IT,
        ageRequirement: AgeRequirement.AGE_14_17,
        salaryFixed: 300,
        salaryType: 'fixed',
        schedule: WorkSchedule.FLEXIBLE,
        city: 'Москва',
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
      },
    ];

    for (const vacancyData of techstartVacancies) {
      try {
        const vacancy = await db.vacancy.create({
          data: {
            employerId: employer1.employer!.id,
            ...vacancyData,
            status: VacancyStatus.ACTIVE,
            publishedAt: new Date(),
          },
        });
        console.log('Created vacancy:', vacancy.title);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log('Vacancy already exists:', vacancyData.title);
        } else {
          console.error('Error creating vacancy:', vacancyData.title, error.message);
        }
      }
    }
  }

  // Create vacancies for Coffee House
  if (employer2.employer) {
    const coffeeVacancies = [
      {
        title: 'Помощник бариста',
        slug: 'pomoshchnik-barista',
        description: `Ищем подростка на лето в кофейню.

Обязанности:
- Помощь в приготовлении напитков
- Обслуживание клиентов
- Поддержание чистоты

Требования:
- Возраст 16-17 лет
- Коммуникабельность
- Желание работать с людьми

Обучение предоставляется!`,
        category: VacancyCategory.SERVICE,
        ageRequirement: AgeRequirement.AGE_16_17,
        salaryFixed: 25000,
        salaryType: 'fixed',
        schedule: WorkSchedule.SUMMER,
        city: 'Уфа',
      },
      {
        title: 'Промоутер на выходные',
        slug: 'promouter-na-vykhodnye',
        description: `Требуется промоутер для раздачи флаеров у входа в кофейню.

Обязанности:
- Раздача рекламных материалов
- Привлечение клиентов

Требования:
- Возраст 14-17 лет
- Активность
- Приятная внешность

Оплата почасовая. Можно работать только по выходным.`,
        category: VacancyCategory.PROMOTER,
        ageRequirement: AgeRequirement.AGE_14_17,
        salaryMin: 300,
        salaryMax: 500,
        salaryType: 'range',
        schedule: WorkSchedule.WEEKENDS,
        city: 'Уфа',
      },
    ];

    for (const vacancyData of coffeeVacancies) {
      try {
        const vacancy = await db.vacancy.create({
          data: {
            employerId: employer2.employer!.id,
            ...vacancyData,
            status: VacancyStatus.ACTIVE,
            publishedAt: new Date(),
          },
        });
        console.log('Created vacancy:', vacancy.title);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log('Vacancy already exists:', vacancyData.title);
        } else {
          console.error('Error creating vacancy:', vacancyData.title, error.message);
        }
      }
    }
  }

  // Update vacancy counts for employers
  if (employer1.employer) {
    const count1 = await db.vacancy.count({
      where: { employerId: employer1.employer.id, status: VacancyStatus.ACTIVE },
    });
    await db.employerProfile.update({
      where: { id: employer1.employer.id },
      data: { activeVacanciesCount: count1 },
    });
  }

  if (employer2.employer) {
    const count2 = await db.vacancy.count({
      where: { employerId: employer2.employer.id, status: VacancyStatus.ACTIVE },
    });
    await db.employerProfile.update({
      where: { id: employer2.employer.id },
      data: { activeVacanciesCount: count2 },
    });
  }

  // Create some banned words
  const bannedWords = ['спам', 'мошенничество', 'казино', 'ставки'];
  for (const word of bannedWords) {
    await db.bannedWord.upsert({
      where: { word },
      update: {},
      create: { word },
    });
  }
  console.log('Created banned words');

  console.log('Seed completed!');
  console.log('\n=== Test Accounts ===');
  console.log('Admin: admin@teenjob.ru / Admin123');
  console.log('Teenager: ivan@example.com / Teen1234');
  console.log('Teenager: maria@example.com / Teen1234');
  console.log('Employer: hr@techstart.ru / Employer123');
  console.log('Employer: info@coffeehouse.ru / Employer123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
