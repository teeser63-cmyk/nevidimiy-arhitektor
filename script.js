// ===== ИСПРАВЛЕННЫЙ script.js =====
// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let gameState = {
    currentScene: 'prolog_1',
    currentCity: 'prolog',
    year: 1848,
    stats: {
        influence: 0,
        trust: 0,
        science: 0,
        resources: 0,
        insight: 0,
        health: 100
    },
    inventory: [],
    diary: [],
    flags: {}, // для отслеживания важных решений
    history: [],
    choices: {}, // запись сделанных выборов
    londonPath: null, // 'a', 'b', 'c' - для кросс-влияния
    parisPath: null, // 'osman', 'poor', 'engineer' и т.д.
    minskPath: null
};

// ========== БАЗА ДАННЫХ СЦЕН ==========
// (Добавлено поле defaultNextScene для сцен без выборов)
const scenes = {
    // ===== ПРОЛОГ: САРАТОВ =====
    prolog_1: {
        id: 'prolog_1',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_street.jpg',
        characters: [],
        speaker: null,
        text: 'Саратов, лето 1848 года. Первая волна холеры добралась до России. Алексей Воронцов, 22 года, только что окончил медицинский факультет Казанского университета и вернулся в родной город. На вокзале его встречает запах страха — город в панике. Слухи об "отравленных колодцах" разносятся быстрее болезни.',
        choices: [
            {
                text: 'Сразу пойти домой, к сестре Анне',
                effects: { trust: 1 },
                nextScene: 'prolog_2',
                tooltip: '+1 к Народной поддержке'
            },
            {
                text: 'Направиться в земскую больницу к доктору Трофимову',
                effects: { science: 1 },
                nextScene: 'prolog_3',
                tooltip: '+1 к Науке'
            },
            {
                text: 'Пойти к губернатору, предложить помощь',
                effects: { influence: 1, resources: -1 },
                nextScene: 'prolog_4',
                tooltip: '+1 Влияние, -1 Ресурсы'
            }
        ],
        researchNote: 'Холерные бунты 1848 года — реальное историческое событие. В Саратове, как и во многих городах России, народ отказывался верить в болезнь и подозревал чиновников в отравлении колодцев. Власти вводили войска, происходили кровавые столкновения.'
    },
    
    prolog_2: {
        id: 'prolog_2',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_house.jpg',
        characters: ['anna', 'father'],
        speaker: 'Алексей',
        text: 'Дома я застаю сестру Анну. Она помогает соседям, ухаживает за больными, хотя я запретил ей приближаться к холерным баракам. "Я не могу сидеть сложа руки, Алёша! Люди умирают!" — говорит она. Отец, отставной военный, сидит в углу и молчит. После смерти матери он словно потерял себя.',
        choices: [
            {
                text: 'Обнять сестру и помочь ей',
                effects: { trust: 1 },
                nextScene: 'prolog_5',
                tooltip: 'Укрепить связь с сестрой'
            },
            {
                text: 'Строго отчитать её за безрассудство',
                effects: { science: 1, trust: -1 },
                nextScene: 'prolog_5',
                tooltip: '+1 Наука, -1 Народ'
            }
        ]
    },
    
    prolog_3: {
        id: 'prolog_3',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_hospital.jpg',
        characters: ['trofimov'],
        speaker: 'Доктор Трофимов',
        text: '"А, молодой человек! — встречает меня доктор Трофимов, старый земский врач. — Хотите посмотреть на настоящую медицину? Миазмы, батенька, миазмы! Воздух испорчен. Вот что убивает людей. Мы ставим пиявки, пускаем кровь — но тщетно. Всё из-за болот и гниющих отбросов". Он показывает мне карту города, где отмечены очаги "дурного воздуха".',
        choices: [
            {
                text: 'Согласиться с теорией миазмов',
                effects: { science: 1 },
                nextScene: 'prolog_5',
                tooltip: '+1 Наука (традиционный подход)'
            },
            {
                text: 'Усомниться: почему болеют только те, кто пьёт из определённых колодцев?',
                effects: { insight: 2 },
                nextScene: 'prolog_5',
                tooltip: '+2 Прозрение (зачатки будущего понимания)'
            }
        ],
        researchNote: 'В XIX веке господствовала миазматическая теория — считалось, что болезни передаются через "дурной воздух". Джон Сноу первым усомнился в этом, предположив водный путь передачи холеры.'
    },
    
    prolog_4: {
        id: 'prolog_4',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_governor.jpg',
        characters: ['bibikov'],
        speaker: 'Губернатор Бибиков',
        text: '"Вы врач? Прекрасно. — Губернатор устало потирает виски. — Из Петербурга предписания: карантины, кордоны, не пускать чужаков. Но народ бунтует. Кричат, что мы отравляем колодцы. Вчера убили квартального надзирателя. Мне нужен человек, который объяснит этим... этим людям, что мы не враги". Он протягивает мне папку с отчетами.',
        choices: [
            {
                text: 'Согласиться стать связным между властью и народом',
                effects: { influence: 2, trust: 1 },
                nextScene: 'prolog_5',
                tooltip: '+2 Влияние, +1 Народ'
            },
            {
                text: 'Отказаться: я врач, а не полицейский',
                effects: { science: 1, influence: -1 },
                nextScene: 'prolog_5',
                tooltip: '+1 Наука, -1 Влияние'
            }
        ]
    },
    
    prolog_5: {
        id: 'prolog_5',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_night.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Анна заболела. Я использовал всё, чему учили: кровопускание, каломель, опий. Ничего не помогает. Она горит в жару, кожа синеет — "синий страх", так называют холеру. Я бессилен. Впервые в жизни я понимаю, что медицина не всесильна.',
        choices: [
            {
                text: 'Не отходить от сестры ни на шаг',
                effects: { trust: 2 },
                nextScene: 'prolog_6',
                tooltip: '+2 Народ'
            },
            {
                text: 'Пытаться найти новые способы, рыться в книгах',
                effects: { science: 2 },
                nextScene: 'prolog_6',
                tooltip: '+2 Наука'
            }
        ]
    },
    
    prolog_6: {
        id: 'prolog_6',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_graveyard.jpg',
        characters: ['father'],
        speaker: 'Алексей',
        text: 'Анна умерла. Я стою на могиле, и земля под ногами кажется зыбкой. Рядом отец, сломленный, постаревший на десять лет за эти дни. В городе гремят выстрелы — подавляют холерный бунт. Я смотрю на крест и принимаю решение: я должен уехать. В Европу. Понять, как строить города, где такое невозможно.',
        choices: [
            {
                text: 'Похоронить сестру по-христиански, с отпеванием',
                effects: { trust: 1 },
                nextScene: 'interlude_1',
                special: 'christian_burial',
                tooltip: '+1 Народ'
            },
            {
                text: 'Похоронить скромно, без обрядов — это всё суеверия',
                effects: { science: 1 },
                nextScene: 'interlude_1',
                special: 'secular_burial',
                tooltip: '+1 Наука'
            },
            {
                text: 'Остаться с отцом на месяц, помочь ему',
                effects: { resources: -1 },
                nextScene: 'interlude_1_special',
                special: 'stay_with_father',
                tooltip: '-1 Ресурсы, но особый предмет'
            }
        ]
    },
    
    interlude_1_special: {
        id: 'interlude_1_special',
        city: 'Саратов',
        year: 1848,
        background: 'saratov_father.jpg',
        characters: ['father'],
        speaker: 'Отец',
        text: 'Месяц я провожу с отцом. Мы почти не говорим — просто сидим рядом, пьём чай, смотрим на Волгу. В последний день он достаёт фамильный перстень. "Это твоего деда. Возьми. Он поможет в трудную минуту. И помни, Алексей: где бы ты ни был, земля ждёт тебя обратно".',
        choices: [
            {
                text: 'Взять перстень (особый предмет)',
                effects: {},
                nextScene: 'interlude_1',
                special: 'got_ring',
                tooltip: 'Получен фамильный перстень'
            }
        ],
        onEnter: function() {
            addInventoryItem('ring', 'Фамильный перстень', 'Старинная вещь, которая может выручить в трудную минуту');
        }
    },
    
    interlude_1: {
        id: 'interlude_1',
        city: 'Путь в Европу',
        year: 1853,
        background: 'ship.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Пять лет я учился в Дерпте, стажировался в Берлине. Теперь, в 1853 году, я плыву в Лондон — самый большой город мира. На пароме через Ла-Манш я знакомлюсь с попутчиками. Впереди — новая жизнь.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'london_1'
            }
        ]
    },
    
    // ===== ЛОНДОН =====
    london_1: {
        id: 'london_1',
        city: 'Лондон',
        year: 1853,
        background: 'london_street.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Лондон встречает меня туманом и запахом. Это не просто запах — это смрад, смесь угольного дыма, конского навоза и... чего-то ещё, чего я не могу определить. Я селюсь в дешёвом пансионе в районе Сохо. Здесь живут бедняки, эмигранты, рабочие. В кармане — рекомендательное письмо к доктору Джону Сноу.',
        choices: [
            {
                text: 'Немедленно отправиться к Джону Сноу',
                effects: {},
                nextScene: 'london_2',
                tooltip: 'Встретиться с учёным'
            },
            {
                text: 'Осмотреться в городе, изучить трущобы',
                effects: { insight: 1 },
                nextScene: 'london_1_explore',
                tooltip: '+1 Прозрение'
            }
        ],
        researchNote: 'Лондон 1850-х годов — самый большой город мира с населением 2.5 миллиона человек. Централизованной канализации не было, Темза была открытой клоакой. Холера уносила тысячи жизней.'
    },
    
    london_1_explore: {
        id: 'london_1_explore',
        city: 'Лондон',
        year: 1853,
        background: 'london_slums.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я брожу по узким улочкам Сохо, захожу во дворы-колодцы, где на нескольких этажах ютится по 20-30 человек. Вонь невыносимая. Выгребные ямы переполнены, содержимое выливается прямо на мостовую. Дети играют в лужах, рядом с которыми лежат дохлые крысы. Как здесь можно выжить?',
        choices: [
            {
                text: 'Вернуться и пойти к Сноу',
                effects: { insight: 1, trust: 1 },
                nextScene: 'london_2',
                tooltip: '+1 Прозрение, +1 Народ'
            }
        ],
        onEnter: function() {
            addDiaryNote('24 сентября 1853', 'Сегодня я видел настоящий Лондон. Не тот, о котором пишут в книгах. Если холера придёт сюда, она убьёт всех. Я должен понять, почему город устроен так, что люди умирают.');
        }
    },
    
    london_2: {
        id: 'london_2',
        city: 'Лондон',
        year: 1853,
        background: 'london_hospital.jpg',
        characters: ['snow'],
        speaker: 'Джон Сноу',
        text: '"Джон Сноу, — представляется врач. Ему около 40, усталые глаза, но живой, цепкий взгляд. — Вы из России? Читал ваши статьи о холере в немецких журналах. Интересно. Вы не верите в миазмы?" Он показывает мне карту Лондона, испещрённую точками. "Я собираю данные. Каждая смерть — здесь. И я вижу закономерность. Но научное сообщество смеётся надо мной. Для них болезнь — это запах. А запах — это грязь. А грязь — это бедняки. Им удобно так думать".',
        choices: [
            {
                text: 'Стать ассистентом Сноу (научный путь)',
                effects: { science: 2, resources: 0 },
                nextScene: 'london_3_snow',
                tooltip: '+2 Наука, работа за идею',
                setFlag: 'snow_path'
            },
            {
                text: 'Пойти к Чадуику в санитарную комиссию (путь власти)',
                effects: { influence: 2, resources: 2 },
                nextScene: 'london_3_chadwick',
                tooltip: '+2 Влияние, +2 Ресурсы',
                setFlag: 'chadwick_path'
            },
            {
                text: 'Попытаться совмещать (сложный путь)',
                effects: { health: -20, insight: 1 },
                nextScene: 'london_3_both',
                tooltip: 'Требует здоровья, +1 Прозрение',
                setFlag: 'both_path'
            }
        ],
        researchNote: 'Джон Сноу (1813-1858) — английский врач, один из основоположников эпидемиологии. Был личным анестезиологом королевы Виктории. Его исследование холеры в Сохо стало поворотным моментом в истории медицины.'
    },
    
    london_3_snow: {
        id: 'london_3_snow',
        city: 'Лондон',
        year: 1854,
        background: 'london_snow_map.jpg',
        characters: ['snow'],
        speaker: 'Джон Сноу',
        text: 'Месяцы работы со Сноу. Мы собираем данные о смертности за прошлые годы. Он учит меня картографированию — наносить каждый случай на карту. И я начинаю видеть то, что раньше было скрыто: в районах, которые снабжает компания "Саутварк и Воксхолл", смертность в 8 раз выше, чем в районах компании "Ламбет".',
        choices: [
            {
                text: 'Изучить данные компании "Саутварк и Воксхолл"',
                effects: { insight: 2 },
                nextScene: 'london_4',
                tooltip: '+2 Прозрение'
            }
        ],
        onEnter: function() {
            addDiaryNote('Весна 1854', 'Сноу прав. Это не миазмы. Это вода. Компания Грейвса берёт воду из Темзы ниже по течению, куда стекают все нечистоты. Люди пьют свои же отходы и умирают.');
        }
    },
    
    london_3_chadwick: {
        id: 'london_3_chadwick',
        city: 'Лондон',
        year: 1854,
        background: 'london_commission.jpg',
        characters: ['chadwick'],
        speaker: 'Эдвин Чадуик',
        text: '"Добро пожаловать в комиссию, доктор Воронцов. — Чадуик, сухой, педантичный человек, протягивает мне стопку бумаг. — Вот отчёты. Изучите. Напишите заключение. Грязь — вот наш враг. Миазмы убивают Лондон. Мы должны очистить улицы, вывезти отбросы, осушить болота". Он не слушает моих возражений о воде. Для него ответ очевиден: запах = болезнь.',
        choices: [
            {
                text: 'Писать отчёты по методике Чадуика',
                effects: { influence: 1, science: -1 },
                nextScene: 'london_3_chadwick_work',
                tooltip: '+1 Влияние, -1 Наука'
            },
            {
                text: 'Попытаться вставить в отчёт свои наблюдения о воде',
                effects: { science: 1, influence: -1 },
                nextScene: 'london_3_chadwick_work',
                tooltip: '+1 Наука, -1 Влияние'
            }
        ],
        researchNote: 'Эдвин Чадуик (1800-1890) — английский социальный реформатор, автор "Отчёта о санитарном состоянии трудящегося населения" (1842). Его работа заложила основы общественного здравоохранения, хотя он до конца жизни верил в миазматическую теорию.'
    },
    
    london_3_chadwick_work: {
        id: 'london_3_chadwick_work',
        city: 'Лондон',
        year: 1854,
        background: 'london_commission.jpg',
        characters: ['chadwick'],
        speaker: 'Алексей',
        text: 'Я пишу отчёты. Чадуик доволен моей работой. Но внутри меня гложет червь сомнения: мы боремся с грязью на улицах, а люди продолжают пить воду из отравленных колодцев. Я чувствую, что мы лечим симптомы, а не болезнь.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'london_4'
            }
        ]
    },
    
