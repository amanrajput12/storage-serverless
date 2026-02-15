
import './config/env.js';

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import { connectDB } from "./config/db.js";


await connectDB();

const PORT = process.env.PORT;
console.log("Server starting on port", PORT,process.env.CLOUDFRONT_PRIVATE_KEY );


const app = express();
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   })
// );




// read allowed origins from env
const allowedOrigins = [
  process.env.CLIENT_URL_1,
  process.env.CLIENT_URL_2,
  process.env.CLIENT_URL_3
].filter(Boolean) // removes undefined values

var corsOptions = {
  origin: function (origin, callback) {

    // allow requests without origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  }
}

// apply globally (recommended)
app.use(cors(corsOptions))


app.get("/",(req,res)=>{
res.json({message:"Hello Aman"})

}
);
app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  console.log(err);
  // res.status(err.status || 500).json({ error: "Something went wrong!" });
  res.json(err);
});

app.listen(PORT, () => {
  console.log(`Server Started`);
});


// https://stackoverflow.com/questions/18367824/how-to-cancel-http-upload-from-data-events