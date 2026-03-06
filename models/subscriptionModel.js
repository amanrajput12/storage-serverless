import { model, Schema } from "mongoose";

const SubscriptionModel = new Schema(
  {
    razorpaySubscripitonId: {
      type: String,
      required: true,
    },
   
    userId: {
      type: Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    status:{
        type:String,
        enum:["created","pending","paused","canceled","active","in_glace","past_due"],
        default:"created"
    }
 ,
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

const Subscription = model("Subscription", SubscriptionModel);

export default Subscription;
