export const config = {
  app: {
    name: "CervicalLens",
    version: "0.1.0",
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
    url: process.env.BETTER_AUTH_URL || "http://localhost:8000",
  },
  database: {
    url: process.env.DATABASE_URL || "",
  },
  storage: {
    backend: (process.env.STORAGE_BACKEND || "local") as "local" | "s3" | "supabase",
    localPath: process.env.LOCAL_STORAGE_PATH || "./storage/slides",
    s3Bucket: process.env.S3_BUCKET_NAME || "cervicallens-slides",
    s3Region: process.env.S3_REGION || "us-east-1",
  },
  ml: {
    modelPath: process.env.MODEL_PATH || "../ml/models/exported/cervicallens_edge.onnx",
    confidenceThreshold: Number(process.env.CONFIDENCE_THRESHOLD) || 0.7,
  },
  cors: {
    origins: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://cervicallens.hallelx2.com",
      "https://cervicallens-web.vercel.app",
      ...(process.env.TRUSTED_ORIGINS ? process.env.TRUSTED_ORIGINS.split(",") : [])
    ],
  },
};