london_3_both: {
    id: 'london_3_both',
    city: 'Лондон',
    year: 1854,
    background: 'london_night.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Я разрываюсь. Днём я работаю на Чадуика, пишу отчёты о "миазмах". Ночами я встречаюсь со Сноу, мы анализируем данные, строим карты. Я сплю по 3-4 часа. Организм на пределе. Но я вижу то, что не видят другие: как официальная наука ошибается, и как политика мешает истине.',
    choices: [
        {
            text: 'Продолжить',
            effects: { health: -10 },
            nextScene: 'london_4',
            tooltip: '-10 здоровья'
        }
    ],
    onEnter: function() {
        addDiaryNote('Июнь 1854', 'Я живу две жизни. Днём — чиновник, ночью — учёный. Чадуик подгоняет факты под свою теорию. Сноу ищет истину. Но кто услышит истину, если она неудобна власти?');
    }
},
    
london_4: {
    id: 'london_4',
    city: 'Лондон',
    year: 1854,
    background: 'london_cholera.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Август 1854 года. В Сохо началась эпидемия. Люди умирают десятками в день. На моих глазах семья ирландских рабочих — муж, жена, трое детей — умирает за двое суток. Я пытаюсь помочь, но бессилен. Сноу находит меня: "Алексей, время пришло. Мы должны опросить всех выживших. Где они брали воду?"',
    choices: [
        {
            text: 'Начать расследование',
            effects: { health: -10 },
            nextScene: 'london_5',
            tooltip: 'Начать расследование (-10 здоровья)'
        }
    ],
    onEnter: function() {
        addDiaryNote('Август 1854', 'Я никогда не забуду их лица. Синяя кожа, судороги, мольба в глазах. Я врач, но ничем не могу помочь. Только найти причину. Только чтобы больше так не было.');
    }
},
london_5: {
    id: 'london_5',
    city: 'Лондон',
    year: 1854,
    background: 'london_map_soho.jpg',
    characters: ['snow'],
    speaker: 'Алексей',
    text: 'Мы обходим дома. Спрашиваем: откуда брали воду? Карта Сохо покрывается точками. И вырисовывается чудовищная закономерность: все дороги ведут к колонке на Брод-стрит.',
    choices: [], // Оставляем пустым, добавим через onEnter
    onEnter: function() {
        console.log('onEnter london_5');
        
        // Получаем контейнер
        const container = document.getElementById('choices-container');
        if (!container) return;
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Массив для хранения выборов
        const choices = [];
        
        // Проверяем условия и добавляем соответствующие выборы
        if (gameState.stats.science >= 5) {
            choices.push({
                text: 'Высокий научный авторитет: рабочие на пивоварне не пьют воду — только пиво. И они не болеют! Вода — источник!',
                nextScene: 'london_6'
            });
        }
        
        if (gameState.stats.trust >= 5) {
            choices.push({
                text: 'Высокая народная поддержка: местная женщина рассказывает, что её дочь выжила, потому что носила воду из другого насоса',
                nextScene: 'london_6'
            });
        }
        
        if (gameState.stats.influence >= 5) {
            choices.push({
                text: 'Высокое влияние: полицейский отчёт показывает, что первый заболевший жил рядом с колонкой на Брод-стрит',
                nextScene: 'london_6'
            });
        }
        
        // Базовый выбор
        choices.push({
            text: 'Продолжить сбор данных',
            nextScene: 'london_6'
        });
        
        // Создаем кнопки вручную
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            
            btn.onclick = function() {
                console.log('Выбор сделан, переход к:', choice.nextScene);
                if (choice.nextScene) {
                    loadScene(choice.nextScene);
                }
            };
            
            container.appendChild(btn);
        });
        
        console.log('Создано кнопок:', choices.length);
    }
},
    
    london_6: {
        id: 'london_6',
        city: 'Лондон',
        year: 1854,
        background: 'london_broadstreet.jpg',
        characters: ['snow'],
        speaker: 'Джон Сноу',
        text: 'Мы знаем: источник заразы — колонка на Брод-стрит. Но как заставить власти действовать? Сноу идёт в приходской совет. Я жду. День. Два. Три. За это время умирает ещё 200 человек.',
        choices: [
            {
                text: 'Ждать решения совета (честный путь)',
                effects: { influence: 2, science: 1 },
                nextScene: 'london_7a',
                tooltip: 'Медленно, но верно',
                setFlag: 'london_path_a'
            },
            {
                text: 'Ночью снять рукоятку самому (прямое действие)',
                effects: { trust: 3, influence: -2 },
                nextScene: 'london_7b',
                tooltip: '+3 Народ, -2 Влияние, риск ареста',
                setFlag: 'london_path_b'
            },
            {
                text: 'Встретиться с сэром Грейвсом (компромисс)',
                effects: { resources: 3, influence: 1, science: -2, trust: -2 },
                nextScene: 'london_7c',
                tooltip: 'Деньги и власть ценой истины',
                setFlag: 'london_path_c',
                condition: function() { return gameState.flags.chadwick_path; }
            }
        ],
        researchNote: '8 сентября 1854 года власти Лондона сняли рукоятку с насоса на Брод-стрит. Эпидемия пошла на спад. Это был триумф эпидемиологии, хотя теория Сноу получила признание только спустя десятилетия.'
    },
    
    london_7a: {
        id: 'london_7a',
        city: 'Лондон',
        year: 1854,
        background: 'london_council.jpg',
        characters: ['snow'],
        speaker: 'Алексей',
        text: '8 сентября приходской совет снимает рукоятку. Эпидемия идёт на спад. Сноу публикует второе издание своей работы, где благодарит меня. Чадуик приглашает работать над санитарной реформой. Я знакомлюсь с молодым инженером Джозефом Базалджетом, который уже проектирует новую канализацию.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'london_end'
            }
        ],
        onEnter: function() {
            gameState.londonPath = 'a';
            addDiaryNote('Сентябрь 1854', 'Мы сделали это. Истина победила. Но сколько ещё умрёт, прежде чем её признают?');
        }
    },
    
    london_7b: {
        id: 'london_7b',
        city: 'Лондон',
        year: 1854,
        background: 'london_night_action.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Ночью, подговорив сторожа за пару монет, я снимаю рукоятку. Наутро в городе переполох. Кто посмел? Полиция ищет "преступника". Мне приходится скрываться. Я живу в трущобах Уайтчепела под чужим именем, лечу бедных. Среди них я становлюсь легендой — "доктор-призрак", который спас Сохо. Но официальная наука для меня закрыта.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'london_end'
            }
        ],
        onEnter: function() {
            gameState.londonPath = 'b';
            addDiaryNote('Сентябрь 1854', 'Я преступник. Но я спас людей. И я сделал бы это снова.');
        }
    },
    
    london_7c: {
        id: 'london_7c',
        city: 'Лондон',
        year: 1854,
        background: 'london_graves.jpg',
        characters: ['graves'],
        speaker: 'Сэр Грейвс',
        text: '"Мистер Воронцов, — Грейвс, владелец водопроводной компании, смотрит на меня с притворным сочувствием. — Если правда выйдет наружу, моя компания разорится. Тысячи людей потеряют работу. Но я предлагаю сделку: вы молчите о колонке, а я строю новые фильтры и забираю воду выше по течению. Это спасёт больше жизней в будущем. Соглашайтесь".',
        choices: [
            {
                text: 'Согласиться на сделку',
                effects: { resources: 5, science: -3 },
                nextScene: 'london_7c_accept',
                tooltip: '+5 Ресурсов, -3 Науки'
            },
            {
                text: 'Отказаться и идти к совету',
                effects: { influence: 1, science: 1 },
                nextScene: 'london_7a',
                tooltip: 'Вернуться на честный путь'
            }
        ]
    },
    
    london_7c_accept: {
        id: 'london_7c_accept',
        city: 'Лондон',
        year: 1854,
        background: 'london_graves.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я соглашаюсь. Грейвс сдерживает слово: фильтры построены, водозабор перенесён. Многие жизни будут спасены. Но я встречаю Сноу на улице, и он отворачивается от меня, не сказав ни слова. Я продал истину. И эта цена тяжелее любых денег.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'london_end'
            }
        ],
        onEnter: function() {
            gameState.londonPath = 'c';
            addDiaryNote('1855', 'Я богат. Я преуспеваю. Но по ночам мне снятся синие лица умерших. И взгляд Сноу.');
        }
    },
    
    london_end: {
        id: 'london_end',
        city: 'Лондон',
        year: 1855,
        background: 'london_farewell.jpg',
        characters: [],
        speaker: 'Алексей',
        text: '1855 год. Я получаю письмо из Парижа. От друга, французского врача Клода Бернара. Он пишет, что император Наполеон III затеял грандиозную перестройку Парижа, и им нужны люди с опытом борьбы с холерой. Лондон остаётся позади. Впереди — новый город, новая битва.',
        choices: [
            {
                text: 'Отправиться в Париж',
                effects: {},
                nextScene: 'paris_1'
            }
        ],
        onEnter: function() {
            if (gameState.londonPath === 'a') {
                gameState.flags.paris_start = 'scientist';
            } else if (gameState.londonPath === 'b') {
                gameState.flags.paris_start = 'fugitive';
            } else if (gameState.londonPath === 'c') {
                gameState.flags.paris_start = 'rich_cynic';
            }
            
            if (gameState.flags.got_ring) {
                gameState.inventory.push('ring');
            }
        }
    },
    
    // ===== ПАРИЖ =====
    paris_1: {
        id: 'paris_1',
        city: 'Париж',
        year: 1856,
        background: 'paris_construction.jpg',
        characters: ['bernard'],
        speaker: 'Клод Бернар',
        text: '"Алексей! — Клод Бернар, знаменитый физиолог, обнимает меня на вокзале. — Ты вовремя. Париж перестраивают на глазах. Барон Осман сносит целые кварталы. Говорят, для санитарии. Но ты же знаешь Париж: здесь всё — политика". Мы едем через город. Везде стройки, руины, пыль. И широкие новые бульвары, прорезающие старые кварталы, как нож.',
        choices: [
            {
                text: 'Отправиться на приём к Осману',
                effects: {},
                nextScene: 'paris_2'
            }
        ]
    },
    
    paris_2: {
        id: 'paris_2',
        city: 'Париж',
        year: 1856,
        background: 'paris_haussman_office.jpg',
        characters: ['haussman'],
        speaker: 'Барон Осман',
        text: 'Осман производит пугающее впечатление. В нём чувствуется сила, граничащая с жестокостью. "Вы были в Лондоне, мсье Воронцов. Вы видели их канализацию. Это сарай, построенный для рабов. А мы строим дворец для цивилизации. Поможете?" Он смотрит на меня в упор. От его взгляда не по себе.',
        choices: [
            {
                text: 'Представиться как ученик Сноу (научный подход)',
                effects: { influence: 1, science: 1 },
                nextScene: 'paris_3',
                tooltip: 'Осман уважает науку, но будет проверять'
            },
            {
                text: 'Представиться как человек Чадуика (бюрократический подход)',
                effects: { influence: -1, resources: 1 },
                nextScene: 'paris_3',
                tooltip: 'Осман презирает бюрократов'
            },
            {
                text: 'Честно рассказать о своём пути в Лондоне',
                effects: { insight: 2 },
                nextScene: 'paris_3_special',
                tooltip: 'Особый путь',
                condition: function() { return gameState.londonPath === 'b' || gameState.londonPath === 'c'; }
            }
        ]
    },
    
    paris_3: {
        id: 'paris_3',
        city: 'Париж',
        year: 1856,
        background: 'paris_haussman_office.jpg',
        characters: ['haussman'],
        speaker: 'Барон Осман',
        text: '"Хорошо. Я дам вам работу. Будете курировать санитарную часть проекта. Следить, чтобы новые кварталы были здоровыми. Но запомните: в моём Париже нет места сантиментам. Мы режем город, как хирург режет тело. Без анестезии. Идёт?"',
        choices: [
            {
                text: 'Согласиться',
                effects: { influence: 2 },
                nextScene: 'paris_4',
                tooltip: '+2 Влияние'
            },
            {
                text: 'Попросить время подумать',
                effects: { influence: -1 },
                nextScene: 'paris_3_delay',
                tooltip: '-1 Влияние'
            }
        ]
    },
    
