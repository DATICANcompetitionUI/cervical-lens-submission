import type * as ortType from "onnxruntime-node";
import { Jimp } from "jimp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const __dir = dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(
  readFileSync(join(__dir, "imaging_metrics.json"), "utf8"),
) as {
  class_names: string[];
  input_normalization: { mean: number[]; std: number[] };
  onnx_metrics: Record<string, number>;
};

const SIZE = 224;
let ort: typeof import("onnxruntime-node") | null = null;
let session: ortType.InferenceSession | null = null;

async function loadOrt(): Promise<typeof import("onnxruntime-node")> {
  if (!ort) {
    try {
      ort = require("onnxruntime-node");
    } catch (err) {
      console.error("Failed to dynamically import onnxruntime-node:", err);
      throw new Error(
        "Machine learning module not available (native libraries failed to load). Details: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }
  return ort;
}

async function getSession(): Promise<ortType.InferenceSession> {
  const ortInstance = await loadOrt();
  if (!session) {
    session = await ortInstance.InferenceSession.create(
      join(__dir, "cervicallens_edge.onnx"),
    );
  }
  return session;
}

/** Decode + resize + normalize an image buffer into a [1,3,224,224] tensor. */
async function toTensor(image: Buffer): Promise<ortType.Tensor> {
  const ortInstance = await loadOrt();
  const img = await Jimp.read(image);
  img.resize({ w: SIZE, h: SIZE });
  const { data } = img.bitmap; // RGBA, length SIZE*SIZE*4
  const { mean, std } = meta.input_normalization;

  const out = new Float32Array(3 * SIZE * SIZE);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const p = (y * SIZE + x) * 4;
      for (let c = 0; c < 3; c++) {
        const v = data[p + c] / 255;
        out[c * SIZE * SIZE + y * SIZE + x] = (v - mean[c]) / std[c];
      }
    }
  }
  return new ortInstance.Tensor("float32", out, [1, 3, SIZE, SIZE]);
}

function softmax(logits: Float32Array): number[] {
  const m = Math.max(...logits);
  const e = Array.from(logits, (v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export interface CytologyResult {
  label: string; // "NILM" | "Abnormal"
  abnormal_probability: number;
  probabilities: Record<string, number>;
  model: string;
}

/** Screen a cervical cytology image. */
export async function predictCytology(image: Buffer): Promise<CytologyResult> {
  const sess = await getSession();
  const input = await toTensor(image);
  const output = await sess.run({ [sess.inputNames[0]]: input });
  const logits = output[sess.outputNames[0]].data as Float32Array;
  const probs = softmax(logits);
  const classes = meta.class_names; // ["NILM", "Abnormal"]
  const idx = probs.indexOf(Math.max(...probs));
  const abnIdx = classes.indexOf("Abnormal");
  return {
    label: classes[idx],
    abnormal_probability: Number(probs[abnIdx].toFixed(4)),
    probabilities: Object.fromEntries(
      classes.map((c, i) => [c, Number(probs[i].toFixed(4))]),
    ),
    model: "cervicallens_edge (MobileNetV3-Small, distilled)",
  };
}

export function cytologyModelInfo() {
  return {
    model: "cervicallens_edge",
    task: "Cervical cytology screening (NILM vs Abnormal)",
    classes: meta.class_names,
    test_metrics: meta.onnx_metrics,
    input: `${SIZE}x${SIZE} RGB`,
    disclaimer:
      "High-sensitivity screening model (research use only, not a clinical device).",
  };
}
