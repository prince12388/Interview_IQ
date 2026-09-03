import dotenv from "dotenv"
dotenv.config()
import Rajorpay from "razorpay"

const razorpay = new Rajorpay({
    key_id: process.env.RAJORPAY_KEY_ID,
    key_secret: process.env.RAJORPAY_KEY_SECRET,
});

export default razorpay