paris_3_special: {
    id: 'paris_3_special',
    city: 'Париж',
    year: 1856,
    background: 'paris_haussman_office.jpg',
    characters: ['haussman'],
    speaker: 'Барон Осман',
    text: 'Я рассказываю Осману всю правду. О Лондоне, о выборе, который мне пришлось сделать. Он слушает, и в его глазах загорается интерес. "Вы нарушили закон? Предали друга? Великолепно! У меня работают такие же. Париж строят не святые, мсье Воронцов. Париж строят грешники, которые хотят искупления. Идите и работайте".',
    choices: [
        {
            text: 'Принять предложение',
            effects: { influence: 3, insight: 2 },
            nextScene: 'paris_4',
            tooltip: '+3 Влияние, +2 Прозрение'
        }
    ],
    onEnter: function() {
        gameState.flags.haussman_trust = true;
        // Добавим проверку создания кнопок
        const container = document.getElementById('choices-container');
        if (container && container.children.length === 0) {
            // Если кнопки не создались, создаем вручную
            this.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice.text;
                btn.onclick = function() {
                    if (choice.effects) applyEffects(choice.effects);
                    if (choice.nextScene) loadScene(choice.nextScene);
                };
                container.appendChild(btn);
            });
        }
    }
},
    paris_3_delay: {
        id: 'paris_3_delay',
        city: 'Париж',
        year: 1856,
        background: 'paris_cafe.jpg',
        characters: ['bernard'],
        speaker: 'Клод Бернар',
        text: 'Я рассказываю Бернару о своих сомнениях. "Осман опасен, — говорит он. — Но он единственный, кто может реально изменить Париж. Император дал ему carte blanche. Если ты откажешься, твоё место займёт кто-то другой. Может быть, тот, кому плевать на людей. Подумай".',
        choices: [
            {
                text: 'Всё же согласиться',
                effects: { influence: 1 },
                nextScene: 'paris_4',
                tooltip: '+1 Влияние'
            },
            {
                text: 'Отказаться и искать другой путь',
                effects: { trust: 2, influence: -2 },
                nextScene: 'paris_alternative',
                tooltip: '+2 Народ, -2 Влияние'
            }
        ]
    },
    
    paris_alternative: {
        id: 'paris_alternative',
        city: 'Париж',
        year: 1856,
        background: 'paris_slums.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я отказываюсь работать на Османа. Вместо этого я открываю маленькую клинику для бедных на окраине, в районе, который скоро снесут. Сюда приходят те, кому некуда идти. Старики, больные, матери с детьми. Я лечу их, учу гигиене. И вижу, как к нам приближаются бульдозеры Османа.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'paris_4_poor'
            }
        ],
        onEnter: function() {
            gameState.parisPath = 'poor';
        }
    },
    
    paris_4: {
        id: 'paris_4',
        city: 'Париж',
        year: 1857,
        background: 'paris_construction_2.jpg',
        characters: ['belgrand'],
        speaker: 'Эжен Бельгран',
        text: 'Меня приставляют к Эжену Бельграну, главному инженеру водоснабжения и канализации. Он гениален, но полностью подчинён Осману. Мы проектируем сеть под новыми бульварами. Бельгран показывает чертежи: "Смотрите. Здесь будет коллектор. Здесь — водозабор. Париж станет самым чистым городом Европы. Если, конечно, император не передумает".',
        choices: [
            {
                text: 'Предложить лондонский опыт (гравитационный сброс)',
                effects: { science: 2, influence: 1 },
                nextScene: 'paris_5',
                tooltip: '+2 Наука'
            },
            {
                text: 'Изучать парижские особенности рельефа',
                effects: { insight: 2 },
                nextScene: 'paris_5',
                tooltip: '+2 Прозрение'
            }
        ],
        onEnter: function() {
            gameState.parisPath = 'engineer';
        }
    },
    
    paris_4_poor: {
        id: 'paris_4_poor',
        city: 'Париж',
        year: 1857,
        background: 'paris_slums_2.jpg',
        characters: ['marie'],
        speaker: 'Мари Дюбуа',
        text: 'В мою клинику приходит девушка. Мари Дюбуа, 20 лет, прачка. Она живёт в квартале, который обречён на снос. "Месье доктор, говорят, наш дом снесут. Куда нам идти? Там моя мама, больная, младшие братья..." В её глазах — отчаяние пополам с надеждой. Она смотрит на меня как на спасителя. А я ничем не могу помочь.',
        choices: [
            {
                text: 'Помочь деньгами (если есть ресурсы)',
                effects: { resources: -2, trust: 3 },
                nextScene: 'paris_5_poor',
                tooltip: '-2 Ресурса, +3 Народ',
                condition: function() { return gameState.stats.resources >= 5; }
            },
            {
                text: 'Попытаться использовать связи, чтобы оттянуть снос',
                effects: { influence: -2, trust: 2 },
                nextScene: 'paris_5_poor',
                tooltip: '-2 Влияние, +2 Народ',
                condition: function() { return gameState.stats.influence >= 5; }
            },
            {
                text: 'Честно сказать, что ничем не могу помочь',
                effects: { trust: -2 },
                nextScene: 'paris_5_poor',
                tooltip: '-2 Народ'
            }
        ]
    },
    
  paris_5: {
    id: 'paris_5',
    city: 'Париж',
    year: 1858,
    background: 'paris_exposition.jpg',
    characters: ['napoleon'],
    speaker: 'Алексей',
    text: '1858 год. Всемирная выставка в Париже. Город показывает миру своё новое лицо. Я встречаю старых знакомых из Лондона. И вдруг — аудиенция у самого императора Наполеона III. Он интересуется моим мнением о перестройке. Это момент истины.',
    choices: [
        {
            text: 'Сказать правду о социальных проблемах',
            effects: { insight: 2, influence: 1 },
            nextScene: 'paris_6',
            tooltip: '+2 Прозрение'
        },
        {
            text: 'Восхвалять Османа',
            effects: { influence: 3, trust: -1 },
            nextScene: 'paris_6',
            tooltip: '+3 Влияние'
        },
        {
            text: 'Уклониться, говорить только об инженерии',
            effects: { science: 2 },
            nextScene: 'paris_6',
            tooltip: '+2 Наука'
        }
    ],
    onEnter: function() {
        addDiaryNote('1858', 'Всемирная выставка. Император слушает меня. От моего ответа зависит многое.');
    }
},
    
