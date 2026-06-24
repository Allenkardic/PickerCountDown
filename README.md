# PickerCountDownCard

An Expo app that displays a fantasy draft pick countdown card synced to server time.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Implementation

The pick countdown UI is rendered on the **Home** tab (first tab in the app).

| What | File path |
| --- | --- |
| Screen (Home tab) | [`app/(tabs)/index.tsx`](app/(tabs)/index.tsx) |
| Tab layout (Home / Explore) | [`app/(tabs)/_layout.tsx`](app/(tabs)/_layout.tsx) |
| Countdown card component | [`components/PickerCountDown.tsx`](components/PickerCountDown.tsx) |
| Mock API, types & countdown helpers | [`constants/CountDownInterfaces.ts`](constants/CountDownInterfaces.ts) |

### What each file does

- **`app/(tabs)/index.tsx`** — Home screen. Renders `<PickerCountDown />` below the welcome header.
- **`components/PickerCountDown.tsx`** — Main UI: fetch loading/error/success, active/warning/expired countdown states, server-time sync, and the **Start** button to reset after a cycle ends.
- **`constants/CountDownInterfaces.ts`** — Mock `fetchPickState()` API (~500ms delay), pick/deadline types, and helpers for server offset, remaining time, and countdown formatting (`mm:ss`).

### Release build (Android)

Release APK output:

```
android/app/build/outputs/apk/release/Pickercountdown.apk
```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
