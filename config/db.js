/**
 * Database Configuration (backend/config/db.js)
 * ---------------------------------------------
 * Establishes secure connection to MongoDB Atlas with:
 * 1. Automatic DNS resolution fallback for Windows/c-ares
 * 2. Automatic RFC-compliant URL encoding for passwords containing special characters (@, #, etc.)
 * 3. Strict credential redaction in all logs
 */

const dns = require('dns');
const mongoose = require('mongoose');

// Configure public DNS servers if Windows/local DNS resolver uses 127.0.0.1 to avoid querySrv ECONNREFUSED
try {
  const currentServers = dns.getServers();
  if (currentServers.some((s) => s.startsWith('127.') || s === '::1')) {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...currentServers]);
  }
} catch (e) {
  // Gracefully fallback if setting DNS servers is not allowed in current environment
}

/**
 * Ensures special characters in credentials (especially '@') are properly
 * URI-encoded so MongoDB driver parses cluster hostname correctly.
 */
function buildSafeMongoUri(rawUri) {
  if (!rawUri || typeof rawUri !== 'string') return rawUri;
  const trimmed = rawUri.trim();

  try {
    const parsed = new URL(trimmed);
    const protocol = parsed.protocol; // 'mongodb+srv:' or 'mongodb:'
    const rawUsername = parsed.username;
    const rawPassword = parsed.password;
    const host = parsed.host;
    const pathname = parsed.pathname || '';
    const search = parsed.search || '';

    if (rawUsername && rawPassword) {
      // Decode first in case user already partially encoded, then encode strictly
      const safeUsername = encodeURIComponent(decodeURIComponent(rawUsername));
      const safePassword = encodeURIComponent(decodeURIComponent(rawPassword));
      return `${protocol}//${safeUsername}:${safePassword}@${host}${pathname}${search}`;
    }
    return trimmed;
  } catch (err) {
    return trimmed;
  }
}

/**
 * Returns a sanitized connection string for terminal logs with credentials masked.
 */
function sanitizeUriForLog(uri) {
  if (!uri) return '<EMPTY>';
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:[REDACTED]@');
}

const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI;

  if (!rawUri) {
    console.error('❌ MONGODB_URI is not defined in backend/.env');
    return null;
  }

  const safeUri = buildSafeMongoUri(rawUri);

  try {
    console.log(`Connecting to MongoDB Atlas [${sanitizeUriForLog(safeUri)}]...`);
    const conn = await mongoose.connect(safeUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📁 Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    if (error.message.includes('querySrv')) {
      console.log('👉 DNS Notice: Local DNS could not resolve Atlas SRV record. Public DNS (8.8.8.8) was applied.');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('👉 Auth Notice: Invalid username or password for MongoDB Atlas database user.');
      console.log('   Please check your password in backend/.env (Database Access in Atlas).');
    } else if (error.message.includes('whitelist') || error.message.includes('IP')) {
      console.log('👉 Network Notice: Ensure your IP is allowed in MongoDB Atlas Network Access (0.0.0.0/0).');
    }
    return null;
  }
};

module.exports = connectDB;