paris_5_poor: {
    id: 'paris_5_poor',
    city: 'Париж',
    year: 1858,
    background: 'paris_demolition.jpg',
    characters: ['marie'],
    speaker: 'Мари',
    text: 'Дом Мари снесли. Я стою у груды обломков, где ещё вчера была её жизнь. Она сидит на камнях и плачет. "Мы теперь на окраине, месье. Там болото, крысы, вода грязная. Мама не выдержит зиму..." Я чувствую свою вину. Я часть этой машины, которая перемалывает человеческие судьбы.',
    choices: [
        {
            text: 'Предложить Мари работу в клинике',
            effects: { trust: 3 },
            nextScene: 'paris_6_poor',
            setFlag: 'marie_works',
            tooltip: '+3 Народ'
        },
        {
            text: 'Дать денег и уйти',
            effects: { resources: -2 },
            nextScene: 'paris_6_poor',
            tooltip: '-2 Ресурса'
        }
    ],
    onEnter: function() {
        // Пустой onEnter
    }
},
    
    paris_6: {
        id: 'paris_6',
        city: 'Париж',
        year: 1865,
        background: 'paris_cholera.jpg',
        characters: [],
        speaker: 'Алексей',
        text: '1865 год. В Марселе вспышка холеры. Болезнь снова в стране. А потом приходит письмо от Мари: "Месье, в нашем квартале началась холера. Помогите. Здесь нет воды, нет врачей. Мы умираем". Она жива — я не дал ей пропасть. Но теперь она в опасности.',
        choices: [
            {
                text: 'Немедленно ехать к Мари',
                effects: { health: -10, trust: 5 },
                nextScene: 'paris_7',
                tooltip: '+5 Народ, риск для здоровья',
                condition: function() { return gameState.flags.marie_works; }
            },
            {
                text: 'Послать деньги и лучшего врача',
                effects: { resources: -3 },
                nextScene: 'paris_7_money',
                tooltip: '-3 Ресурса',
                condition: function() { return gameState.stats.resources >= 5; }
            },
            {
                text: 'Не ехать — работа важнее',
                effects: { influence: 2, trust: -3 },
                nextScene: 'paris_7_work',
                tooltip: '+2 Влияние, -3 Народ'
            }
        ]
    },
    
   paris_6_poor: {
    id: 'paris_6_poor',
    city: 'Париж',
    year: 1865,
    background: 'paris_suburbs.jpg',
    characters: ['marie'],
    speaker: 'Мари',
    text: 'Прошло несколько лет. Я работаю в своей клинике на окраине, учу людей гигиене. Мари помогает мне, учится читать и писать. Мы стали близки. Но приходит страшная весть: в Париже снова холера. И болеют не в центре, где новая канализация, а здесь, на окраинах.',
    choices: [
        {
            text: 'Остаться и бороться с эпидемией',
            effects: { health: -20, trust: 5 },
            nextScene: 'paris_7_poor',
            tooltip: 'Борьба до конца'
        }
    ],
    onEnter: function() {
        // Ничего не делаем
    }
},
    
paris_7: {
    id: 'paris_7',
    city: 'Париж',
    year: 1865,
    background: 'paris_slums_cholera.jpg',
    characters: ['marie'],
    speaker: 'Алексей',
    text: 'Я приезжаю в её квартал. Кошмар, хуже лондонского Сохо. Грязь, вонь, умирающие дети. Мари встречает меня: "Я знала, что вы приедете". Вместе мы обходим дома. Я лечу, учу, раздаю хинин. Мы боремся.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'paris_8_save'
        }
    ],
    onEnter: function() {
        applyEffects({ health: -10 });
    }
},
    
paris_7_money: {
    id: 'paris_7_money',
    city: 'Париж',
    year: 1865,
    background: 'paris_letter.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Я посылаю деньги и лучшего врача, какого могу найти. Через неделю приходит письмо: "Мари выжила. Она просила передать, что помнит вас. И что вы спасли её". Я выдыхаю. Но в письме чувствуется холодок — она ждала меня, а получила только деньги.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'paris_8_cold'
        }
    ],
    onEnter: function() {
        // Ничего не делаем
    }
},

paris_7_work: {
    id: 'paris_7_work',
    city: 'Париж',
    year: 1865,
    background: 'paris_office.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Я не еду. Работа, встречи, доклады. Через две недели приходит известие: Мари умерла. Я сижу в своём кабинете, смотрю на чертежи парижской канализации. Я построил систему, которая спасёт тысячи. Но не смог спасти одну. И этот груз я буду нести всегда.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'paris_8_alone'
        }
    ],
    onEnter: function() {
        gameState.flags.marie_died = true;
        applyEffects({ health: -15 });
    }
},
    
    paris_7_poor: {
        id: 'paris_7_poor',
        city: 'Париж',
        year: 1865,
        background: 'paris_suburbs_cholera.jpg',
        characters: ['marie'],
        speaker: 'Алексей',
        text: 'Мы с Мари работаем сутками. Холера косит людей, но новая система в центре работает — там чистая вода, там смерти редки. А здесь... Я понимаю чудовищную вещь: Осман создал город-монстра, где здоровье стало привилегией богатых.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'paris_8_poor'
            }
        ]
    },
    
    paris_8_save: {
        id: 'paris_8_save',
        city: 'Париж',
        year: 1866,
        background: 'paris_spring.jpg',
        characters: ['marie'],
        speaker: 'Мари',
        text: 'Эпидемия пошла на спад. Мари выжила. Мы стоим на мосту через Сену, смотрим на новый Париж — широкие бульвары, красивые здания. "Он красивый, — говорит Мари. — Но какой ценой?" Я не знаю, что ответить.',
        choices: [
            {
                text: 'Остаться в Париже и продолжать работу с Османом',
                effects: { influence: 3 },
                nextScene: 'paris_end',
                setFlag: 'paris_stay_osman'
            },
            {
                text: 'Уйти от Османа и открыть клинику для бедных',
                effects: { trust: 3, influence: -2 },
                nextScene: 'paris_end',
                setFlag: 'paris_stay_poor'
            },
            {
                text: 'Уехать из Франции',
                effects: {},
                nextScene: 'paris_end',
                setFlag: 'paris_leave'
            },
            {
                text: 'Предложить Осману проект канализации для окраин',
                effects: { influence: 1, science: 2 },
                nextScene: 'paris_end',
                setFlag: 'paris_reform',
                condition: function() { return gameState.stats.science >= 8 && gameState.stats.influence >= 6; }
            }
        ]
    },
    
paris_8_cold: {
    id: 'paris_8_cold',
    city: 'Париж',
    year: 1866,
    background: 'paris_street.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Я встречаю Мари через месяц. Она здорова, но между нами стена. "Вы сделали всё, что могли, — говорит она. — Я благодарна". Но в глазах — пустота. Я понимаю, что потерял её не тогда, когда не поехал, а гораздо раньше — когда выбрал сторону Османа.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'paris_end'
        }
    ],
    onEnter: function() {
        gameState.flags.marie_alive_but_cold = true;
    }
},
    
   paris_8_alone: {
    id: 'paris_8_alone',
    city: 'Париж',
    year: 1866,
    background: 'paris_grave.jpg',
    characters: [],
    speaker: 'Алексей',
    text: 'Я стою на могиле Мари. Маленький холмик на окраинном кладбище. Рядом — её мать, постаревшая на двадцать лет. "Она всё ждала вас, — говорит она. — До последнего дня звала". Я молчу. Что я могу сказать? Что строил великий город? Что спасал тысячи? Она была одной. И я её не спас.',
    choices: [
        {
            text: 'Продолжить путь',
            effects: { health: -15 },
            nextScene: 'paris_end',
            tooltip: 'Горе уменьшает здоровье'
        }
    ],
    onEnter: function() {
        gameState.flags.marie_died = true;
    }
},
    
