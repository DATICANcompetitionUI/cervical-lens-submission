/**
 * Specimen capture — camera capture + cytology screening.
 *
 * Sends the captured image to POST /cytology/screen (the same
 * cervicallens_edge.onnx model, run server-side via onnxruntime-node — see
 * platform/apps/api/src/ml/cytology.ts). This is the verifiable, working path
 * today.
 *
 * On-device inference (onnxruntime-react-native, already a dependency) is the
 * documented next step for true offline/edge screening — it needs a real
 * device to build and validate the camera-frame -> tensor preprocessing
 * pipeline, which isn't something that can be verified without hardware.
 */
import { useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { screenCytology } from "../api/client";

export default function CaptureScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [capturing, setCapturing] = useState(false);
  const [torch, setTorch] = useState(false);

  if (!permission) return <View style={styles.screen} />;
  if (!permission.granted) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.permissionText}>Camera access is needed to capture specimens.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (!photo?.uri) throw new Error("Capture failed");

      // Downscale to keep the upload small; the API resizes to 224x224 anyway.
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 512 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG }
      );
      if (!manipulated.base64) throw new Error("Could not encode image");

      const result = await screenCytology(`data:image/jpeg;base64,${manipulated.base64}`);
      navigation.navigate("ScreeningResult", { result, imageUri: photo.uri });
    } catch (e) {
      Alert.alert("Screening failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <CameraView ref={cameraRef} style={styles.camera} enableTorch={torch} facing="back">
        <View style={styles.frameGuide} />
      </CameraView>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.torchButton} onPress={() => setTorch((v) => !v)}>
          <Text style={styles.torchText}>{torch ? "Torch On" : "Torch Off"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureButton} onPress={capture} disabled={capturing}>
          {capturing ? <ActivityIndicator color={colors.onPrimary} /> : <View style={styles.captureInner} />}
        </TouchableOpacity>
        <View style={{ width: 80 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.midnight },
  center: { alignItems: "center", justifyContent: "center", padding: spacing.margin },
  permissionText: { ...t.body, color: colors.onSurface, textAlign: "center", marginBottom: spacing.md },
  camera: { flex: 1, alignItems: "center", justifyContent: "center" },
  frameGuide: {
    width: "70%",
    height: "45%",
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    borderRadius: radius.card,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.gutter,
    paddingVertical: spacing.md,
    backgroundColor: colors.midnight,
  },
  torchButton: { width: 80 },
  torchText: { color: colors.fog, ...t.caption },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.onPrimary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.gutter,
  },
  primaryButtonText: { color: colors.onPrimary, ...t.subheading },
});
