// Дописывает PWA-теги в dist/index.html после `expo export -p web`.
// Нужно потому, что output:"single" использует встроенный HTML-шаблон Expo и не применяет +html.
// Запускается автоматически в `npm run build:web`. Идемпотентно (повторный запуск ничего не ломает).
import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'dist', 'index.html');
if (!fs.existsSync(file)) {
  console.error('dist/index.html не найден — сначала выполните `expo export -p web`.');
  process.exit(1);
}

let html = fs.readFileSync(file, 'utf8');

// Язык интерфейса.
html = html.replace(/<html lang="[^"]*">/, '<html lang="ru">');

// Viewport на весь экран (вырез под чёлку, без масштабирования — ощущение нативного приложения).
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />'
);

const MARKER = '<!-- pwa-postbuild -->';
const PWA_TAGS = `    ${MARKER}
    <link rel="manifest" href="/manifest.json" />
    <meta name="background-color" content="#0e0e11" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="FitTrack" />
    <meta name="application-name" content="FitTrack" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <style>html,body{background-color:#0e0e11;}body{overscroll-behavior:none;}</style>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
      }
    </script>
`;

if (!html.includes(MARKER)) {
  html = html.replace('</head>', `${PWA_TAGS}  </head>`);
}

fs.writeFileSync(file, html);
console.log('PWA-теги добавлены в dist/index.html');