paris_8_poor: {
    id: 'paris_8_poor',
    city: 'Париж',
    year: 1866,
    background: 'paris_clinic.jpg',
    characters: ['marie'],
    speaker: 'Мари',
    text: 'Эпидемия закончилась. Наша маленькая клиника выстояла. Мари рядом. "Что дальше?" — спрашивает она. Я смотрю на Париж с холма. Красивый город, жестокий город.',
    choices: [
        {
            text: 'Остаться здесь, с Мари',
            effects: { trust: 5 },
            nextScene: 'paris_end',
            setFlag: 'paris_with_marie',
            tooltip: '+5 Народ'
        },
        {
            text: 'Вернуться к большой медицине',
            effects: { science: 2 },
            nextScene: 'paris_end',
            setFlag: 'paris_back_to_science',
            tooltip: '+2 Наука'
        }
    ],
    onEnter: function() {
        // Пустой onEnter, но он нужен чтобы не создавалась кнопка "Продолжить"
    }
},
    
    paris_end: {
        id: 'paris_end',
        city: 'Париж',
        year: 1867,
        background: 'paris_exposition_1867.jpg',
        characters: [],
        speaker: 'Алексей',
        text: '1867 год. Всемирная выставка в Париже подводит итоги. Новый Париж прекрасен. Но в моей душе — смятение. Я получил письмо из Минска. От Кароля Чапского, молодого аристократа, который путешествовал по Европе и, кажется, встречался со мной на выставке. Его избрали городским головой, и он хочет превратить Минск в современный город. Ему нужен я.',
        choices: [
            {
                text: 'Ехать в Минск',
                effects: {},
                nextScene: 'minsk_1'
            }
        ],
        onEnter: function() {
            if (gameState.flags.paris_with_marie) {
                gameState.flags.marie_goes_to_minsk = true;
            }
        }
    },
    
    // ===== МИНСК =====
    minsk_1: {
        id: 'minsk_1',
        city: 'Минск',
        year: 1871,
        background: 'minsk_station.jpg',
        characters: ['czapski'],
        speaker: 'Кароль Чапский',
        text: '"Доктор Воронцов! — Чапский, молодой, энергичный, встречает меня на вокзале. — Добро пожаловать в Минск! Не обессудьте, у нас не Париж. Но мы сделаем его европейским городом. Я читал ваши отчёты о Лондоне. Вы нам нужны". Я выхожу на перрон. Город встречает запахом — смесь болотной гнили, кожевенных отходов и... чего-то знакомого, что я помню ещё с Саратова.',
        choices: [
            {
                text: 'Осмотреться в городе',
                effects: { insight: 1 },
                nextScene: 'minsk_2'
            }
        ]
    },
    
    minsk_2: {
        id: 'minsk_2',
        city: 'Минск',
        year: 1871,
        background: 'minsk_duma.jpg',
        characters: ['czapski', 'petrov', 'lyakhovsky'],
        speaker: 'Губернатор Петров',
        text: 'Городская дума. Купцы, чиновники, мещане. Чапский представляет меня. Реакция скептическая. "Европа, батенька, это Европа, а у нас Россия. У нас денег нет", — говорит купец Ляховский, владелец кожевенного завода. Губернатор Петров добавляет: "Ваши идеи прекрасны, но наш бюджет — 50 тысяч в год. Канализация Лондона стоила 3 миллиона фунтов. Чувствуете разницу?"',
        choices: [
            {
                text: 'Предложить поэтапный план (сначала водопровод)',
                effects: { influence: 2, science: 1 },
                nextScene: 'minsk_3',
                tooltip: 'Прагматичный путь'
            },
            {
                text: 'Настаивать на комплексном проекте (сразу всё)',
                effects: { influence: -2 },
                nextScene: 'minsk_3',
                tooltip: 'Рискованный путь'
            },
            {
                text: 'Предложить частно-государственное партнёрство',
                effects: { influence: 1, resources: 1 },
                nextScene: 'minsk_3',
                tooltip: 'Переговоры с купцами'
            }
        ]
    },
    
    minsk_3: {
        id: 'minsk_3',
        city: 'Минск',
        year: 1872,
        background: 'minsk_swamp.jpg',
        characters: ['olga'],
        speaker: 'Доктор Ольга Радзивилл',
        text: 'Я изучаю санитарное состояние Минска. Доктор Ольга Радзивилл, первая женщина-врач в городе, показывает мне холерный барак на окраине. "Смотрите, — она открывает дверь. — Дети умирают от воды, которую пьют. А Ляховский сливает отходы в Свислочь. Мы просили, требовали — бесполезно". В бараке запах смерти. Я узнаю его — тот же, что в Сохо, в Париже.',
        choices: [
            {
                text: 'Начать системное исследование воды',
                effects: { science: 2 },
                nextScene: 'minsk_4'
            },
            {
                text: 'Пойти к Ляховскому и попытаться договориться',
                effects: { influence: 1 },
                nextScene: 'minsk_4_lyakhovsky'
            },
            {
                text: 'Поднять народ, устроить сход',
                effects: { trust: 2, influence: -1 },
                nextScene: 'minsk_4_people'
            }
        ],
        researchNote: 'В 1870-е годы Минск был типичным губернским городом с населением около 60 тысяч человек. Централизованного водопровода не было, воду брали из Свислочи и колодцев. Загрязнение было чудовищным, эпидемии случались каждые 10 лет.'
    },
    
    minsk_4: {
        id: 'minsk_4',
        city: 'Минск',
        year: 1872,
        background: 'minsk_lab.jpg',
        characters: ['olga'],
        speaker: 'Алексей',
        text: 'Мы с Ольгой собираем пробы воды из Свислочи и колодцев. Я использую микроскоп, привезённый из Парижа. Картина ужасная: вода кишит бактериями. Выше по течению — стоки завода Ляховского. Я составляю карту загрязнений, как когда-то Сноу в Лондоне.',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'minsk_5'
            }
        ],
        onEnter: function() {
            addDiaryNote('1872', 'Я снова строю карту смерти. Как в Лондоне. Только теперь я не ассистент, а главный. И ответственность — на мне.');
        }
    },
    
    minsk_4_lyakhovsky: {
        id: 'minsk_4_lyakhovsky',
        city: 'Минск',
        year: 1872,
        background: 'minsk_factory.jpg',
        characters: ['lyakhovsky'],
        speaker: 'Ляховский',
        text: '"Вы ко мне с претензиями? — Ляховский развалился в кресле. — Я завод строил, людям работу дал. А вы говорите — вода. Всегда так жили, и ничего. Это вы, с вашей европейской наукой, мутите воду!" Он не слушает аргументов. Для него я — чужак, который лезет не в своё дело.',
        choices: [
            {
                text: 'Пригрозить судом',
                effects: { influence: -1 },
                nextScene: 'minsk_5',
                tooltip: 'Ляховский смеётся: у него связи в суде'
            },
            {
                text: 'Предложить компромисс: очистные за полцены от города',
                effects: { resources: -2, influence: 1 },
                nextScene: 'minsk_5',
                tooltip: '-2 Ресурса, +1 Влияние'
            }
        ]
    },
    
    minsk_4_people: {
        id: 'minsk_4_people',
        city: 'Минск',
        year: 1872,
        background: 'minsk_meeting.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я собираю сход. Приходит много народа — те, кто потерял детей, кто боится за семьи. Я рассказываю о воде, о заразе, о том, что нужно делать. Люди слушают, кивают. Но когда я предлагаю идти к Ляховскому, голоса стихают. "Он хозяин, — говорит старик. — А мы кто? Мы никто".',
        choices: [
            {
                text: 'Продолжить',
                effects: {},
                nextScene: 'minsk_5'
            }
        ]
    },
    
minsk_5: {
    id: 'minsk_5',
    city: 'Минск',
    year: 1873,
    background: 'minsk_construction.jpg',
    characters: ['czapski', 'struve'],
    speaker: 'Инженер Струве',
    text: 'Несмотря на сопротивление, проект водопровода утверждён. Инженер Струве, немец на русской службе, показывает чертежи: "Воду будем брать выше по течению, фильтровать через песок. 16 водоразборных колонок. Скромно, но для Минска — революция". Чапский сияет. Ляховский ворчит, но вынужден согласиться.',
    choices: [
        {
            text: 'Следить за строительством',
            effects: { science: 2 },
            nextScene: 'minsk_6',
            tooltip: '+2 Наука'
        }
    ],
    onEnter: function() {
        addDiaryNote('1873', 'Водопровод утвердили. Маленькая победа.');
    }
},
    
minsk_6: {
    id: 'minsk_6',
    city: 'Минск',
    year: 1874,
    background: 'minsk_opening.jpg',
    characters: ['czapski', 'olga'],
    speaker: 'Алексей',
    text: 'Открытие водопровода. Толпа горожан. Кто-то крестится, кто-то пробует воду. Чапский говорит речь. Я стою в стороне, вспоминая Лондон и Париж. Это только начало. Но сегодня — победа.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'minsk_7',
            tooltip: 'Дальше'
        }
    ],
    onEnter: function() {
        // Применяем бонусы за опыт
        if (gameState.londonPath === 'a' && gameState.parisPath === 'engineer') {
            showResearchPopup('Благодаря опыту Лондона и Парижа, минский водопровод — один из лучших в империи.');
            applyEffects({ science: 2 });
        }
        
        if (gameState.flags.marie_goes_to_minsk) {
            gameState.flags.marie_in_minsk = true;
            showResearchPopup('Мари приехала со мной. Она помогает в клинике.');
        }
        
        // Добавляем запись в дневник
        addDiaryNote('1874', 'Сегодня открыли водопровод. Я вспоминал Лондон, Сохо, Брод-стрит. Сноу был бы доволен.');
    }
},
    
