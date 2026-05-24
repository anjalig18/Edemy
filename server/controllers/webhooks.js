import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";
import Cart from "../models/Cart.js";

export const clerkWebhooks = async (req, res) => {
  try {
    const Whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
    await Whook.verify(JSON.stringify(req.body), {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"]
    })
    const { data, type } = req.body

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.create(userData)
        res.json({})
        break;
      }
      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        }
        await User.findByIdAndUpdate(data.id, userData)
        res.json({})
        break;
      }
      case 'user.deleted': {
        await User.findByIdAndDelete(data.id)
        res.json({})
        break;
      }
      default:
        res.json({})
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

const stripeInstance = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key_here' 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

export const stripeWebhooks = async (request, response) => {
  if (!stripeInstance) {
    return response.status(503).json({ error: 'Stripe not configured' });
  }
  const sig = request.headers['stripe-signature'];

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    response.status(400).send(`Webhook Error ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId })
      const metadata = session.data[0].metadata;

      if (metadata.cartCheckout === 'true') {
        // Cart checkout
        const userId = metadata.userId;
        const courseIds = metadata.courseIds.split(',');
        const userData = await User.findById(userId);

        for (const courseId of courseIds) {
          const courseData = await Course.findById(courseId);
          if (courseData && !userData.enrolledCourses.map(id => id.toString()).includes(courseId)) {
            // Create a Purchase record for each course so educator earnings are tracked
            await Purchase.create({
              courseId: courseData._id,
              userId,
              amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
              status: 'completed'
            });
            courseData.enrolledStudents.push(userId);
            await courseData.save();
            userData.enrolledCourses.push(courseId);
          }
        }

        await userData.save();
        // Clear cart after successful purchase
        await Cart.findOneAndUpdate({ userId }, { items: [] });

      } else {
        // Single course purchase
        const { purchaseId } = metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(purchaseData.userId);
        const courseData = await Course.findById(purchaseData.courseId.toString());

        // Guard against duplicate enrollment
        if (!userData.enrolledCourses.map(id => id.toString()).includes(courseData._id.toString())) {
          courseData.enrolledStudents.push(userData._id);
          await courseData.save();
          userData.enrolledCourses.push(courseData._id);
          await userData.save();
        }

        purchaseData.status = 'completed';
        await purchaseData.save();
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId })
      const { purchaseId } = session.data[0].metadata;

      // Only update status if it was a single-course purchase (has purchaseId)
      if (purchaseId) {
        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          purchaseData.status = 'failed';
          await purchaseData.save();
        }
      }
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.json({ received: true });
}
