# Документация по интеграции с Tilda

## Файлы

- **tilda-widget.html** — виджет для вставки в Tilda (блок T123)
- **DEPLOY_AMVERA.md** — деплой на Amvera
- **DEPLOY_REGRU.md** — деплой на reg.ru
- **TILDA_GUIDE.md** — полное руководство по интеграции

## Быстрый старт

1. Соберите проект: `npm run build`
2. Задеплойте на хостинг (Netlify/Amvera/reg.ru)
3. Вставьте iframe в Tilda (блок T123)

```html
<iframe src="https://yoursite.netlify.app" width="100%" height="750" frameborder="0"></iframe>
```
