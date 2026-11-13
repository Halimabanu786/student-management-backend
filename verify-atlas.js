
const dns = require('dns');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Apply public DNS fallback for Windows c-ares resolver
try {
  const currentServers = dns.getServers();
  if (currentServers.some((s) => s.startsWith('127.') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...currentServers]);
  }
} catch (e) {}

function buildSafeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  const trimmed = rawUri.trim();
  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol;
    const safeUsername = encodeURIComponent(decodeURIComponent(parsed.username));
    const safePassword = encodeURIComponent(decodeURIComponent(parsed.password));
    const host = parsed.host;
    const pathname = parsed.pathname || '';
    const search = parsed.search || '';

    if (safeUsername && safePassword) {
      return `${protocol}//${safeUsername}:${safePassword}@${host}${pathname}${search}`;
    }
    return trimmed;
  } catch (err) {
    return trimmed;
  }
}

function sanitizeUriForLog(uri) {
  if (!uri) return '<EMPTY>';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:[REDACTED]@');
}

async function verify() {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.error('❌ MONGODB_URI is not set in backend/.env');
    process.exit(1);
  }

  const safeUri = buildSafeMongoUri(rawUri);
  console.log(`Connecting to: ${sanitizeUriForLog(safeUri)}`);

  try {
    const conn = await mongoose.connect(safeUri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`✅ SUCCESS: Connected to MongoDB Atlas Cluster!`);
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    // Verify CRUD directly on MongoDB Atlas
    const Student = require('./models/Student');

    // Clean up any previous test record
    await Student.deleteOne({ studentId: 'TEST_VERIFY_999' });

    // 1. CREATE
    const testStudent = new Student({
      studentId: 'TEST_VERIFY_999',
      fullName: 'Atlas Test Student',
      email: 'atlas.test@example.com',
      department: 'Computer Science',
      year: '1st Year',
      phoneNumber: '1234567890',
      address: '123 Test Street',
    });
    const saved = await testStudent.save();
    console.log('✅ CRUD CREATE: Successfully saved student record to MongoDB Atlas.');

    // 2. READ
    const found = await Student.findOne({ studentId: 'TEST_VERIFY_999' });
    console.log(`✅ CRUD READ: Found student "${found.fullName}" in MongoDB Atlas.`);

    // 3. UPDATE
    found.department = 'Data Science & AI';
    await found.save();
    console.log('✅ CRUD UPDATE: Successfully updated student record in MongoDB Atlas.');

    // 4. DELETE
    await Student.deleteOne({ _id: found._id });
    console.log('✅ CRUD DELETE: Successfully deleted test student record from MongoDB Atlas.');

    console.log('\n🎉 ALL CRUD OPERATIONS VERIFIED AGAINST LIVE MONGODB ATLAS!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error(`❌ Atlas Connection Failed: ${err.name} - ${err.message}`);
    process.exit(1);
  }
}

verify();
