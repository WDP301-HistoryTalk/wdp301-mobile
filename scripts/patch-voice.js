const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../node_modules/@react-native-voice/voice/android/build.gradle');

if (fs.existsSync(targetPath)) {
  let content = fs.readFileSync(targetPath, 'utf8');
  if (content.includes('jcenter()')) {
    console.log('Patching @react-native-voice/voice/android/build.gradle: replacing jcenter() with mavenCentral()');
    content = content.replace(/jcenter\(\)/g, 'mavenCentral()');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log('Successfully patched!');
  } else {
    console.log('@react-native-voice/voice/android/build.gradle is already patched or does not contain jcenter()');
  }
} else {
  console.log('@react-native-voice/voice/android/build.gradle not found. Run npm install first.');
}

// @react-native/gradle-plugin pins foojay-resolver-convention 0.5.0, which references
// JvmVendorSpec.IBM_SEMERU — removed in Gradle 9.x. Bump to 1.0.0 (upstream fix:
// facebook/react-native#54160) so `gradlew` doesn't fail with
// "does not have member field 'org.gradle.jvm.toolchain.JvmVendorSpec IBM_SEMERU'".
const foojayTargetPath = path.join(__dirname, '../node_modules/@react-native/gradle-plugin/settings.gradle.kts');

if (fs.existsSync(foojayTargetPath)) {
  let content = fs.readFileSync(foojayTargetPath, 'utf8');
  if (content.includes('foojay-resolver-convention").version("0.5.0")')) {
    console.log('Patching @react-native/gradle-plugin/settings.gradle.kts: bumping foojay-resolver-convention to 1.0.0');
    content = content.replace(
      'foojay-resolver-convention").version("0.5.0")',
      'foojay-resolver-convention").version("1.0.0")'
    );
    fs.writeFileSync(foojayTargetPath, content, 'utf8');
    console.log('Successfully patched!');
  } else {
    console.log('@react-native/gradle-plugin/settings.gradle.kts is already patched or does not contain foojay-resolver-convention 0.5.0');
  }
} else {
  console.log('@react-native/gradle-plugin/settings.gradle.kts not found. Run npm install first.');
}

// @react-native-voice/voice's dist/index.js reads NativeModules.Voice at import time,
// but the Android native module actually registers itself as "RCTVoice" (see
// VoiceModule.java#getName()). Without this, every method call the library makes
// (isSpeechAvailable, startSpeech, ...) throws "Cannot read property of null".
const voiceIndexPath = path.join(__dirname, '../node_modules/@react-native-voice/voice/dist/index.js');

if (fs.existsSync(voiceIndexPath)) {
  let content = fs.readFileSync(voiceIndexPath, 'utf8');
  if (content.includes('const Voice = react_native_1.NativeModules.Voice;')) {
    console.log('Patching @react-native-voice/voice/dist/index.js: falling back to NativeModules.RCTVoice');
    content = content.replace(
      'const Voice = react_native_1.NativeModules.Voice;',
      'const Voice = react_native_1.NativeModules.Voice ?? react_native_1.NativeModules.RCTVoice;'
    );
    fs.writeFileSync(voiceIndexPath, content, 'utf8');
    console.log('Successfully patched!');
  } else {
    console.log('@react-native-voice/voice/dist/index.js is already patched or has a different shape.');
  }
} else {
  console.log('@react-native-voice/voice/dist/index.js not found. Run npm install first.');
}
