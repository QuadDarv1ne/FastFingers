# FastFingers — Руководство по сборке на все платформы

## 📋 Требования

### Для всех платформ
- **Node.js** 18+ (рекомендуется 20+)
- **npm** 9+

### Для мобильных приложений (Capacitor)
- **Android**: Android Studio, Android SDK, JDK 17
- **iOS**: macOS, Xcode 15+, CocoaPods

### Для десктопных приложений (Tauri)
- **Windows**: Rust (rustup), Visual Studio Build Tools
- **macOS**: Rust, Xcode Command Line Tools
- **Linux**: Rust, build-essential, libwebkit2gtk-4.1-dev, libgtk-3-dev, libayatana-appindicator3-dev

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Сборка веб-версии
```bash
npm run build
```

## 📱 Мобильные приложения (Capacitor)

### Android

#### Требования
- Android Studio
- JDK 17
- Android SDK 33+

#### Сборка APK
```bash
# Сборка веб-версии и синхронизация
npm run build:android

# Или по шагам:
npm run build
npx cap sync android

# Открыть в Android Studio
npx cap open android

# Сборка APK в Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

#### Сборка Release APK
```bash
# В Android Studio:
# 1. Build → Generate Signed Bundle / APK
# 2. Выберите APK
# 3. Создайте или выберите keystore
# 4. Выберите variant: release
# 5. Нажмите Finish
```

#### Запуск на устройстве
```bash
# Подключите Android устройство по USB
npm run cap:android
```

### iOS

#### Требования
- macOS
- Xcode 15+
- CocoaPods

#### Сборка
```bash
# Сборка веб-версии и синхронизация
npm run build:ios

# Или по шагам:
npm run build
npx cap sync ios

# Открыть в Xcode
npx cap open ios

# В Xcode:
# 1. Выберите команду (ваше устройство)
# 2. Product → Build
# 3. Product → Archive (для App Store)
```

#### Публикация в App Store
```bash
# В Xcode:
# 1. Product → Archive
# 2. Organizer → Distribute App
# 3. Выберите App Store Connect
# 4. Следуйте инструкциям
```

## 💻 Десктопные приложения (Tauri)

### Требования

#### Windows
```bash
# Установите Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установите Visual Studio Build Tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

#### macOS
```bash
# Установите Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установите Xcode Command Line Tools
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
# Установите Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установите зависимости
sudo apt update
sudo apt install -y build-essential libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Сборка

#### Windows
```bash
# Сборка для Windows (.exe, .msi)
npm run build:desktop

# Или по шагам:
npm run build
npm run tauri:build

# Файлы будут в: src-tauri/target/release/bundle/
```

#### macOS
```bash
# Сборка для macOS (.app, .dmg)
npm run build:desktop

# Файлы будут в: src-tauri/target/release/bundle/
```

#### Linux
```bash
# Сборка для Linux (.deb, .rpm, .AppImage)
npm run build:desktop

# Файлы будут в: src-tauri/target/release/bundle/
```

### Кросс-компиляция

#### Сборка для всех платформ сразу
```bash
npm run build:all
```

## 🌐 PWA (Progressive Web App)

### Установка PWA
```bash
# Запустите приложение
npm run dev

# Откройте в браузере (Chrome, Edge, Safari)
# Нажмите на иконку установки в адресной строке
```

### Сборка PWA
```bash
npm run build
npm run preview
```

PWA готово к развертыванию на любом хостинге:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages

## 📂 Структура выходных файлов

После сборки файлы будут расположены:

```
FastFingers/
├── dist/                          # Веб-версия (PWA)
├── android/                       # Android проект (Capacitor)
│   └── app/build/outputs/apk/
│       └── debug/
│           └── app-debug.apk
├── ios/                           # iOS проект (Capacitor)
│   └── App/
│       └── build/
└── src-tauri/target/release/bundle/
    ├── windows/
    │   ├── FastFingers_0.1.0_x64.msi
    │   └── FastFingers_0.1.0_x64.exe
    ├── macos/
    │   └── FastFingers.app
    └── linux/
        ├── fastfingers_0.1.0_amd64.deb
        └── fastfingers_0.1.0_amd64.rpm
```

## 🔧 Команды сборки

| Команда | Описание |
|---------|----------|
| `npm run build` | Сборка веб-версии (PWA) |
| `npm run build:all` | Сборка всех платформ |
| `npm run build:mobile` | Синхронизация мобильных платформ |
| `npm run build:android` | Сборка и открытие Android |
| `npm run build:ios` | Сборка и открытие iOS |
| `npm run build:desktop` | Сборка десктопной версии |
| `npm run tauri:build` | Сборка Tauri приложения |
| `npm run tauri:dev` | Запуск Tauri в режиме разработки |
| `npm run cap:sync` | Синхронизация всех платформ |
| `npm run cap:android` | Запуск на Android |
| `npm run cap:ios` | Запуск на iOS |

## 📝 Примечания

### Android
- Минимальная версия Android: API 22 (Android 5.1)
- Целевая версия: API 33+ (Android 13+)

### iOS
- Минимальная версия iOS: 14.0
- Требуется Apple Developer аккаунт для публикации

### Windows
- Поддерживаемые версии: Windows 10/11
- Архитектура: x64, x86, ARM64

### macOS
- Минимальная версия: macOS 10.15 (Catalina)
- Поддержка Apple Silicon (M1/M2)

### Linux
- Поддерживаемые дистрибутивы: Ubuntu, Debian, Fedora, Arch
- Форматы: .deb, .rpm, .AppImage

## 🐛 Решение проблем

### Capacitor
```bash
# Очистка кэша
npx cap sync --force

# Переустановка платформ
rm -rf android ios
npx cap add android
npx cap add ios
```

### Tauri
```bash
# Очистка сборки
cd src-tauri
cargo clean

# Обновление Tauri
npm install -g @tauri-apps/cli
```

### Общие
```bash
# Полная переустановка
rm -rf node_modules dist android ios src-tauri/target
npm install
npm run build
```

## 📊 Размер приложений

Ожидаемые размеры после сборки:

- **Android APK**: ~5-10 MB
- **iOS IPA**: ~10-15 MB
- **Windows EXE**: ~3-5 MB
- **macOS APP**: ~5-8 MB
- **Linux DEB**: ~5-8 MB
- **PWA**: ~250 KB (gzipped)

## 🎯 Следующие шаги

1. Протестируйте приложение на целевых устройствах
2. Настройте подписывание приложений
3. Подготовьте иконки и скриншоты
4. Опубликуйте в магазинах приложений

---

**Документация**: 
- [Capacitor](https://capacitorjs.com/docs)
- [Tauri](https://tauri.app/v1/guides/)
- [PWA](https://web.dev/progressive-web-apps/)
