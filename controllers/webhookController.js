import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";
import User from "../models/userModel.js";
const PLANS ={
    "plan_SNhSGBTLMOkm3p":{
        storageQuotaBytes:1*1024**3
    },
    "plan_SNhTGloisjC2Bm":{
        storageQuotaBytes:1*1024**3
    },
    "plan_SNx0Sfs0TALnYr":{
        storageQuotaBytes:2*1024**3
    },
    "plan_SNx1HYOA7O01Gm":{
        storageQuotaBytes:2*1024**3
    },
    "plan_SNx1zRHUI51P0B":{
        storageQuotaBytes:5*1024**3
    },
    "lan_SNx2ZKhcaNZqso":{
        storageQuotaBytes:5*1024**3
    }
}

export const handleRazorpayhook = async(req,res)=>{
    try {
        const signature = req.headers["x-razorpay-signature"];
      const issignaurevalid =  Razorpay.validateWebhookSignature(JSON.stringify(req.body),signature,process.env.RAZORPAY_WEBHOOK_SECRET)

        if(issignaurevalid){
           console.log("singaure valid",req.body.payload.subscription)

        if(req.body.event == 'subscription.activated'){
            const rzpSubscription =req.body.payload.subscription.entity;

            const planId = rzpSubscription.plan_id;
          const subscription = await  Subscription.findOne({razorpaySubscripitonId:rzpSubscription.id});

          subscription.status =rzpSubscription.status;

          await subscription.save();

          const storageQuotaBytes = PLANS[planId].storageQuotaBytes;

          const user = await User.findById(subscription.userId);

          user.maxStorageInBytes= storageQuotaBytes

          await user.save()
            console.log("subscription activated",planId);
        }
        }
        else{
            console.log(
                "invalid signature",
            )
        }
        console.log("webhoook called",req.body)
        res.end("Ok")

    } catch (error) {
        
    }
}