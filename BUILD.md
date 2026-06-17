# Установка GymAI как отдельного приложения (иконка на телефоне)

Сейчас приложение запускается через **Expo Go** по QR-коду — этого достаточно для
повседневного использования, пока на ПК запущен Metro (`npx expo start`).

Этот файл — на будущее: как сделать «настоящее» приложение с иконкой на экране.
Конфиг уже готов (`eas.json`, идентификаторы в `app.json`), останется выполнить шаги ниже.

---

## iPhone (требуется аккаунт Apple Developer — 99 $/год)

Apple не разрешает ставить приложения мимо App Store без платного аккаунта.
Mac не нужен — сборка идёт в облаке через EAS Build.

1. Завести аккаунт: https://developer.apple.com/programs/ (99 $/год).
2. Установить EAS CLI и войти:
   ```powershell
   npm install -g eas-cli
   eas login
   ```
3. Привязать проект (один раз):
   ```powershell
   eas init
   ```
4. Собрать в облаке (EAS попросит данные Apple-аккаунта и сам создаст сертификаты):
   ```powershell
   eas build --platform ios --profile production
   ```
5. Отправить в TestFlight:
   ```powershell
   eas submit --platform ios --latest
   ```
6. На айфоне установить **TestFlight** (App Store) → принять приглашение →
   установить GymAI. Иконка появится на домашнем экране.

---

## Android (бесплатно, без аккаунта)

Если есть Android-телефон — иконку можно получить бесплатно:

1. EAS CLI и вход (см. выше, шаги 2–3).
2. Собрать APK:
   ```powershell
   eas build --platform android --profile preview
   ```
3. По завершении EAS даст ссылку на `.apk` — скачать на телефон и установить
   (разрешить установку из неизвестных источников).

---

## Важно: AI-функции в отдельной сборке

В standalone-приложении адрес `localhost` недоступен. Тренировки, дневник, прогресс,
база продуктов — **работают офлайн**. Фото еды и чат AI-тренера требуют, чтобы
AI-сервер (`server/`) был размещён в интернете (например, на Render/Railway/VPS),
а его адрес прописан в `EXPO_PUBLIC_API_URL` **на момент сборки**:

```powershell
$env:EXPO_PUBLIC_API_URL = "https://твой-сервер.example.com"
eas build --platform ios --profile production
```
