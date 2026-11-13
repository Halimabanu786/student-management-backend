const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputPath1 = path.join(__dirname, '..', 'frontend', 'Student_Management_System_Frontend_Study_Guide.pdf');
const outputPath2 = 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\7cc6e283-ecd0-47d9-a687-67ae4f54b89f\\Student_Management_System_Frontend_Study_Guide.pdf';

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
});

const writeStream1 = fs.createWriteStream(outputPath1);
doc.pipe(writeStream1);

// Helper styles
const colors = {
  primaryDark: '#1e3a8a',
  primary: '#2563eb',
  textDark: '#0f172a',
  textBody: '#334155',
  bgCard: '#f8fafc',
  border: '#cbd5e1',
  calloutBg: '#eff6ff',
  calloutBorder: '#3b82f6',
  codeBg: '#f1f5f9',
};

function addHeaderBanner() {
  doc.rect(45, 45, 505, 75).fill(colors.primaryDark);
  
  doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
     .text('MERN STACK TECHNICAL INTERVIEW STUDY GUIDE', 60, 58, { characterSpacing: 1 });
     
  doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold')
     .text('Student Management System — Frontend Guide', 60, 72);
     
  doc.fillColor('#93c5fd').fontSize(10).font('Helvetica')
     .text('Complete File & Folder Explanations, React 18 Hooks, Axios Integration & Q&A', 60, 95);

  doc.y = 135;
}

function addSectionTitle(title) {
  if (doc.y > 680) doc.addPage();
  doc.moveDown(0.6);
  const currentY = doc.y;
  doc.rect(45, currentY, 505, 24).fill('#e0e7ff');
  doc.fillColor(colors.primaryDark).fontSize(12).font('Helvetica-Bold')
     .text(title, 55, currentY + 6);
  doc.y = currentY + 32;
}

function addSubTitle(subTitle) {
  if (doc.y > 700) doc.addPage();
  doc.fillColor(colors.primaryDark).fontSize(11).font('Helvetica-Bold')
     .text(subTitle);
  doc.moveDown(0.2);
}

function addBodyText(text) {
  if (doc.y > 720) doc.addPage();
  doc.fillColor(colors.textBody).fontSize(9.5).font('Helvetica')
     .text(text, { lineGap: 2.5 });
  doc.moveDown(0.3);
}

function addCallout(question, answer) {
  if (doc.y > 670) doc.addPage();
  const startY = doc.y;
  
  // Calculate height needed approximately
  doc.fontSize(9.5).font('Helvetica-Bold');
  const qHeight = doc.heightOfString(`💡 ${question}`, { width: 475 });
  doc.fontSize(9).font('Helvetica-Oblique');
  const aHeight = doc.heightOfString(`Answer: ${answer}`, { width: 475, lineGap: 2 });
  const totalHeight = qHeight + aHeight + 16;

  doc.rect(45, startY, 505, totalHeight).fill(colors.calloutBg);
  doc.rect(45, startY, 4, totalHeight).fill(colors.calloutBorder);

  doc.fillColor(colors.primaryDark).fontSize(9.5).font('Helvetica-Bold')
     .text(`💡 ${question}`, 58, startY + 8, { width: 475 });
     
  doc.fillColor(colors.textDark).fontSize(9).font('Helvetica-Oblique')
     .text(`Answer: ${answer}`, 58, startY + 10 + qHeight, { width: 475, lineGap: 2 });

  doc.y = startY + totalHeight + 8;
}

function addCodeBox(codeSnippet) {
  if (doc.y > 690) doc.addPage();
  const startY = doc.y;
  doc.fontSize(8.5).font('Courier');
  const height = doc.heightOfString(codeSnippet, { width: 480, lineGap: 1.5 }) + 12;

  doc.rect(45, startY, 505, height).fill(colors.codeBg);
  doc.rect(45, startY, 505, height).stroke(colors.border);

  doc.fillColor('#0f172a').fontSize(8.5).font('Courier')
     .text(codeSnippet, 55, startY + 6, { width: 485, lineGap: 1.5 });

  doc.y = startY + height + 6;
}

// ---------------------- BUILD DOCUMENT ----------------------

addHeaderBanner();

// Section 1
addSectionTitle('1. High-Level Frontend Architecture');
addBodyText('The frontend is a Single Page Application (SPA) built with React 18 and bundled using Vite. Unlike traditional multi-page websites, the browser never reloads the whole page. React dynamically manipulates the DOM in memory via the Virtual DOM based on reactive state changes and backend API responses.');

addCodeBox(`Architecture & Data Flow:
[User Action]  ──>  Clicks Add/Edit/Delete or Types in Search
      │
[React State]  ──>  useState updates 'formData', 'students', or 'search'
      │
[Service API]  ──>  services/studentService.js (Axios Client)
      │
[Express API]  ──>  REST Endpoints at http://localhost:5000/api/students
      │
[MongoDB Atlas]──>  Performs live CRUD queries & returns JSON response
      │
[UI Re-render] ──>  Virtual DOM diffs changes and updates table instantly`);

// Section 2
addSectionTitle('2. Directory & File-by-File Breakdown');

addSubTitle('📁 index.html (Application Root Document)');
addBodyText('The sole HTML file loaded by the browser. Contains <div id="root"></div> where React mounts the component tree, and loads src/main.jsx as an ES module.');
addCallout('Why is index.html mostly empty in a React project?',
  'React is a Single Page Application framework. Instead of requesting separate HTML files from a server for each view, React injects dynamic JavaScript components into this single root container.');

