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
