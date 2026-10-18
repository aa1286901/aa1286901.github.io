# Arabic — библиотека арабских книг

Приложение для iPhone (PWA): https://aa1286901.github.io/arabic/

```
arabic/
├── index.html            страница приложения
├── manifest.webmanifest  установка на экран «Домой»
├── sw.js                 офлайн-режим (должен лежать рядом с index.html)
├── css/
│   └── style.css         оформление, светлая и тёмная тема
├── js/
│   └── app.js            вся логика приложения
├── data/
│   ├── lessons/          уроки «Мабда аль-Кираа» по частям:
│   │   ├── part1/        lesson_1.json … lesson_5.json
│   │   ├── part2/        lesson_1.json … lesson_5.json
│   │   └── part3/        lesson_1.json … lesson_9.json
│   └── books/            деревья книг: mia_amil.json, nahw_ism.json
├── icons/                иконки приложения и фото разработчика
└── pdf/                  исходные книги в PDF
```

После правок `css/style.css` или `js/app.js` поднимите версию: `?v=` в `index.html` и `VERSION` в `sw.js`.