minsk_7: {
    id: 'minsk_7',
    city: 'Минск',
    year: 1876,
    background: 'minsk_drainage.jpg',
    characters: ['olga'],
    speaker: 'Алексей',
    text: 'Теперь новая задача: осушить болота в центре. Рабочие прокладывают дренажные канавы на Немиге, в районе Татарских огородов. Ольга рядом. Между нами — то, что трудно назвать словами. Понимание. Уважение. Может быть, больше.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'minsk_8',
            tooltip: 'Дальше'
        }
    ],
    onEnter: function() {
        addDiaryNote('1876', 'Осушаем болота. Ольга всё время рядом. Странное чувство - после стольких лет одиночества.');
    }
},
    
    minsk_8: {
    id: 'minsk_8',
    city: 'Минск',
    year: 1878,
    background: 'minsk_cholera.jpg',
    characters: ['olga'],
    speaker: 'Алексей',
    text: '1878 год. В Минске снова холера. Но теперь, благодаря водопроводу, центр города защищён. Болеют на окраинах. Мы с Ольгой работаем сутками. Учим людей кипятить воду. Для крестьян это звучит дико: "Как это — варить воду? Вода сырой должна быть, Господом данной!"',
    choices: [
        {
            text: 'Идти в народ, объяснять, убеждать',
            effects: { health: -10, trust: 3 },
            nextScene: 'minsk_9',
            tooltip: '+3 Народ, -10 здоровья'
        }
    ],
    onEnter: function() {
        addDiaryNote('1878', 'Холера снова здесь. Но теперь у нас есть оружие - знания. Жаль, что люди не всегда хотят слушать.');
    }
},
    
    minsk_9: {
    id: 'minsk_9',
    city: 'Минск',
    year: 1878,
    background: 'minsk_child.jpg',
    characters: ['olga'],
    speaker: 'Алексей',
    text: 'Я стою у постели умирающего ребёнка. Рядом Ольга. Ребёнок — из семьи, которая не слушала советов и пила сырую воду из колодца. "Мы построили водопровод. Мы осушили болота. Но этого мало, — говорю я. — Нужно менять головы. Нужно учить". Ольга молчит. Она держит мою руку и плачет.',
    choices: [
        {
            text: 'Продолжить',
            effects: {},
            nextScene: 'minsk_end',
            tooltip: 'К финалу'
        }
    ],
    onEnter: function() {
        applyEffects({ health: -5, insight: 1 });
        addDiaryNote('1878', 'Ребёнок умер. Мы спасаем тела, но не души. Просвещение - вот настоящее лекарство.');
    }
},
    
    minsk_end: {
        id: 'minsk_end',
        city: 'Минск',
        year: 1878,
        background: 'minsk_future.jpg',
        characters: ['czapski', 'olga'],
        speaker: 'Алексей',
        text: 'Эпидемия закончилась. Городская дума обсуждает итоги. Водопровод спас тысячи. Но канализация всё ещё в проектах — денег нет. Чапский обещает достать. Я смотрю на Ольгу, на заснеженные улицы Минска, и думаю о том, что путь длиною в 30 лет подходит к концу.',
        choices: [
            {
                text: 'Остаться в Минске и продолжить работу с Чапским',
                effects: {},
                nextScene: 'ending_minsk_stay',
                setFlag: 'ending_minsk_stay'
            },
            {
                text: 'Вернуться в Европу',
                effects: {},
                nextScene: 'ending_europe',
                setFlag: 'ending_europe'
            },
            {
                text: 'Уехать в Петербург, продвигать реформы в империи',
                effects: {},
                nextScene: 'ending_petersburg',
                setFlag: 'ending_petersburg'
            },
            {
                text: 'Остаться с Ольгой, открыть школу для врачей',
                effects: {},
                nextScene: 'ending_teacher',
                setFlag: 'ending_teacher'
            }
        ]
    },
    
    // ===== КОНЦОВКИ =====
    ending_minsk_stay: {
        id: 'ending_minsk_stay',
        city: 'Минск',
        year: 1890,
        background: 'minsk_tram.jpg',
        characters: ['olga', 'czapski'],
        speaker: 'Алексей',
        text: '1890-е годы. По Захарьевской улице идёт трамвай. Под землёй — канализация, которую мы всё-таки построили. Я гуляю с Ольгой и внуками по Александровскому скверу. Рядом — памятник Чапскому, без которого ничего бы не было. Я сделал это.',
        choices: [],
        ending: true,
        endingTitle: 'Отец города'
    },
    
    ending_europe: {
        id: 'ending_europe',
        city: 'Берлин',
        year: 1885,
        background: 'berlin.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я консультирую города по всей Европе — Вену, Берлин, Стокгольм. Моё имя известно, меня приглашают на конгрессы. Но иногда мне снится Минск. И Ольга. И я просыпаюсь с чувством, что оставил там что-то важное.',
        choices: [],
        ending: true,
        endingTitle: 'Европейская знаменитость'
    },
    
    ending_petersburg: {
        id: 'ending_petersburg',
        city: 'Петербург',
        year: 1885,
        background: 'petersburg.jpg',
        characters: [],
        speaker: 'Алексей',
        text: 'Я чиновник особых поручений при министерстве. Продвигаю санитарные реформы, пишу законы. Бюрократия засасывает, но я помню, зачем я здесь — чтобы города империи перестали убивать своих жителей.',
        choices: [],
        ending: true,
        endingTitle: 'Петербургский чиновник'
    },
    
    ending_teacher: {
        id: 'ending_teacher',
        city: 'Минск',
        year: 1890,
        background: 'minsk_school.jpg',
        characters: ['olga'],
        speaker: 'Алексей',
        text: 'Мы с Ольгой открыли школу для врачей. Выпустили уже три курса. Наши ученики работают по всей Беларуси. Я смотрю на молодые лица и понимаю: невидимый архитектор — это не холера. Это страх. А мы научили людей не бояться.',
        choices: [],
        ending: true,
        endingTitle: 'Учитель'
    }
};

// ========== ФУНКЦИИ УПРАВЛЕНИЯ ИГРОЙ ==========

// Глобальные переменные интерфейса
let currentScene = null;
let loadingProgress = 0;
let musicEnabled = true;
let soundEnabled = true;
let typewriterTimeout = null;
let isLoading = false; // Флаг для предотвращения множественных загрузок

// Инициализация игры при загрузке страницы
window.onload = function() {
    simulateLoading();
};

// Симуляция загрузки
function simulateLoading() {
    const interval = setInterval(() => {
        loadingProgress += Math.random() * 10;
        if (loadingProgress >= 100) {
            loadingProgress = 100;
            clearInterval(interval);
            document.getElementById('loading-progress').style.width = '100%';
            document.getElementById('loading-text').textContent = 'Загрузка завершена';
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('main-menu').style.display = 'block';
            }, 500);
        }
        document.getElementById('loading-progress').style.width = loadingProgress + '%';
    }, 200);
}

// Начать новую игру
function startNewGame() {
    gameState = {
        currentScene: 'prolog_1',
        currentCity: 'Саратов',
        year: 1848,
        stats: {
            influence: 0,
            trust: 0,
            science: 0,
            resources: 0,
            insight: 0,
            health: 100
        },
        inventory: [],
        diary: [],
        flags: {},
        history: [],
        choices: {}
    };
    
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-interface').style.display = 'flex';
    
    loadScene('prolog_1');
    
    if (musicEnabled) {
        document.getElementById('bg-music').play();
    }
}

function renderDefaultContinueButton(scene) {
    const container = document.getElementById('choices-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = '▶ Продолжить';
    
    btn.onclick = function() {
        if (scene.defaultNextScene) {
            loadScene(scene.defaultNextScene);
        } else {
            console.warn('Нет следующей сцены для продолжения');
            // Если нет следующей сцены, возможно это конец игры
            if (scene.ending) {
                showEnding(scene);
            }
        }
    };
    
    container.appendChild(btn);
}

// Загрузка сцены
function loadScene(sceneId) {
    if (isLoading) {
        console.log('Загрузка уже выполняется, пропускаем');
        return;
    }
    isLoading = true;
    
    console.log('Загружаем сцену:', sceneId);
    
    // Очищаем таймер печатной машинки
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }
    
    const scene = scenes[sceneId];
    if (!scene) {
        console.error('Сцена не найдена:', sceneId);
        isLoading = false;
        return;
    }
    
    currentScene = scene;
    gameState.currentScene = sceneId;
    gameState.currentCity = scene.city;
    gameState.year = scene.year;
    
    // Обновить фон с проверкой существования файла
    const bgElement = document.getElementById('background');
    if (bgElement) {
        const bgPath = 'images/backgrounds/' + (scene.background || 'default.jpg');
        bgElement.src = bgPath;
        bgElement.onerror = function() {
            this.src = 'images/backgrounds/default.jpg';
        };
    }
    
    // Обновить имя говорящего
    const speakerElement = document.getElementById('speaker-name');
    if (speakerElement) {
        speakerElement.textContent = scene.speaker || '';
    }
    
    // Обновить текст с эффектом печатной машинки (опционально)
    const textElement = document.getElementById('scene-text');
    if (textElement) {
        if (scene.text) {
            // Можно использовать typeWriter для эффекта печати
            // typeWriter(scene.text, 'scene-text', 20);
            textElement.textContent = scene.text;
            textElement.classList.remove('typing');
        } else {
            textElement.innerHTML = '<em>...</em>';
        }
    }
    
    // Обновить персонажей
    updateCharacters(scene.characters || []);
    
    // ОЧИЩАЕМ КОНТЕЙНЕР С КНОПКАМИ
    const choicesContainer = document.getElementById('choices-container');
    if (choicesContainer) {
        choicesContainer.innerHTML = '';
    }
    
    // Флаг, чтобы отследить, созданы ли кнопки
    let choicesCreated = false;
    
    // Если есть onEnter - вызываем его
    if (scene.onEnter) {
        console.log('Вызываем onEnter для сцены:', sceneId);
        try {
            scene.onEnter();
        } catch (e) {
            console.error('Ошибка в onEnter:', e);
        }
        
        // Проверяем, создал ли onEnter кнопки
        if (choicesContainer && choicesContainer.children.length > 0) {
            choicesCreated = true;
            console.log('Кнопки созданы в onEnter');
        }
    }
    
    // Если кнопки еще не созданы и это не концовка
    if (!choicesCreated && choicesContainer) {
        
        // Если есть статичные выборы в сцене
        if (scene.choices && scene.choices.length > 0) {
            console.log('Создаем статичные выборы для сцены:', sceneId);
            
            let choicesAdded = 0;
            scene.choices.forEach(choice => {
                // Проверяем условие, если есть
                if (choice.condition && typeof choice.condition === 'function') {
                    try {
                        if (!choice.condition()) {
                            return; // Пропускаем этот выбор
                        }
                    } catch (e) {
                        console.error('Ошибка в условии выбора:', e);
                        return;
                    }
                }
                
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.textContent = choice.text;
                
                // Добавляем тултип если есть
                if (choice.tooltip) {
                    btn.title = choice.tooltip;
                }
                
                btn.onclick = function() {
                    console.log('Выбор сделан:', choice.text);
                    
                    // Применяем эффекты если есть
                    if (choice.effects) {
                        applyEffects(choice.effects);
                    }
                    
                    // Устанавливаем флаг если есть
                    if (choice.setFlag) {
                        gameState.flags[choice.setFlag] = true;
                    }
                    
                    // Проигрываем звук клика
                    if (soundEnabled) {
                        document.getElementById('sound-click')?.play();
                    }
                    
                    // Переходим к следующей сцене
                    if (choice.nextScene) {
                        loadScene(choice.nextScene);
                    } else {
                        console.warn('Нет следующей сцены для этого выбора');
                        // Если нет следующей сцены, возможно это конец игры
                        if (scene.ending) {
                            showEnding(scene);
                        }
                    }
                };
                
                choicesContainer.appendChild(btn);
                choicesAdded++;
            });
            
            if (choicesAdded > 0) {
                choicesCreated = true;
            }
        }
        // Если сцена является концовкой
        else if (scene.ending) {
            console.log('Сцена является концовкой:', sceneId);
            showEnding(scene);
            choicesCreated = true;
        }
        // Если нет ни onEnter, ни выборов - создаем кнопку "Продолжить"
        else {
            console.log('Нет выборов, создаем кнопку "Продолжить" для сцены:', sceneId);
            
            // Проверяем наличие defaultNextScene или пытаемся найти следующую сцену
            let nextSceneId = scene.defaultNextScene;
            
            // Если нет defaultNextScene, пытаемся определить логически
            if (!nextSceneId) {
                if (sceneId.includes('prolog')) {
                    if (sceneId === 'prolog_6') nextSceneId = 'interlude_1';
                } else if (sceneId.includes('london')) {
                    if (sceneId === 'london_end') nextSceneId = 'paris_1';
                } else if (sceneId.includes('paris')) {
                    if (sceneId === 'paris_end') nextSceneId = 'minsk_1';
                } else if (sceneId.includes('minsk')) {
                    if (sceneId === 'minsk_end') {
                        // Для Минска показываем концовку
                        if (scene.ending) {
                            showEnding(scene);
                            return;
                        }
                    }
                }
            }
            
            const continueBtn = document.createElement('button');
            continueBtn.className = 'choice-btn';
            continueBtn.textContent = '▶ Продолжить';
            
            continueBtn.onclick = function() {
                if (soundEnabled) {
                    document.getElementById('sound-click')?.play();
                }
                
                if (nextSceneId) {
                    loadScene(nextSceneId);
                } else {
                    console.warn('Нет следующей сцены для продолжения');
                    // Если нет следующей сцены, проверяем не концовка ли это
                    if (scene.ending) {
                        showEnding(scene);
                    } else {
                        // Пробуем найти следующую сцену по номеру
                        const parts = sceneId.split('_');
                        if (parts.length >= 2) {
                            const base = parts[0];
                            const num = parseInt(parts[1]);
                            if (!isNaN(num)) {
                                const nextId = base + '_' + (num + 1);
                                if (scenes[nextId]) {
                                    loadScene(nextId);
                                } else {
                                    alert('Достигнут конец главы. Скоро продолжение...');
                                }
                            }
                        }
                    }
                }
            };
            
            choicesContainer.appendChild(continueBtn);
            choicesCreated = true;
        }
    }
    
    // Показать исследовательскую заметку если есть
    if (scene.researchNote) {
        showResearchPopup(scene.researchNote);
    }
    
    // Обновить статистику
    updateStats();
    
    // Обновить инвентарь и дневник
    updateInventory();
    updateDiary();
    
    // Добавить в историю
    gameState.history.push({
        scene: sceneId,
        text: scene.text,
        year: scene.year,
        city: scene.city
    });
    
    // Ограничим историю последними 50 записями
    if (gameState.history.length > 50) {
        gameState.history = gameState.history.slice(-50);
    }
    
    // Проверить, является ли сцена концовкой (если еще не показали)
    if (scene.ending && !choicesCreated) {
        showEnding(scene);
    }
    
    isLoading = false;
    console.log('Загрузка сцены завершена:', sceneId);
}
// Эффект печатной машинки (безопасная версия)
function typeWriter(text, elementId = 'scene-text', speed = 30) {
    if (typewriterTimeout) {
        clearTimeout(typewriterTimeout);
        typewriterTimeout = null;
    }
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Очищаем и показываем курсор
    element.innerHTML = '';
    element.classList.add('typing');
    
    let i = 0;
    
    function type() {
        if (i < text.length) {
            // Используем textContent для безопасной вставки
            element.textContent += text.charAt(i);
            i++;
            typewriterTimeout = setTimeout(type, speed);
        } else {
            element.classList.remove('typing');
            typewriterTimeout = null;
        }
    }
    
    type();
}

