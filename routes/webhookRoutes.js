import express from "express";

import { handleRazorpayhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post('/razorpay',handleRazorpayhook)


export default router;

