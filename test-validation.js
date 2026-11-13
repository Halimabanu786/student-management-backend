
const mongoose = require('mongoose');
const Student = require('./models/Student');

console.log('🧪 Starting Mongoose Student Model Validation Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

const assert = (condition, description) => {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    testsFailed++;
  }
};

// Test 1: Empty student fails validation for required fields
const emptyStudent = new Student({});
const validationError = emptyStudent.validateSync();

assert(validationError !== undefined, 'Empty student should produce validation errors');
assert(
  validationError.errors.studentId !== undefined,
  'studentId is required error is captured'
);
assert(
  validationError.errors.fullName !== undefined,
  'fullName is required error is captured'
);
assert(
  validationError.errors.email !== undefined,
  'email is required error is captured'
);
assert(
  validationError.errors.department !== undefined,
  'department is required error is captured'
);
assert(
  validationError.errors.year !== undefined,
  'year is required error is captured'
);
assert(
  validationError.errors.phoneNumber !== undefined,
  'phoneNumber is required error is captured'
);
assert(
  validationError.errors.address !== undefined,
  'address is required error is captured'
);

// Test 2: Invalid email fails regex check
const invalidEmailStudent = new Student({
  studentId: 'STU999',
  fullName: 'John Doe',
  email: 'not-an-email',
  department: 'Computer Science',
  year: '1st Year',
  phoneNumber: '1234567890',
  address: '123 Main St',
});
const emailError = invalidEmailStudent.validateSync();
assert(
  emailError && emailError.errors.email !== undefined,
  'Invalid email format is rejected by Mongoose regex'
);

// Test 3: Valid student passes validation
const validStudent = new Student({
  studentId: 'stu101',
  fullName: 'Jane Smith',
  email: 'jane.smith@college.edu',
  department: 'Information Technology',
  year: '2nd Year',
  phoneNumber: '+1 555-0199',
  address: '456 College Ave',
});
const noError = validStudent.validateSync();
assert(noError === undefined, 'Valid student passes all validation checks');

// Test 4: Student ID is trimmed and converted to uppercase
assert(
  validStudent.studentId === 'STU101',
  `studentId is normalized to uppercase (expected "STU101", got "${validStudent.studentId}")`
);

console.log(`\n📋 Test Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Student Model Validation Tests Passed Successfully!\n');
  process.exit(0);
}
