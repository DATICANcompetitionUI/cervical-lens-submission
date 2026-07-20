const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

function patchFile(relativeFilePath, targetString, replacementString) {
  const filePath = path.join(rootDir, relativeFilePath);
  if (!fs.existsSync(filePath)) {
    console.log(`[Patch] File not found: ${relativeFilePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(targetString)) {
    content = content.replace(targetString, replacementString);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[Patch] Successfully patched ${relativeFilePath}`);
  } else if (content.includes(replacementString)) {
    console.log(`[Patch] Already patched: ${relativeFilePath}`);
  } else {
    console.log(`[Patch] Warning: Target string not found in ${relativeFilePath}`);
  }
}

// Patch 1: Fix VersionNumber issue in onnxruntime-react-native
patchFile(
  'node_modules/onnxruntime-react-native/android/build.gradle',
  '  if (VersionNumber.parse(REACT_NATIVE_VERSION) < VersionNumber.parse("0.71")) {',
  '  // React Native version is >= 0.71\n  if (false) {'
);

// Patch 2: Move maven-publish plugin application to applyPublishing in expo-module-gradle-plugin
const projConfigPath = 'node_modules/expo-modules-core/expo-module-gradle-plugin/src/main/kotlin/expo/modules/plugin/ProjectConfiguration.kt';

// Remove from applyDefaultPlugins
const targetDefaultPlugins = `internal fun Project.applyDefaultPlugins() {
  if (!plugins.hasPlugin("com.android.library")) {
    plugins.apply("com.android.library")
  }
  if (!plugins.hasPlugin("kotlin-android")) {
    plugins.apply("kotlin-android")
  }
  if (!plugins.hasPlugin("maven-publish")) {
    plugins.apply("maven-publish")
  }
}`;

const replacementDefaultPlugins = `internal fun Project.applyDefaultPlugins() {
  if (!plugins.hasPlugin("com.android.library")) {
    plugins.apply("com.android.library")
  }
  if (!plugins.hasPlugin("kotlin-android")) {
    plugins.apply("kotlin-android")
  }
}`;

patchFile(projConfigPath, targetDefaultPlugins, replacementDefaultPlugins);

// Add to applyPublishing
const targetApplyPublishing = `internal fun Project.applyPublishing(expoModulesExtension: ExpoModuleExtension) {
  if (!expoModulesExtension.canBePublished) {
    createEmptyExpoPublishTask()
    createEmptyExpoPublishToMavenLocalTask()
    return
  }

  val libraryExtension = androidLibraryExtension()`;

const replacementApplyPublishing = `internal fun Project.applyPublishing(expoModulesExtension: ExpoModuleExtension) {
  if (!expoModulesExtension.canBePublished) {
    createEmptyExpoPublishTask()
    createEmptyExpoPublishToMavenLocalTask()
    return
  }

  if (!plugins.hasPlugin("maven-publish")) {
    plugins.apply("maven-publish")
  }

  val libraryExtension = androidLibraryExtension()`;

patchFile(projConfigPath, targetApplyPublishing, replacementApplyPublishing);
