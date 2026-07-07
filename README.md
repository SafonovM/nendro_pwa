# Дневник практики Юнгдрунг Бон — PWA

Progressive Web App для учёта практик Нёндро, передач, сновидений и текстов.

## Локальная разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub (например `nendro_pwa`)
2. Включите Pages: **Settings → Pages → Source: GitHub Actions**
3. Запушьте ветку `main`:

```bash
git remote add origin https://github.com/<USER>/nendro_pwa.git
git push -u origin main
```

Сайт будет доступен по адресу:

`https://<USER>.github.io/nendro_pwa/`

> Если имя репозитория другое — GitHub Actions подставит его автоматически.

## Установка на телефон

Откройте сайт в Chrome (Android) или Safari (iOS) → «Добавить на главный экран».
