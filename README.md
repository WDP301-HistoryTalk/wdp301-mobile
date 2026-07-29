<div align="center">

# HistoryTalk — Mobile App

**Ứng dụng di động học Lịch sử THPT** — trò chuyện với nhân vật lịch sử bằng AI, làm quiz, theo dõi chuỗi ngày học và nhiệm vụ hằng ngày, ngay trên điện thoại.

[![Expo](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo Router](https://img.shields.io/badge/Expo%20Router-typed%20routes-4630EB)](https://docs.expo.dev/router/introduction/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154?logo=reactquery&logoColor=white)](https://tanstack.com/query)

</div>

---

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Bắt đầu nhanh](#bắt-đầu-nhanh)
- [Biến môi trường](#biến-môi-trường)
- [Chạy trên từng nền tảng](#chạy-trên-từng-nền-tảng)
- [Scripts](#scripts)
- [Quy ước code](#quy-ước-code)
- [Widget màn hình chính (Android)](#widget-màn-hình-chính-android)
- [Vấn đề đã biết](#vấn-đề-đã-biết)
- [Build & Release](#build--release)

---

## Tổng quan

**HistoryTalk Mobile** là ứng dụng React Native (Expo, bare workflow) dành cho học sinh THPT học Lịch sử qua hai trải nghiệm chính:

1. **Trò chuyện với nhân vật lịch sử** — chat trực tiếp với các nhân vật lịch sử được tái hiện bằng AI (RAG — trả lời bám sát tài liệu lịch sử thật), hỗ trợ nhập liệu bằng giọng nói.
2. **Làm quiz lịch sử** — luyện tập theo bộ câu hỏi trắc nghiệm, xem lại đáp án, đánh giá và báo lỗi câu hỏi.

Đi kèm là hệ thống **gamification** (chuỗi ngày học, nhiệm vụ hằng ngày, thưởng token) để duy trì thói quen học tập, và **thanh toán trong app** để nâng cấp gói thuê bao.

App giao tiếp với [`wdp301-backend`](../wdp301-backend) qua REST API — xem README của backend để biết chi tiết API.

## Tính năng chính

| Nhóm | Mô tả |
|---|---|
| **Xác thực** | Đăng ký/đăng nhập email, đăng nhập Google, quên mật khẩu, tự động refresh token khi hết hạn |
| **Chat AI** | Trò chuyện theo phiên với nhân vật lịch sử, gửi tin nhắn bằng giọng nói (Speech-to-Text qua Azure Speech), phát lại câu trả lời (Text-to-Speech) |
| **Nhân vật & Bối cảnh lịch sử** | Duyệt danh sách nhân vật/sự kiện lịch sử, xem chi tiết, lọc theo thời kỳ |
| **Quiz** | Làm bài có giới hạn thời gian, lưu tiến trình dở dang, xem kết quả chi tiết, đánh giá (rating), báo lỗi câu hỏi |
| **Gamification** | Chuỗi ngày học (streak) hiển thị theo tuần, 3 nhiệm vụ hằng ngày với phần thưởng token, nhận thưởng ngay trong app |
| **Widget màn hình chính** | Widget Android hiển thị streak + một nhân vật lịch sử ngẫu nhiên, tự cập nhật định kỳ |
| **Thanh toán** | Xem/mua gói thuê bao (Free/Plus/Pro), thanh toán qua PayOS, xử lý deep-link kết quả thanh toán |
| **Thông báo đẩy** | Nhận push notification (Firebase Cloud Messaging) |
| **Lịch sử trò chuyện** | Xem lại các phiên chat trước đó theo nhân vật |
| **Hồ sơ cá nhân** | Cập nhật thông tin, đổi mật khẩu, upload avatar |

## Công nghệ sử dụng

| Layer | Công nghệ |
|---|---|
| Framework | React Native 0.85 + Expo SDK 56 (bare workflow, có thư mục `android/` native) |
| Điều hướng | Expo Router (file-based routing, typed routes) |
| Ngôn ngữ | TypeScript |
| State server (API) | TanStack Query v5 |
| State client | Zustand |
| Form | React Hook Form + Zod resolver |
| UI Kit | Gluestack UI + NativeWind (Tailwind cho React Native) |
| Icon | lucide-react-native |
| Animation | React Native Reanimated 4 + Worklets |
| Speech-to-Text / Text-to-Speech | `@react-native-voice/voice`, Azure Speech SDK, `expo-speech` |
| Ảnh & media | `expo-image`, `expo-image-picker`, `expo-video` |
| Lưu trữ cục bộ | `expo-secure-store` (token nhạy cảm), `AsyncStorage` (cache thường) |
| Push notification | `expo-notifications` |
| Home-screen widget | `react-native-android-widget` |
| React Compiler | Bật (`experiments.reactCompiler` trong `app.json`) |

## Cấu trúc dự án

> Routes chỉ khai báo đường dẫn (khai báo, không chứa logic) — màn hình thật nằm ở `screens/` để tái sử dụng độc lập với router.

```
src/
├── app/          # Route của expo-router — CHỈ re-export, không chứa logic
│   ├── _layout.tsx      # Providers + auth gate + <Slot/>
│   ├── (auth)/           # Nhóm route chưa đăng nhập: login, register (Stack)
│   └── (app)/            # Nhóm route đã đăng nhập: toàn bộ màn hình chính (AppTabs)
├── screens/      # Cài đặt màn hình thật, nhóm theo domain (auth, home, chat, quiz...)
├── features/     # Tầng dữ liệu theo domain: api.ts, hooks/, types.ts, store.ts, schemas.ts
├── components/   # UI dùng chung (components/ui = Gluestack design system, cards/...)
├── providers/    # app-providers.tsx (Gluestack + Query + Theme), use-protected-route.ts
├── hooks/        # Hook dùng toàn app (use-theme, use-color-scheme)
├── lib/          # Hạ tầng: api-client, query-client, secure-storage, azure-speech
├── widgets/       # Home-screen widget Android (streak-widget, đồng bộ dữ liệu)
└── constants/     # palette, theme
```

**Quy tắc bắt buộc** (xem thêm `AGENTS.md`):
- File trong `src/app/` chỉ được chứa `export { default } from '@/screens/...'` (ngoại lệ: `_layout.tsx`). Logic màn hình luôn nằm ở `src/screens/`.
- Route group `(auth)`/`(app)` **không** ảnh hưởng URL — `/chat/[sessionId]` giữ nguyên dù nằm trong group nào. Logic redirect theo trạng thái đăng nhập nằm ở `src/providers/use-protected-route.ts`.
- Server state (dữ liệu từ API) luôn đi qua TanStack Query hook trong `src/features/<domain>/`, không fetch trực tiếp trong screen.
- Import luôn dùng alias `@/`, không dùng đường dẫn tương đối sâu (`../../`).

## Bắt đầu nhanh

### Yêu cầu

- Node.js ≥ 18
- Android Studio (kèm 1 AVD đã tạo) và/hoặc Xcode (macOS, cho iOS)
- [`wdp301-backend`](../wdp301-backend) đang chạy (local hoặc trỏ tới server có sẵn)

### Cài đặt

```bash
git clone <repo-url>
cd mobile-historytalk
npm install
```

`postinstall` sẽ tự chạy `scripts/patch-voice.js` để vá thư viện `@react-native-voice/voice`.

### Cấu hình môi trường

```bash
cp .env.example .env
```

Điền các giá trị cần thiết — xem [Biến môi trường](#biến-môi-trường). **Đặc biệt lưu ý `EXPO_PUBLIC_API_URL`** phải đúng theo nền tảng đang chạy (xem bảng bên dưới), nếu không app sẽ không gọi được backend.

### Chạy dự án

```bash
npx expo start
```

Trong output sẽ có tuỳ chọn mở bằng development build, Android emulator, iOS simulator, hoặc Expo Go.

## Biến môi trường

Tất cả biến phía client phải có tiền tố `EXPO_PUBLIC_` (quy ước của Expo — biến không có tiền tố này sẽ không được inject vào bundle).

| Biến | Bắt buộc | Mô tả |
|---|:---:|---|
| `EXPO_PUBLIC_API_URL` | ✅ | Base URL của backend, xem bảng địa chỉ theo nền tảng bên dưới |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | ✅ | Web Client ID cho Google Sign-In |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | | Android Client ID (build native, không cần cho Expo Go) |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | | iOS Client ID |
| `EXPO_PUBLIC_AZURE_SPEECH_KEY` / `EXPO_PUBLIC_AZURE_SPEECH_REGION` / `EXPO_PUBLIC_AZURE_SPEECH_VOICE` | | Cấu hình Azure Speech cho Text-to-Speech |

**`EXPO_PUBLIC_API_URL` theo nền tảng chạy:**

| Nền tảng | Giá trị |
|---|---|
| Android Emulator (mặc định) | `http://10.0.2.2:5000/api/v1` |
| Android Emulator (khi 10.0.2.2 không ổn định — xem [Vấn đề đã biết](#vấn-đề-đã-biết)) | `http://127.0.0.1:5000/api/v1` + `adb reverse tcp:5000 tcp:5000` |
| iOS Simulator | `http://localhost:5000/api/v1` |
| Thiết bị thật (cùng mạng LAN) | `http://<ip-máy-chạy-backend>:5000/api/v1` |

> ⚠️ `EXPO_PUBLIC_*` được nhúng vào JS bundle **tại thời điểm Metro build**, không phải lúc app chạy. Đổi `.env` xong **phải khởi động lại `expo start`** (khuyến khích kèm `--clear` để xoá cache Metro) — chỉ reload/refresh app trong lúc Metro cũ vẫn chạy sẽ **không** thấy giá trị mới.

## Chạy trên từng nền tảng

```bash
npm run android   # expo run:android — build & cài native lần đầu
npm run ios       # expo run:ios
npm run web       # expo start --web
```

Sau lần build native đầu tiên, dùng `npx expo start` cho các lần chạy sau (nhanh hơn nhiều vì không rebuild native).

### Android Emulator trên máy Windows (lưu ý riêng)

Script `npm run android:launch` xử lý sẵn vấn đề routing mặc định của emulator (xem chi tiết ở mục dưới):

```bash
emulator -avd <tên-avd> -allow-host-audio   # -allow-host-audio để mic hoạt động
npx expo start
npm run android:launch                      # tunnel port 8081 qua `adb reverse`, mở app trỏ 127.0.0.1
```

## Scripts

| Lệnh | Mô tả |
|---|---|
| `npm start` | Chạy Metro dev server (`expo start`) |
| `npm run android` | Build & chạy trên Android (native, lần đầu hoặc sau khi đổi native code) |
| `npm run android:launch` | Tunnel port 8081 qua `adb reverse` + mở lại app trỏ `127.0.0.1` (khắc phục lỗi mạng emulator) |
| `npm run ios` | Build & chạy trên iOS |
| `npm run web` | Chạy bản web (`expo start --web`) |
| `npm run lint` | Lint bằng `expo lint` |
| `npm run reset-project` | Chuyển code mẫu sang `app-example/`, tạo `app/` trống để bắt đầu lại từ đầu |

## Quy ước code

- **Không** viết logic trong `src/app/*.tsx` — chỉ re-export từ `src/screens/`.
- **Không** fetch dữ liệu trực tiếp trong component — luôn qua hook TanStack Query trong `src/features/<domain>/hooks/`.
- **Không** dùng import tương đối sâu — luôn dùng alias `@/`.
- Kiểm tra kỹ tài liệu Expo phiên bản đang dùng tại [docs.expo.dev/versions/v56.0.0](https://docs.expo.dev/versions/v56.0.0/) trước khi viết code liên quan API native — SDK 56 có nhiều thay đổi so với bản cũ hơn.

## Widget màn hình chính (Android)

App có 1 widget Android (`react-native-android-widget`) tên **Streak**, hiển thị chuỗi ngày học hiện tại + một nhân vật lịch sử ngẫu nhiên, tự làm mới mỗi 30 phút (`updatePeriodMillis`). Logic nằm ở `src/widgets/`:

| File | Vai trò |
|---|---|
| `streak-widget.tsx` | Giao diện widget |
| `widget-cache.tsx` | Cache dữ liệu hiển thị để widget vẫn có nội dung khi offline |
| `widget-sync.tsx` | Đồng bộ dữ liệu mới nhất từ app vào widget |
| `widget-task-handler.tsx` | Task handler xử lý vòng đời widget (Android) |

## Vấn đề đã biết

### Android Emulator: bundle JS bị lỗi ngẫu nhiên trên máy dev

Trên một số máy, đường route mặc định của emulator tới máy host (`10.0.2.2`, qua NAT SLIRP của QEMU) làm hỏng các response HTTP lớn. Triệu chứng: app đứng ở splash screen, hoặc màn hình đỏ báo lỗi kiểu `Compiling JS failed: <offset>:<col>:Invalid UTF-8 ...` hay `Requiring unknown module "<id>"` — offset/module id khác nhau mỗi lần tải, xảy ra ở **mọi** lần load. Đây **không phải** lỗi cache hay lỗi build (đã xác nhận bằng cách xoá sạch cache Metro/Expo và cài lại app từ đầu — vẫn tái hiện). Nguyên nhân nằm ở tầng network SLIRP, ngoài phạm vi sửa được trong code project.

Emulator cũng mặc định tắt tiếng micro — `@react-native-voice/voice` sẽ luôn trả về `7/No match` bất kể nói gì nếu không bật `-allow-host-audio`.

**Cách khắc phục, áp dụng mỗi lần khởi động lại emulator:**

```bash
emulator -avd <tên-avd> -allow-host-audio
npx expo start
npm run android:launch   # tunnel port 8081 qua `adb reverse` (né SLIRP)
                          # và mở app trỏ 127.0.0.1 thay vì 10.0.2.2 mặc định
```

Xem chi tiết trong `scripts/launch-android-emulator.js`. Việc set system property `metro.host` (cách chính thức React Native khuyến nghị) **không** hoạt động trên system image của AVD này — `adb shell setprop` bị SELinux chặn (cùng giới hạn khiến `adb root` không dùng được) — nên phải xử lý qua `adb reverse` + URL khởi động tường minh thay vì set property.

> **Lưu ý quan trọng khi đổi `.env` trên Android Emulator:** chỉ chạy lại `expo start --clear` + `android:launch` là **chưa đủ** nếu app đang chạy sẵn — app có thể chỉ "resume" (`onHostResume`) context JS cũ đang mở dở, vẫn trỏ `10.0.2.2` từ trước, thay vì tải lại bundle mới. Phải **force-stop app hẳn** (`adb shell am force-stop <package>`) trước khi chạy lại `android:launch`, để đảm bảo app cold-start và đọc đúng biến môi trường mới.

## Build & Release

Project hiện chưa cấu hình EAS Build (`eas.json`). Để build bản release:

- **Android**: build qua Android Studio / Gradle trong thư mục `android/` (bare workflow, native project có sẵn), hoặc thiết lập [EAS Build](https://docs.expo.dev/build/introduction/) nếu muốn build trên cloud.
- **iOS**: build qua Xcode, hoặc EAS Build.

Khi thiết lập CI/CD, nhớ khai báo đầy đủ các biến `EXPO_PUBLIC_*` ở mục [Biến môi trường](#biến-môi-trường) trong secrets của pipeline — thiếu biến nào, tính năng tương ứng sẽ âm thầm không hoạt động (không có lỗi build).

---

<div align="center">

Một phần của hệ sinh thái **HistoryTalk** — cùng với [`wdp301-backend`](../wdp301-backend) (API) và [`HistoryTalk-FE`](../HistoryTalk-FE) (web).

</div>
