import Razorpay from "razorpay";
import Subscription from "../models/subscriptionModel.js";

const rzpInstance = new Razorpay({
    key_id:process.env.KEY_ID,
    key_secret:process.env.KEY_SECRET
});


export const createSubscription =async(req,res)=>{
try {
    
        console.log(req.body);
        console.log(req.user)
        const newsubscription = await rzpInstance.subscriptions.create({
            plan_id:req.body.planId,
            total_count:120,
            notes:{
                userId:req.user._id
            }
        })
    
    

            // Save in database
    const subscriptionDoc = await Subscription.create({
      razorpaySubscripitonId: newsubscription.id,
      userId: req.user._id,
      status: newsubscription.status, // usually "created"
    });

    res.json({
      subscriptionId: newsubscription.id,
      dbSubscription: subscriptionDoc,
    });

} catch (error) {
    console.log("error on create subscription",error)
}

}