// Обновление персонажей на сцене
function updateCharacters(characters) {
    const layer = document.getElementById('characters-layer');
    layer.innerHTML = '';
    
    characters.forEach((char, index) => {
        const img = document.createElement('img');
        img.src = 'images/characters/' + char + '.png';
        img.className = 'character hidden'; // Добавляем hidden сразу
        
        if (index === 0) img.classList.add('left');
        else if (index === 1) img.classList.add('center');
        else if (index === 2) img.classList.add('right');
        
        layer.appendChild(img);
        
        // Анимация появления
        setTimeout(() => {
            img.classList.remove('hidden');
        }, 100);
    });
}

// Универсальная функция применения эффектов
function applyEffects(effects) {
    if (!effects) return;
    
    for (let stat in effects) {
        const value = effects[stat];
        
        if (stat === 'health') {
            gameState.stats.health = Math.min(100, Math.max(0, (gameState.stats.health || 100) + value));
        } 
        else if (['influence', 'trust', 'science', 'resources', 'insight'].includes(stat)) {
            gameState.stats[stat] = Math.max(0, (gameState.stats[stat] || 0) + value);
        }
        else {
            console.log('Неизвестная характеристика:', stat, value);
        }
    }
    
    updateStats();
}

// Обновление отображения статистики
function updateStats() {
    const stats = gameState.stats;
    
    document.getElementById('stat-influence').innerHTML = '🏛️ <span>' + (stats.influence || 0) + '</span>';
    document.getElementById('stat-trust').innerHTML = '👥 <span>' + (stats.trust || 0) + '</span>';
    document.getElementById('stat-science').innerHTML = '📚 <span>' + (stats.science || 0) + '</span>';
    document.getElementById('stat-resources').innerHTML = '💰 <span>' + (stats.resources || 0) + '</span>';
    document.getElementById('stat-insight').innerHTML = '🔬 <span>' + (stats.insight || 0) + '</span>';
    document.getElementById('stat-health').innerHTML = '❤️ Здоровье · <span>' + (stats.health || 100) + '%</span>';
    document.getElementById('stat-city').innerHTML = '📍 ' + (gameState.currentCity || 'Лондон') + ' · ' + (gameState.year || 1853);
}

// Добавление предмета в инвентарь
function addInventoryItem(id, name, description) {
    gameState.inventory.push({ id, name, description });
    updateInventory();
}

