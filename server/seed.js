import mongoose from 'mongoose';
import Course from './models/Course.js';
import 'dotenv/config';

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    
    if (existingCourses > 0) {
      console.log(`Database already has ${existingCourses} courses. Skipping seed.`);
      process.exit(0);
    }

    const educatorId = new mongoose.Types.ObjectId().toString();

    const sampleCourses = [
      {
        courseTitle: "Complete Web Development Bootcamp",
        courseDescription: "Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB from scratch. Build real-world projects and become a full-stack developer.",
        courseThumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        coursePrice: 49.99,
        discount: 0,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Introduction to Web Development",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Welcome to the Course", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 10, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Setting Up Your Development Environment", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 15, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "HTML Fundamentals",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "HTML Basics", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "HTML Forms and Tables", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 }
        ]
      },
      {
        courseTitle: "Python for Data Science",
        courseDescription: "Master Python programming and data analysis with NumPy, Pandas, and Matplotlib. Perfect for aspiring data scientists.",
        courseThumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800",
        coursePrice: 59.99,
        discount: 10,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Python Basics",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Introduction to Python", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 12, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Variables and Data Types", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Data Analysis with Pandas",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Introduction to Pandas", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 22, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Data Manipulation", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 30, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 }
        ]
      },
      {
        courseTitle: "Digital Marketing Masterclass",
        courseDescription: "Learn SEO, social media marketing, email marketing, and content strategy. Grow your business online.",
        courseThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        coursePrice: 39.99,
        discount: 20,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Introduction to Digital Marketing",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "What is Digital Marketing?", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 15, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Digital Marketing Channels", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "SEO Fundamentals",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Introduction to SEO", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Keyword Research", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 28, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "UI/UX Design Fundamentals",
        courseDescription: "Learn user interface and user experience design principles. Master Figma and create stunning designs.",
        courseThumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
        coursePrice: 44.99,
        discount: 15,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Introduction to UI/UX",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "What is UI/UX Design?", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 12, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Design Thinking Process", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Figma Basics",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Getting Started with Figma", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Creating Your First Design", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 35, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "Machine Learning A-Z",
        courseDescription: "Master Machine Learning algorithms including regression, classification, clustering, and neural networks using Python and scikit-learn.",
        courseThumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
        coursePrice: 69.99,
        discount: 25,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Introduction to Machine Learning",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "What is Machine Learning?", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 15, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Types of Machine Learning", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Regression Algorithms",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Linear Regression", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Polynomial Regression", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 22, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "React Native Mobile Development",
        courseDescription: "Build cross-platform mobile apps for iOS and Android using React Native. Learn navigation, state management, and API integration.",
        courseThumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
        coursePrice: 54.99,
        discount: 10,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Getting Started with React Native",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Introduction to React Native", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 12, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Setting Up Development Environment", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Building Your First App",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Components and Props", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "State Management", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "AWS Cloud Practitioner Certification",
        courseDescription: "Prepare for AWS Cloud Practitioner certification. Learn cloud computing fundamentals, AWS services, security, and pricing.",
        courseThumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
        coursePrice: 49.99,
        discount: 30,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Cloud Computing Basics",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Introduction to Cloud Computing", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 14, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "AWS Global Infrastructure", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 16, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Core AWS Services",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "EC2 and Compute Services", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "S3 and Storage Services", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "Graphic Design Masterclass",
        courseDescription: "Learn Adobe Photoshop, Illustrator, and InDesign. Create logos, branding materials, and stunning visual designs.",
        courseThumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
        coursePrice: 44.99,
        discount: 15,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Design Fundamentals",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Color Theory", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Typography Basics", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 22, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Adobe Photoshop",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Photoshop Interface", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 15, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Photo Editing Techniques", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 30, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "Cybersecurity Fundamentals",
        courseDescription: "Learn network security, ethical hacking, cryptography, and how to protect systems from cyber threats.",
        courseThumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
        coursePrice: 64.99,
        discount: 20,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Introduction to Cybersecurity",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "What is Cybersecurity?", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 16, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Common Cyber Threats", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Network Security",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Firewalls and VPNs", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 22, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Intrusion Detection", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      },
      {
        courseTitle: "Business Analytics with Excel",
        courseDescription: "Master Excel for business analytics. Learn pivot tables, VLOOKUP, data visualization, and financial modeling.",
        courseThumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
        coursePrice: 34.99,
        discount: 10,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Excel Basics",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Introduction to Excel", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 12, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Formulas and Functions", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Advanced Excel",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Pivot Tables", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Data Visualization", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 }
        ]
      },
      {
        courseTitle: "Blockchain and Cryptocurrency",
        courseDescription: "Understand blockchain technology, cryptocurrencies, smart contracts, and decentralized applications (DApps).",
        courseThumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
        coursePrice: 59.99,
        discount: 25,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Blockchain Fundamentals",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "What is Blockchain?", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 14, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "How Blockchain Works", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 20, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "Cryptocurrencies",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Bitcoin Basics", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Ethereum and Smart Contracts", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 25, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 },
          { userId: new mongoose.Types.ObjectId().toString(), rating: 4 }
        ]
      },
      {
        courseTitle: "Content Writing and Copywriting",
        courseDescription: "Learn to write compelling content for blogs, websites, and marketing. Master SEO writing and persuasive copywriting techniques.",
        courseThumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800",
        coursePrice: 39.99,
        discount: 15,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch1",
            chapterOrder: 1,
            chapterTitle: "Writing Fundamentals",
            chapterContent: [
              { lectureId: "lec1", lectureOrder: 1, lectureTitle: "Introduction to Content Writing", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 10, isPreviewFree: 1 },
              { lectureId: "lec2", lectureOrder: 2, lectureTitle: "Writing for Different Audiences", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 15, isPreviewFree: 0 }
            ]
          },
          {
            chapterId: "ch2",
            chapterOrder: 2,
            chapterTitle: "SEO Writing",
            chapterContent: [
              { lectureId: "lec3", lectureOrder: 1, lectureTitle: "Keyword Research", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 18, isPreviewFree: 0 },
              { lectureId: "lec4", lectureOrder: 2, lectureTitle: "Writing SEO-Friendly Content", lectureUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", lectureDuration: 22, isPreviewFree: 0 }
            ]
          }
        ],
        courseRatings: [
          { userId: new mongoose.Types.ObjectId().toString(), rating: 5 }
        ]
      }
    ];

    // Insert sample courses
    await Course.insertMany(sampleCourses);
    console.log(`✅ Successfully seeded ${sampleCourses.length} courses!`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
