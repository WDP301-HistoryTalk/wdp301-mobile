/**
 * On this machine, the Android emulator's default host route (10.0.2.2, via
 * QEMU's SLIRP NAT) corrupts large HTTP responses -- Metro's JS bundle
 * downloads fail with "Invalid UTF-8 ..." / "Compiling JS failed" errors,
 * reproducibly, on every load. Root cause is upstream of this project (a
 * SLIRP/network-stack issue, not a build or cache problem -- confirmed by
 * wiping every Metro/Expo cache and still reproducing it).
 *
 * Fix: tunnel port 8081 through `adb reverse` (ADB's own transport, not
 * SLIRP) and launch the dev-client pointed at 127.0.0.1 instead of letting
 * it auto-resolve to 10.0.2.2.
 *
 * Usage: node scripts/launch-android-emulator.js
 * Requires: an emulator already booted (adb devices shows it), and
 * `npx expo start` already running on port 8081.
 */
const { execSync } = require('child_process');
const path = require('path');

const PACKAGE_NAME = 'com.anonymous.mobilehistorytalk';
const PORT = 8081;

const adb = process.env.ANDROID_HOME
  ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb.exe')
  : 'adb';

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}

const devices = run(`"${adb}" devices`);
if (!/\bdevice\b/.test(devices.split('\n').slice(1).join('\n'))) {
  console.error('No connected/ready emulator found. Boot one first, then rerun this script.');
  process.exit(1);
}

run(`"${adb}" reverse tcp:${PORT} tcp:${PORT}`);
console.log(`adb reverse tcp:${PORT} tcp:${PORT} — Metro traffic now tunnels via ADB, bypassing the broken SLIRP route.`);

const url = encodeURIComponent(`http://127.0.0.1:${PORT}`);
run(
  `"${adb}" shell am start -n ${PACKAGE_NAME}/.MainActivity -a android.intent.action.VIEW -d "mobilehistorytalk://expo-development-client/?url=${url}"`,
);
console.log('Launched dev client pointed at 127.0.0.1 (not the default 10.0.2.2).');