// Обновление инвентаря
function updateInventory() {
    const container = document.getElementById('inventory-items');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.inventory.forEach(item => {
        const div = document.createElement('div');
        div.className = 'inventory-item';
        div.innerHTML = `
            <span class="inventory-icon">📦</span>
            <div>
                <div class="inventory-name">${escapeHTML(item.name)}</div>
                <div class="inventory-desc">${escapeHTML(item.description)}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Добавление записи в дневник
function addDiaryNote(date, text) {
    gameState.diary.push({ date, text });
    updateDiary();
}

// Обновление дневника
function updateDiary() {
    const container = document.getElementById('diary-notes');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.diary.slice(-5).forEach(note => {
        const div = document.createElement('div');
        div.className = 'diary-note';
        div.innerHTML = `
            <div class="diary-date">${escapeHTML(note.date)}</div>
            <div>${escapeHTML(note.text)}</div>
        `;
        container.appendChild(div);
    });
}

// Простое экранирование HTML для защиты от XSS
function escapeHTML(str) {
    return String(str).replace(/[&<>"]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        if (match === '"') return '&quot;';
        return match;
    });
}

// Показать исследовательскую заметку
function showResearchPopup(text) {
    const popup = document.getElementById('research-popup');
    document.getElementById('research-popup-text').textContent = text;
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.display = 'none';
    }, 8000);
}

// Скрыть исследовательскую заметку
function hideResearchPopup() {
    document.getElementById('research-popup').style.display = 'none';
}

// Показать историю
function showHistory() {
    const modal = document.getElementById('history-modal');
    const historyText = document.getElementById('history-text');
    
    historyText.innerHTML = '';
    gameState.history.slice(-10).forEach(entry => {
        historyText.innerHTML += `<p><strong>${escapeHTML(entry.city)}, ${entry.year}</strong><br>${escapeHTML(entry.text)}</p><hr>`;
    });
    
    modal.style.display = 'flex';
}

// Скрыть историю
function hideHistory() {
    document.getElementById('history-modal').style.display = 'none';
}

// Показать энциклопедию (из главного меню)
function showEncyclopedia() {
    document.getElementById('encyclopedia-modal').style.display = 'flex';
    document.getElementById('main-menu').style.display = 'none';
    // Очищаем предыдущее содержимое
    document.getElementById('encyclopedia-content').innerHTML = '<p>Выберите статью из списка справа</p>';
}

// Скрыть энциклопедию (крестик)
function hideEncyclopedia() {
    document.getElementById('encyclopedia-modal').style.display = 'none';
    
    // Проверяем, откуда вернулись
    const gameInterface = document.getElementById('game-interface');
    const mainMenu = document.getElementById('main-menu');
    
    // Если игровой интерфейс видим - мы в игре, не показываем главное меню
    if (gameInterface.style.display === 'flex') {
        return; // Просто закрываем модалку, интерфейс игры уже виден
    }
    
    // Если игровой интерфейс скрыт, а главное меню было скрыто - показываем главное меню
    if (mainMenu.style.display !== 'block') {
        mainMenu.style.display = 'block';
    }
}

// Показать статью в энциклопедии
function showResearchArticle(articleId) {
    const content = {
        cholera: {
            title: '🦠 Холера в XIX веке',
            text: 'Холера, прозванная "синим страхом", впервые достигла Европы в 1830-х годах. Болезнь отличалась стремительностью, ужасающей симптоматикой (посинение кожи из-за обезвоживания) и высокой летальностью — до 50-60% без лечения. В отсутствие знаний о бактериях, врачи спорили о причинах: миазмы (дурной воздух) или контагий (заразное начало). Эпидемии холеры стали мощнейшим катализатором санитарных реформ, так как обнажили несостоятельность средневековой городской инфраструктуры.'
        },
        snow: {
            title: '👨‍⚕️ Джон Сноу (1813-1858)',
            text: 'Английский врач, один из основоположников эпидемиологии. Был личным анестезиологом королевы Виктории (принимал роды у 8 её детей!). Во время эпидемии холеры в Лондоне 1854 года провёл знаменитое расследование: нанёс случаи смерти на карту и обнаружил кластеризацию вокруг насоса на Брод-стрит. Убедил власти снять рукоятку, после чего эпидемия пошла на спад. Его теория водного пути передачи холеры была революционной и встретила сопротивление научного сообщества, признавшего её правоту лишь после смерти Сноу.'
        },
        chadwick: {
            title: '📊 Эдвин Чадуик (1800-1890)',
            text: 'Английский юрист и социальный реформатор, автор знаменитого "Отчёта о санитарном состоянии трудящегося населения Великобритании" (1842). Доказал на статистике, что болезни и преждевременная смерть среди рабочих обходятся государству дороже, чем профилактические меры. Был сторонником миазматической теории, считая, что болезни возникают из-за "дурного воздуха". Его деятельность привела к созданию первых санитарных комиссий и законов об общественном здоровье.'
        },
        haussman: {
            title: '🏛️ Барон Жорж-Эжен Осман (1809-1891)',
            text: 'Французский государственный деятель, префект департамента Сена (1853-1870). По поручению Наполеона III провёл грандиозную перестройку Парижа. Широкие бульвары, парки, единая система водоснабжения и канализации (совместно с инженером Бельграном) — всё это создало современный облик Парижа. Однако оборотной стороной стала социальная сегрегация: рабочие были вытеснены на окраины, а центр стал пространством для буржуазии. Санитарная риторика служила оправданием для политического и эстетического проекта.'
        },
        czapski: {
            title: '🌳 Кароль Чапский (1860-1904)',
            text: 'Минский городской голова в 1885-1901 годах. Аристократ, европеец, мечтатель. При нём Минск начал превращаться в современный город: построен водопровод (1874, ещё до его официального правления, но при его активном участии), осушены болота, замощены улицы, проведено электричество, открыта первая телефонная станция. Чапский лично вкладывал средства в городские проекты. Его деятельность — пример того, как один человек может изменить город даже в условиях ограниченных ресурсов.'
        },
        greatstink: {
            title: '💨 Великое зловоние 1858 года',
            text: 'Лето 1858 года в Лондоне. Аномальная жара и засуха привели к тому, что Темза, куда столетиями сливали нечистоты, превратилась в открытый коллектор. Запах был настолько сильным, что сорвал заседания Парламента (окна здания выходили на реку). Газета The Times писала: "Миазмы, поднимающиеся от реки, настолько губительны, что те, кто вынужден вдыхать их, едва способны переносить жизнь". За 18 дней был принят закон, давший старт строительству канализации Джозефа Базалджета.'
        }
    };
    
    const article = content[articleId];
    if (article) {
        displayInEncyclopedia(article.title, article.text);
    }
}

// Отображение контента в модальном окне энциклопедии
function displayInEncyclopedia(title, text) {
    const modal = document.getElementById('encyclopedia-modal');
    const contentDiv = document.getElementById('encyclopedia-content');
    
    contentDiv.innerHTML = `<h3>${escapeHTML(title)}</h3><p>${escapeHTML(text).replace(/\n/g, '<br>')}</p>`;
    modal.style.display = 'flex';
    
    // Важно: НЕ скрываем игровой интерфейс или главное меню
    // Модальное окно просто появляется поверх текущего контента
}

// Показать исследовательскую работу (источники)
function showSources() {
    // Открываем research_full.html в новой вкладке
    window.open('research_full.html', '_blank');
    
    // Главное меню оставляем видимым (не закрываем)
    // document.getElementById('main-menu').style.display = 'none'; - эту строку удаляем или комментируем
}

// Скрыть источники
function hideSources() {
    document.getElementById('sources-modal').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Показать настройки
function showSettings() {
    document.getElementById('settings-modal').style.display = 'flex';
    document.getElementById('main-menu').style.display = 'none';
}

// Скрыть настройки
function hideSettings() {
    document.getElementById('settings-modal').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

// Сохранить настройки
function saveSettings() {
    musicEnabled = document.getElementById('music-toggle').checked;
    soundEnabled = document.getElementById('sound-toggle').checked;
    
    const music = document.getElementById('bg-music');
    if (musicEnabled) {
        music.volume = document.getElementById('music-volume').value / 100;
        music.play();
    } else {
        music.pause();
    }
    
    hideSettings();
}

// Показать концовку
function showEnding(scene) {
    document.getElementById('ending-title').textContent = scene.endingTitle || 'Конец';
    document.getElementById('ending-text').textContent = scene.text || '';
    
    const statsList = document.getElementById('ending-stats-list');
    statsList.innerHTML = `
        <p>🏛️ Влияние: ${gameState.stats.influence || 0}</p>
        <p>👥 Народная поддержка: ${gameState.stats.trust || 0}</p>
        <p>📚 Научный авторитет: ${gameState.stats.science || 0}</p>
        <p>💰 Ресурсы: ${gameState.stats.resources || 0}</p>
        <p>🔬 Прозрение: ${gameState.stats.insight || 0}</p>
        <p>❤️ Здоровье: ${gameState.stats.health || 100}%</p>
    `;
    
    document.getElementById('ending-modal').style.display = 'flex';
}

// Перезапустить игру
function restartGame() {
    document.getElementById('ending-modal').style.display = 'none';
    startNewGame();
}

// Показать титры
function showCredits() {
    alert('Невидимый архитектор: Три города\n\nВизуальная новелла по мотивам исследовательской работы\n"Невидимый архитектор: как холера перестроила Лондон, Париж и Минск"\n\nАвтор исследования: Тарасенко Карина Витальевна\nРуководитель: Барейша Илья Александрович\n\nГУО "Средняя школа №5 г.Жлобина"\n2025 год');
}

// Переключение вкладок боковой панели
function showSidebarTab(tab) {
    document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.sidebar-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'inventory') {
        document.querySelector('.sidebar-tab').classList.add('active');
        document.getElementById('inventory-tab').classList.add('active');
    } else {
        document.querySelectorAll('.sidebar-tab')[1].classList.add('active');
        document.getElementById('research-tab').classList.add('active');
    }
}

// Показать исследовательскую заметку (из боковой панели)
function showResearchNote() {
    showSidebarTab('research');
}

// Сохранить игру
function saveGame() {
    try {
        localStorage.setItem('gameState', JSON.stringify(gameState));
        alert('Игра сохранена');
    } catch (e) {
        alert('Ошибка при сохранении игры');
    }
}

// Загрузить игру
function loadGame() {
    try {
        const saved = localStorage.getItem('gameState');
        if (!saved) {
            alert('Нет сохраненной игры');
            return;
        }
        
        const loadedState = JSON.parse(saved);
        
        // Базовая валидация загруженного состояния
        if (!loadedState || !loadedState.currentScene) {
            throw new Error('Поврежденное сохранение');
        }
        
        gameState = loadedState;
        
        // Скрываем меню и показываем игру
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-interface').style.display = 'flex';
        
        // Загружаем сцену и обновляем все интерфейсы
        loadScene(gameState.currentScene);
        updateStats();
        updateInventory();
        updateDiary();
        
        alert('Игра загружена');
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        alert('Не удалось загрузить сохранение. Файл поврежден.');
    }
}

// Показать модальное окно загрузки в главном меню
function showLoadModal() {
    if (confirm('Загрузить последнее сохранение?')) {
        loadGame();
    }
}

// Открыть меню (пауза)
function openMenu() {
    if (confirm('Вернуться в главное меню? Несохранённый прогресс будет потерян.')) {
        document.getElementById('game-interface').style.display = 'none';
        document.getElementById('main-menu').style.display = 'block';
    }
}

// Показать полную исследовательскую работу
function showFullResearch() {
    window.open('research_full.html', '_blank');
}

// ===== НОВЫЕ ФУНКЦИИ ДЛЯ ЭНЦИКЛОПЕДИИ =====
// Переключение разделов энциклопедии
function showEncyclopediaSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('.encyclopedia-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активный класс у всех кнопок
    document.querySelectorAll('.encyclopedia-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем нужную секцию
    const section = document.getElementById('encyclopedia-' + sectionId);
    if (section) {
        section.classList.add('active');
    }
    
    // Активируем соответствующую кнопку
    const buttons = document.querySelectorAll('.encyclopedia-nav-btn');
    const index = sectionId === 'people' ? 0 : 
                  sectionId === 'events' ? 1 : 
                  sectionId === 'places' ? 2 : 3;
    if (buttons[index]) {
        buttons[index].classList.add('active');
    }
}

// Раскрытие/сворачивание карточки энциклопедии
function toggleEncyclopediaCard(card) {
    card.classList.toggle('active');
}

// Переопределим функцию showEncyclopedia для открытия с активной секцией
function showEncyclopedia() {
    document.getElementById('encyclopedia-modal').style.display = 'flex';
    document.getElementById('main-menu').style.display = 'none';
    
    // По умолчанию показываем раздел "Личности"
    showEncyclopediaSection('people');
}

// Обновим функцию hideEncyclopedia
function hideEncyclopedia() {
    document.getElementById('encyclopedia-modal').style.display = 'none';
    
    // Проверяем, откуда вернулись
    const gameInterface = document.getElementById('game-interface');
    const mainMenu = document.getElementById('main-menu');
    
    // Если игровой интерфейс видим - мы в игре, не показываем главное меню
    if (gameInterface.style.display === 'flex') {
        return;
    }
    
    // Если игровой интерфейс скрыт, а главное меню было скрыто - показываем главное меню
    if (mainMenu.style.display !== 'block') {
        mainMenu.style.display = 'block';
    }
}
// ===== КОНЕЦ НОВЫХ ФУНКЦИЙ =====

// Экспорт функций в глобальную область
window.startNewGame = startNewGame;
window.showHistory = showHistory;
window.hideHistory = hideHistory;
window.showEncyclopedia = showEncyclopedia;
window.hideEncyclopedia = hideEncyclopedia;
window.showSources = showSources;
window.hideSources = hideSources;
window.showSettings = showSettings;
window.hideSettings = hideSettings;
window.saveSettings = saveSettings;
window.restartGame = restartGame;
window.showCredits = showCredits;
window.showSidebarTab = showSidebarTab;
window.showResearchNote = showResearchNote;
window.saveGame = saveGame;
window.loadGame = loadGame;
window.openMenu = openMenu;
window.hideResearchPopup = hideResearchPopup;
window.showResearchArticle = showResearchArticle;
window.showFullResearch = showFullResearch;
window.showLoadModal = showLoadModal;
window.showEncyclopediaSection = showEncyclopediaSection;
window.toggleEncyclopediaCard = toggleEncyclopediaCard;