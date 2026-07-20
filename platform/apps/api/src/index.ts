import { app } from "./app.js";

const port = Number(process.env.PORT) || 8000;
console.log(`CervicalLens API running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
