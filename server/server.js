import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';
import Course from './models/Course.js';
import mongoose from 'mongoose';

const app = express();

await connectDB()
await connectCloudinary()

// Auto-seed database with sample courses if empty
const seedDatabaseIfEmpty = async () => {
  try {
    const courseCount = await Course.countDocuments();

    if (courseCount === 0) {
      console.log('Database is empty. Seeding with sample courses...');

      const educatorId = new mongoose.Types.ObjectId().toString();

      const sampleCourses = [
        {
          courseTitle: "Complete Web Development Bootcamp",
          courseDescription:
            "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack developer.",
          courseThumbnail:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
          coursePrice: 49.99,
          discount: 0,
          educator: educatorId,

          courseContent: [
            {
              chapterId: "ch1",
              chapterOrder: 1,
              chapterTitle: "Introduction to Web Development",

              chapterContent: [
                {
                  lectureId: "lec1",
                  lectureOrder: 1,
                  lectureTitle: "Welcome to the Course",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 10,
                  isPreviewFree: 1
                },

                {
                  lectureId: "lec2",
                  lectureOrder: 2,
                  lectureTitle:
                    "Setting Up Your Development Environment",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 15,
                  isPreviewFree: 0
                }
              ]
            },

            {
              chapterId: "ch2",
              chapterOrder: 2,
              chapterTitle: "HTML Fundamentals",

              chapterContent: [
                {
                  lectureId: "lec3",
                  lectureOrder: 1,
                  lectureTitle: "HTML Basics",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 20,
                  isPreviewFree: 0
                },

                {
                  lectureId: "lec4",
                  lectureOrder: 2,
                  lectureTitle: "HTML Forms and Tables",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 25,
                  isPreviewFree: 0
                }
              ]
            }
          ],

          courseRatings: [
            {
              userId: new mongoose.Types.ObjectId().toString(),
              rating: 5
            },

            {
              userId: new mongoose.Types.ObjectId().toString(),
              rating: 4
            }
          ]
        },

        {
          courseTitle: "Python for Data Science",

          courseDescription:
            "Master Python programming and data analysis with NumPy, Pandas, and Matplotlib.",

          courseThumbnail:
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",

          coursePrice: 59.99,
          discount: 10,
          educator: educatorId,

          courseContent: [
            {
              chapterId: "ch1",
              chapterOrder: 1,
              chapterTitle: "Python Basics",

              chapterContent: [
                {
                  lectureId: "lec1",
                  lectureOrder: 1,
                  lectureTitle: "Introduction to Python",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 12,
                  isPreviewFree: 1
                },

                {
                  lectureId: "lec2",
                  lectureOrder: 2,
                  lectureTitle: "Variables and Data Types",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 18,
                  isPreviewFree: 0
                }
              ]
            }
          ],

          courseRatings: [
            {
              userId: new mongoose.Types.ObjectId().toString(),
              rating: 5
            }
          ]
        },

        {
          courseTitle: "UI/UX Design Fundamentals",

          courseDescription:
            "Learn user interface and user experience design principles. Master Figma and create stunning designs.",

          courseThumbnail:
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",

          coursePrice: 44.99,
          discount: 15,
          educator: educatorId,

          courseContent: [
            {
              chapterId: "ch1",
              chapterOrder: 1,
              chapterTitle: "Introduction to UI/UX",

              chapterContent: [
                {
                  lectureId: "lec1",
                  lectureOrder: 1,
                  lectureTitle: "What is UI/UX Design?",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 12,
                  isPreviewFree: 1
                },

                {
                  lectureId: "lec2",
                  lectureOrder: 2,
                  lectureTitle: "Design Thinking Process",
                  lectureUrl:
                    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  lectureDuration: 18,
                  isPreviewFree: 0
                }
              ]
            }
          ],

          courseRatings: [
            {
              userId: new mongoose.Types.ObjectId().toString(),
              rating: 5
            }
          ]
        }
      ];

      await Course.insertMany(sampleCourses);

      console.log(
        `✅ Successfully seeded ${sampleCourses.length} sample courses!`
      );

    } else {
      console.log(`Database already has ${courseCount} courses.`);
    }

  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

await seedDatabaseIfEmpty();

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://edemy-eosin.vercel.app',
  ...(process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : []),
];

// CORS Configuration
app.use(cors({
  origin: (origin, callback) => {

    // Allow requests with no origin
    // (mobile apps, Postman, curl, Stripe webhooks)
    if (!origin) {
      return callback(null, true);
    }

    // Allow whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject unknown origins
    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true
}));

app.use(clerkMiddleware())

// Routes
app.get('/', (req, res) => {
  res.send("API Working")
});

app.post('/clerk', express.json(), clerkWebhooks);

app.use('/api/educator',
  express.json(),
  educatorRouter
);

app.use('/api/course',
  express.json(),
  courseRouter
);

app.use('/api/user',
  express.json(),
  userRouter
);

app.use('/api/cart',
  express.json(),
  cartRouter
);

app.use('/api/admin',
  express.json(),
  adminRouter
);

app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
);

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

