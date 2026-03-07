

import {spawn} from "child_process"
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import directoryRoutes from "./routes/directoryRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import checkAuth from "./middlewares/authMiddleware.js";
import SubscriptionRoutes from "./routes/subscriptionRoutes.js"
import WebhookRoute from "./routes/webhookRoutes.js"
import crypto from"crypto"




const PORT = process.env.PORT;
console.log("Server starting on port", PORT,process.env.CLOUDFRONT_PRIVATE_KEY );


const app = express();
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());



// read allowed origins from env

const allowedOrigins = [
  process.env.CLIENT_URL_1,
  process.env.CLIENT_URL_2,
  process.env.CLIENT_URL_3
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true   // ⭐ VERY IMPORTANT
}));
  

// automate route


// app.use(cors({
//   origin: "http://localhost:5173",
//   credentials: true
// }))

app.post("/github-webhook", (req, res) => {
  const givensignature = req.headers["x-hub-signature-256"];

  if(!givensignature){
  return res.status(403).json({error:"Invalid signature"})
  }
    const calcualtedsingature= 'sha256='+ crypto.createHmac("sha256","Aman@123").update(JSON.stringify(req.body)).digest("hex");
    console.log("calculated signture",calcualtedsingature)
    if(givensignature!==calcualtedsingature){
      return res.status(403).json({error:"Invalid signature"})
    }
   res.json({ message: "Deploy successful" });
  console.log("webhook", req.headers);

 let bashchildprocess
       if(req.body.repository.name=="Automate-CI-CD"){
   bashchildprocess = spawn("bash", [
    "/home/ubuntu/Automate-CI-CD/deploy-frontend.sh"
  ]);
}
else{
  bashchildprocess =spawn("bash",[
     "/home/ubuntu/storageapp-backend/deploy-backend.sh"
  ])
}


  bashchildprocess.stdout.on("data", (data) => {
    console.log("stdout:", data.toString());
  });

  bashchildprocess.stderr.on("data", (data) => {
    console.error("stderr:", data.toString());
  });

  bashchildprocess.on("error", (err) => {
    console.error("Process error:", err);
    return res.status(500).json({ error: "Script failed to start" });
  });

  bashchildprocess.on("close", (code) => {
    console.log("Exit code:", code);

    if (code === 0) {
    
    } else {
      return res.status(500).json({ message: "Deploy failed" });
    }
  });
});



app.get("/",(req,res)=>{
res.json({message:"Hello Aman Rajput this side test 2"})

}
);
app.use("/directory", checkAuth, directoryRoutes);
app.use("/file", checkAuth, fileRoutes);
app.use("/", userRoutes);
app.use("/auth", authRoutes);
app.use("/subscription",checkAuth,SubscriptionRoutes)
app.use("/webhook",WebhookRoute)


app.use((err, req, res, next) => {
  console.log(err);
  // res.status(err.status || 500).json({ error: "Something went wrong!" });
  res.json(err);
});




export default app;


// https://stackoverflow.com/questions/18367824/how-to-cancel-http-upload-from-data-events
