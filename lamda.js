import './config/env.js';
import serverless from "serverless-http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
await connectDB();
const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// ✅ Lambda → use serverless handler
export const handler = isLambda ? serverless(app) : undefined;

// ✅ Local run → start server
if (!isLambda) {
  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}