addSubTitle('📁 package.json (Dependencies & Scripts)');
addBodyText('Defines project metadata and dependencies. Key production dependencies include "react", "react-dom", and "axios". Development dependencies include "vite" and "@vitejs/plugin-react".');
addCallout('What is the difference between dependencies and devDependencies?',
  'dependencies are bundled into the production output because the browser executes them (React, Axios). devDependencies are tools needed only on the developer machine to build, compile, and run the project (Vite).');

addSubTitle('📁 vite.config.js (Build Tool & Dev Server Configuration)');
addBodyText('Configures Vite plugins, local development port (5173), and the reverse proxy to forward /api requests to Express (:5000) during local development.');
addCodeBox(`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' }
  }
});`);
addCallout('Why use Vite instead of Create React App (Webpack)?',
  'Vite uses native browser ES Modules and the fast Esbuild pre-bundler. It offers instantaneous server startup and near-instant Hot Module Replacement (HMR) without re-bundling the whole project.');

addSubTitle('📁 src/main.jsx (JavaScript Entry Point)');
addBodyText('Initializes React 18 concurrent root via ReactDOM.createRoot() and wraps the <App /> component inside <React.StrictMode>.');
addCallout('What does <React.StrictMode> do?',
  'StrictMode is a developer tool that activates extra checks. In development, it mounts components twice to help identify uncleaned side-effects, memory leaks, and deprecated lifecycle usage.');

addSubTitle('📁 src/services/studentService.js (API Service Layer)');
addBodyText('Centralizes all Axios HTTP requests into discrete functions (getStudents, addStudent, updateStudent, deleteStudent).');
addCodeBox(`import axios from 'axios';
const API_URL = 'http://localhost:5000/api/students';

export const getStudents = (search = '') => axios.get(search ? \`\${API_URL}?search=\${search}\` : API_URL);
export const addStudent = (data) => axios.post(API_URL, data);
export const updateStudent = (id, data) => axios.put(\`\${API_URL}/\${id}\`, data);
export const deleteStudent = (id) => axios.delete(\`\${API_URL}/\${id}\`);`);
addCallout('Why separate API calls into a service file?',
  'Adheres to the Single Responsibility Principle. Components stay focused purely on rendering UI, while network logic and endpoint URLs are isolated in one easily maintainable place.');

addSubTitle('📁 src/App.jsx (Main Component & State Orchestrator)');
addBodyText('Holds the central state of the application: student roster (students), search query (search), modal visibility (showModal), edit target (editId), form inputs (formData), and feedback alerts (message).');
addBodyText('Uses useEffect to trigger fetchStudents(search) on mount and on search changes. Handles both Create and Update operations dynamically in handleSubmit.');

addSubTitle('📁 src/index.css (Enterprise Blue-and-White Design System)');
addBodyText('Provides clean styling with CSS Flexbox layouts, modal backdrop overlays (position: fixed with rgba background), responsive table formatting, badge pills, and color-coded alert notifications.');

// Section 3
addSectionTitle('3. Core React Concepts Deep-Dive');

addBodyText('• Controlled Components: Input elements have their value bound to React state (value={formData.fullName}) and update via onChange={handleChange}. React is the single source of truth.');
addBodyText('• Computed Property Names: In handleChange, [e.target.name]: e.target.value dynamically updates the exact property in formData matching the input name, using the spread operator (...formData) to preserve other fields.');
addBodyText('• useEffect Dependency Array: Passing [search] causes the effect to run on initial mount AND whenever the user modifies the search input.');
addBodyText('• List Keys: Using key={student._id} gives each DOM row a stable identity so React\'s Virtual DOM reconciliation algorithm only updates changed nodes.');

// Section 4
addSectionTitle('4. Top Technical Interview Questions & Answers');

addCallout('Q1: What happens step-by-step when a user adds a student?',
  '1. User types in fields; handleChange updates formData. 2. Clicking Save fires handleSubmit; e.preventDefault() prevents page reload. 3. addStudent(formData) sends an HTTP POST request to Express. 4. Express validates and saves to MongoDB Atlas. 5. On 201 response, React hides the modal, shows a green alert, and calls fetchStudents() to refresh the table.');

addCallout('Q2: Why use Axios instead of native fetch()?',
  'Axios parses JSON automatically (no res.json() needed), automatically rejects promises on 4xx/5xx HTTP error codes for streamlined error handling, and supports timeout configurations out of the box.');

addCallout('Q3: How does the real-time search work?',
  'The search input is bound to the "search" state. When changed, useEffect triggers fetchStudents(search). The service appends ?search=term to the GET request. Express runs a case-insensitive MongoDB regex query on fullName and studentId.');

addCallout('Q4: How does the Edit feature pre-fill student details?',
  'Clicking Edit calls openEditModal(student). It sets editId to student._id and fills formData with the existing values. Upon submission, handleSubmit checks if editId is present and executes HTTP PUT instead of POST.');

// Section 5
addSectionTitle('5. 60-Second Interview Elevator Pitch');
addBodyText('"The frontend is a Single Page Application built with React 18 and bundled with Vite for fast HMR. I structured the codebase using the Service Layer design pattern in services/studentService.js to isolate Axios network calls from the UI components. In App.jsx, I used useState to manage the student roster, controlled forms, and modals, while useEffect coordinates data retrieval and debounced search filtering. The system supports full CRUD operations with live feedback, confirmation guards for deletions, and real-time synchronization with MongoDB Atlas."');

// Add page numbers on all pages
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
     .text(
       `Student Management System — Frontend Study Guide  |  Page ${i + 1} of ${range.count}`,
       45,
       795,
       { align: 'center', width: 505 }
     );
}

doc.end();

writeStream1.on('finish', () => {
  // Also copy to brain artifact path
  try {
    fs.copyFileSync(outputPath1, outputPath2);
  } catch(e) {}
  console.log('✅ PDF generated successfully at:', outputPath1);
});
