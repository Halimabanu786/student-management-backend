
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const connectDB = require('./config/db');

dotenv.config();

const sampleStudents = [
  {
    studentId: 'STU101',
    fullName: 'Sophia Martinez',
    email: 'sophia.m@university.edu',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    phoneNumber: '+1 555-010-3847',
    address: '452 Elm Street, Boston, MA',
  },
  {
    studentId: 'STU102',
    fullName: 'Liam Chen',
    email: 'liam.chen@university.edu',
    department: 'Information Technology',
    year: '2nd Year',
    phoneNumber: '+1 555-019-9482',
    address: '782 Sunset Boulevard, Los Angeles, CA',
  },
  {
    studentId: 'STU103',
    fullName: 'Aarav Patel',
    email: 'aarav.patel@university.edu',
    department: 'Electronics & Communication',
    year: '4th Year',
    phoneNumber: '+1 555-014-5521',
    address: '108 Beacon Hill, Seattle, WA',
  },
  {
    studentId: 'STU104',
    fullName: 'Emily Rodriguez',
    email: 'emily.r@university.edu',
    department: 'Data Science & AI',
    year: '1st Year',
    phoneNumber: '+1 555-017-3819',
    address: '320 Pine Valley Rd, Austin, TX',
  },
  {
    studentId: 'STU105',
    fullName: 'Marcus Vance',
    email: 'marcus.v@university.edu',
    department: 'Mechanical Engineering',
    year: '2nd Year',
    phoneNumber: '+1 555-013-7762',
    address: '915 Oakridge Ave, Chicago, IL',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Seeding student records into MongoDB Atlas...');

    // Clear existing records
    await Student.deleteMany({});
    console.log('Cleared existing student collection.');

    // Insert sample students
    const createdStudents = await Student.insertMany(sampleStudents);
    console.log(`✅ Successfully seeded ${createdStudents.length} students into MongoDB!`);

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
