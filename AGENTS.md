# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

# Android emulator: corrupted JS bundle loads (this machine)

On this dev machine, the Android emulator's default host route (`10.0.2.2`,
via QEMU's SLIRP NAT) corrupts large HTTP responses. Symptom: the app gets
stuck on the splash screen or shows a red error screen with
`Compiling JS failed: <offset>:<col>:Invalid UTF-8 ...` or
`Requiring unknown module "<id>"` — a different byte offset/module id each
time, on literally every load. This is NOT a cache or build problem (confirmed
by wiping every Metro/Expo cache and reinstalling the app from scratch — still
reproduces). It's in-transit corruption on the SLIRP path.

Also: the emulator zeroes out microphone input by default. Boot it with
`-allow-host-audio`, or `@react-native-voice/voice` will always return
`7/No match` regardless of what you say.

**Fix, every time you boot the emulator fresh:**
```bash
emulator -avd <name> -allow-host-audio
npx expo start
npm run android:launch   # tunnels port 8081 via `adb reverse` (bypasses SLIRP)
                          # and launches the app pointed at 127.0.0.1 instead
                          # of the default 10.0.2.2
```
`scripts/launch-android-emulator.js` has the details. Setting the `metro.host`
system property (react-native's official override for this) does NOT work on
this AVD's system image — `adb shell setprop` is rejected by SELinux (same
restriction that blocks `adb root` on this image) — so this has to be done via
`adb reverse` + an explicit launch URL instead.
