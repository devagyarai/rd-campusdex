import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEPARTMENTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Mathematics"];
const BATCHES = ["2021-2025", "2022-2026", "2023-2027", "2024-2028"];
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] ;
const ROOMS = ["LH-101", "LH-102", "LH-201", "LH-202", "Lab-A", "Lab-B", "Lab-C", "Seminar Hall"];

const SUBJECTS = [
  { name: "Data Structures & Algorithms", code: "CS301", credits: 4, department: "Computer Science", semester: 3 },
  { name: "Operating Systems", code: "CS302", credits: 4, department: "Computer Science", semester: 3 },
  { name: "Database Management Systems", code: "CS303", credits: 3, department: "Computer Science", semester: 3 },
  { name: "Computer Networks", code: "CS401", credits: 4, department: "Computer Science", semester: 4 },
  { name: "Software Engineering", code: "CS402", credits: 3, department: "Computer Science", semester: 4 },
  { name: "Web Technologies", code: "CS403", credits: 3, department: "Computer Science", semester: 4 },
  { name: "Machine Learning", code: "CS501", credits: 4, department: "Computer Science", semester: 5 },
  { name: "Artificial Intelligence", code: "CS502", credits: 4, department: "Computer Science", semester: 5 },
  { name: "Cloud Computing", code: "CS503", credits: 3, department: "Computer Science", semester: 5 },
  { name: "Cybersecurity", code: "CS504", credits: 3, department: "Computer Science", semester: 5 },
  { name: "Digital Electronics", code: "EC301", credits: 4, department: "Electronics", semester: 3 },
  { name: "Signals & Systems", code: "EC302", credits: 4, department: "Electronics", semester: 3 },
  { name: "Thermodynamics", code: "ME301", credits: 4, department: "Mechanical", semester: 3 },
  { name: "Structural Analysis", code: "CE301", credits: 4, department: "Civil", semester: 3 },
  { name: "Linear Algebra", code: "MA301", credits: 3, department: "Mathematics", semester: 3 },
];

const NOTICE_DATA = [
  { title: "Mid-Semester Examination Schedule 2024", content: "The mid-semester examinations will be held from October 15th to October 22nd, 2024. All students are advised to check the detailed schedule on the notice board. Examination halls will be allotted and communicated separately. Students should report 15 minutes before the scheduled time with their hall tickets.", category: "EXAMINATION" as const, isPinned: true },
  { title: "Annual Tech Fest 'InnovatX 2024' Registration Open", content: "We are thrilled to announce the 12th Annual Technical Festival 'InnovatX 2024' scheduled for November 8-10, 2024. Events include Hackathon, Paper Presentation, Robotics Challenge, App Development Contest, and more. Registration deadline is October 31st. Teams of 2-4 members allowed.", category: "EVENT" as const, isPinned: true },
  { title: "Campus Placement Drive - TechCorp India", content: "TechCorp India Pvt. Ltd. will be conducting campus placement for 2024-25 batch students. Eligible: CS, EC students with 7.0+ CGPA and no active backlogs. Registration form is available in the placement portal. Pre-placement talk on November 5th at 3:00 PM in Auditorium.", category: "ACADEMIC" as const, isPinned: false },
  { title: "Library Timing Changes - Winter Schedule", content: "The central library will operate on revised timings from November 1st: Monday-Saturday: 8:00 AM to 9:00 PM, Sunday: 10:00 AM to 5:00 PM. Digital library access remains 24/7.", category: "GENERAL" as const, isPinned: false },
  { title: "URGENT: Power Outage Tomorrow", content: "There will be a planned power outage tomorrow (Thursday) from 9:00 AM to 1:00 PM due to electrical maintenance work in Block B. All classes in Block B are rescheduled. Check the updated timetable on the ERP portal.", category: "EMERGENCY" as const, isPinned: true },
  { title: "Sports Day Registration - Annual Athletics Meet", content: "The Annual Athletics Meet 2024 will be held on December 5th. Events include 100m, 200m, 400m sprint, long jump, high jump, shot put, and team sports. Registration deadline: November 20th. Register through the student portal.", category: "EVENT" as const, isPinned: false },
  { title: "Workshop: Full-Stack Web Development", content: "A 3-day intensive workshop on Full-Stack Web Development (React + Node.js + MongoDB) will be conducted by industry experts from November 18-20, 2024. Limited seats available. Registration on first-come basis. Fee: Rs 500 (includes certification).", category: "ACADEMIC" as const, isPinned: false },
  { title: "End-Semester Project Submission Guidelines", content: "All final year students must submit their project reports by November 30th. Reports should include: Abstract, Introduction, Literature Review, Methodology, Results, Conclusion, References. Soft copy submission through ERP portal, hard copy to department office.", category: "ACADEMIC" as const, isPinned: false },
];

const ASSIGNMENT_TEMPLATES = [
  { title: "Implement Binary Search Tree", description: "Design and implement a complete Binary Search Tree with insertion, deletion, search, and all traversal operations. Include time complexity analysis.", priority: "HIGH" as const },
  { title: "REST API Design Assignment", description: "Design a complete RESTful API for a Library Management System with proper HTTP methods, status codes, request/response schemas, and authentication.", priority: "MEDIUM" as const },
  { title: "Database Normalization Exercise", description: "Normalize the given university database schema to 3NF. Show all steps from 1NF to 3NF with proper diagrams and justification.", priority: "HIGH" as const },
  { title: "Network Protocol Analysis", description: "Using Wireshark, capture and analyze HTTP, TCP, and DNS packets. Document the handshake process and explain each field in the captured packets.", priority: "MEDIUM" as const },
  { title: "Machine Learning Model - Classification", description: "Build a classification model using Scikit-learn on the given dataset. Compare at least 3 algorithms, evaluate using confusion matrix, precision, recall, and F1 score.", priority: "URGENT" as const },
  { title: "Operating System Process Scheduler", description: "Implement a process scheduler simulator in C that supports FCFS, SJF, Round Robin, and Priority scheduling. Calculate and display average waiting time.", priority: "HIGH" as const },
  { title: "Web Portfolio Project", description: "Create a responsive personal portfolio website using HTML5, CSS3, and JavaScript. Must include: Hero, About, Skills, Projects, Contact sections with smooth animations.", priority: "LOW" as const },
  { title: "Software Requirements Specification", description: "Write a complete SRS document for an online food delivery application following IEEE standard 830. Include functional, non-functional requirements, use case diagrams.", priority: "MEDIUM" as const },
  { title: "Cloud Architecture Design", description: "Design a scalable, fault-tolerant cloud architecture for a high-traffic e-commerce application on AWS/GCP. Include load balancer, auto-scaling, CDN, and database setup.", priority: "HIGH" as const },
  { title: "Cybersecurity Audit Report", description: "Conduct a security audit of the given web application. Identify vulnerabilities (OWASP Top 10), assess risk levels, and provide remediation recommendations.", priority: "URGENT" as const },
];

const TIME_SLOTS = [
  { startTime: "08:00", endTime: "09:00" },
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "10:15", endTime: "11:15" },
  { startTime: "11:15", endTime: "12:15" },
  { startTime: "13:00", endTime: "14:00" },
  { startTime: "14:00", endTime: "15:00" },
  { startTime: "15:15", endTime: "16:15" },
];

const FIRST_NAMES = ["Arjun", "Priya", "Rahul", "Sneha", "Kiran", "Ananya", "Vikram", "Deepa", "Sanjay", "Meera", "Aditya", "Pooja", "Ravi", "Nisha", "Suresh", "Kavya", "Mohan", "Lakshmi", "Rajesh", "Swathi", "Harish", "Divya", "Naveen", "Rekha", "Sunil", "Geeta", "Prakash", "Shobha", "Dinesh", "Usha"];
const LAST_NAMES = ["Kumar", "Sharma", "Patel", "Singh", "Reddy", "Nair", "Gupta", "Verma", "Mehta", "Shah", "Iyer", "Joshi", "Pandey", "Chauhan", "Rao", "Mishra", "Tiwari", "Sinha", "Dubey", "Pillai"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("🌱 Starting RD CampusDex seed...\n");

  // Clean up
  console.log("🗑️  Cleaning existing data...");
  await prisma.assignmentSubmission.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.note.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("Admin@123", 12);
  const studentPassword = await bcrypt.hash("Student@123", 12);

  // ============ CREATE ADMINS ============
  console.log("👑 Creating 5 admins...");

  const adminData = [
    { email: "admin@campusdex.com", firstName: "Admin", lastName: "CampusDex", employeeId: "EMP001", designation: "Principal", department: "Administration" },
    { email: "dr.priya@campusdex.com", firstName: "Priya", lastName: "Sharma", employeeId: "EMP002", designation: "HOD - CS", department: "Computer Science" },
    { email: "prof.rahul@campusdex.com", firstName: "Rahul", lastName: "Mehta", employeeId: "EMP003", designation: "Professor", department: "Electronics" },
    { email: "dr.anjali@campusdex.com", firstName: "Anjali", lastName: "Nair", employeeId: "EMP004", designation: "Associate Professor", department: "Mathematics" },
    { email: "prof.krishna@campusdex.com", firstName: "Krishna", lastName: "Rao", employeeId: "EMP005", designation: "Assistant Professor", department: "Mechanical" },
  ];

  const admins = [];
  for (const a of adminData) {
    const user = await prisma.user.create({ data: { email: a.email, password, role: "ADMIN" } });
    const admin = await prisma.admin.create({
      data: {
        userId: user.id,
        firstName: a.firstName,
        lastName: a.lastName,
        employeeId: a.employeeId,
        designation: a.designation,
        department: a.department,
      },
    });
    admins.push(admin);
    console.log(`  ✅ Admin: ${a.email}`);
  }

  // ============ CREATE SUBJECTS ============
  console.log("\n📚 Creating subjects...");
  const subjects = [];
  for (const s of SUBJECTS) {
    const subject = await prisma.subject.create({ data: s });
    subjects.push(subject);
  }
  console.log(`  ✅ ${subjects.length} subjects created`);

  // ============ CREATE TIMETABLE ============
  console.log("\n📅 Creating timetable entries...");
  const csSubjects = subjects.filter(s => s.department === "Computer Science" && s.semester === 3);
  const sem5Subjects = subjects.filter(s => s.department === "Computer Science" && s.semester === 5);
  let timetableCount = 0;

  for (const subject of [...csSubjects, ...sem5Subjects]) {
    for (const day of DAYS.slice(0, 5)) {
      if (Math.random() > 0.6) {
        const slot = randomFrom(TIME_SLOTS);
        try {
          await prisma.timetable.create({
            data: {
              subjectId: subject.id,
              day,
              startTime: slot.startTime,
              endTime: slot.endTime,
              room: randomFrom(ROOMS),
              semester: subject.semester,
              batch: "2022-2026",
              department: subject.department,
            },
          });
          timetableCount++;
        } catch { /* skip duplicates */ }
      }
    }
  }
  console.log(`  ✅ ${timetableCount} timetable entries created`);

  // ============ CREATE 50 STUDENTS ============
  console.log("\n🎓 Creating 50 students...");

  const students = [];
  const usedEmails = new Set<string>();
  const usedRolls = new Set<string>();

  // First student: demo account
  const demoUser = await prisma.user.create({ data: { email: "student1@campusdex.com", password: studentPassword, role: "STUDENT" } });
  const demoStudent = await prisma.student.create({
    data: {
      userId: demoUser.id,
      firstName: "Arjun",
      lastName: "Kumar",
      rollNumber: "CS2022001",
      department: "Computer Science",
      semester: 5,
      batch: "2022-2026",
      phone: "+91 98765 43210",
      gender: "MALE",
    },
  });
  students.push(demoStudent);
  usedEmails.add("student1@campusdex.com");
  usedRolls.add("CS2022001");
  console.log("  ✅ Demo student: student1@campusdex.com");

  // 49 more students
  let studentNum = 2;
  while (students.length < 50) {
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    const dept = randomFrom(DEPARTMENTS);
    const deptCode = dept.split(" ").map(w => w[0]).join("").toUpperCase();
    const year = randomInt(2021, 2024);
    const rollNumber = `${deptCode}${year}${String(studentNum).padStart(3, "0")}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentNum}@campusdex.com`;

    if (usedEmails.has(email) || usedRolls.has(rollNumber)) {
      studentNum++;
      continue;
    }

    try {
      const user = await prisma.user.create({ data: { email, password: studentPassword, role: "STUDENT" } });
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          rollNumber,
          department: dept,
          semester: randomInt(1, 8),
          batch: randomFrom(BATCHES),
          phone: `+91 ${randomInt(70000, 99999)} ${randomInt(10000, 99999)}`,
          gender: randomFrom(["MALE", "FEMALE"]) as "MALE" | "FEMALE",
        },
      });
      students.push(student);
      usedEmails.add(email);
      usedRolls.add(rollNumber);
      studentNum++;
    } catch {
      studentNum++;
    }
  }
  console.log(`  ✅ ${students.length} students created`);

  // ============ CREATE ASSIGNMENTS ============
  console.log("\n📝 Creating 100 assignments...");

  const csSubjectsAll = subjects.filter(s => s.department === "Computer Science");
  let assignmentCount = 0;
  const createdAssignments = [];

  for (let i = 0; i < 10; i++) {
    const template = ASSIGNMENT_TEMPLATES[i];
    const subject = randomFrom(csSubjectsAll);
    const admin = randomFrom(admins);
    const isPast = Math.random() > 0.5;
    const dueDate = isPast ? daysAgo(randomInt(1, 30)) : daysFromNow(randomInt(1, 45));

    const assignment = await prisma.assignment.create({
      data: {
        title: template.title,
        description: template.description,
        subjectId: subject.id,
        adminId: admin.id,
        dueDate,
        totalMarks: randomFrom([50, 100]),
        priority: template.priority,
      },
    });
    createdAssignments.push(assignment);
    assignmentCount++;
  }

  // More assignments from templates
  for (let i = 0; i < 90; i++) {
    const subject = randomFrom(csSubjectsAll);
    const admin = randomFrom(admins);
    const isPast = Math.random() > 0.4;
    const dueDate = isPast ? daysAgo(randomInt(1, 60)) : daysFromNow(randomInt(1, 60));
    const template = randomFrom(ASSIGNMENT_TEMPLATES);

    const assignment = await prisma.assignment.create({
      data: {
        title: `${template.title} - Part ${i + 1}`,
        description: template.description,
        subjectId: subject.id,
        adminId: admin.id,
        dueDate,
        totalMarks: randomFrom([25, 50, 100]),
        priority: randomFrom(["LOW", "MEDIUM", "HIGH", "URGENT"]),
      },
    });
    createdAssignments.push(assignment);
    assignmentCount++;
  }
  console.log(`  ✅ ${assignmentCount} assignments created`);

  // ============ CREATE SUBMISSIONS ============
  console.log("  📨 Creating assignment submissions...");
  const statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"];
  let submissionCount = 0;

  for (const student of students.slice(0, 20)) {
    for (const assignment of createdAssignments.slice(0, 5)) {
      try {
        const status = randomFrom(statuses);
        await prisma.assignmentSubmission.create({
          data: {
            assignmentId: assignment.id,
            studentId: student.id,
            status,
            submittedAt: status === "COMPLETED" ? daysAgo(randomInt(1, 10)) : null,
            marksObtained: status === "COMPLETED" ? randomInt(60, assignment.totalMarks) : null,
          },
        });
        submissionCount++;
      } catch { /* skip */ }
    }
  }
  console.log(`  ✅ ${submissionCount} submissions created`);

  // ============ CREATE NOTICES ============
  console.log("\n📢 Creating 50 notices...");
  const mainAdmin = admins[0];
  let noticeCount = 0;

  for (const n of NOTICE_DATA) {
    await prisma.notice.create({
      data: { ...n, adminId: mainAdmin.id },
    });
    noticeCount++;
  }

  // More notices
  const moreNoticeCategories = ["ACADEMIC", "EVENT", "GENERAL"] ;
  for (let i = 0; i < 42; i++) {
    await prisma.notice.create({
      data: {
        title: `Campus Update #${i + 9}: ${["Seminar", "Workshop", "Announcement", "Reminder", "Alert"][i % 5]}`,
        content: `This is an important campus notice regarding activities scheduled for the upcoming weeks. Students are requested to take note and act accordingly. Please check the official portal for more details and updates. Contact the administrative office for any queries.`,
        category: randomFrom(moreNoticeCategories),
        isPinned: Math.random() > 0.85,
        adminId: randomFrom(admins).id,
        createdAt: daysAgo(randomInt(0, 90)),
      },
    });
    noticeCount++;
  }
  console.log(`  ✅ ${noticeCount} notices created`);

  // ============ CREATE ATTENDANCE ============
  console.log("\n✅ Creating 100+ attendance records...");
  let attendanceCount = 0;

  const attSubjects = subjects.filter(s => s.department === "Computer Science" && s.semester === 5);
  const attStudents = students.filter(s => s.department === "Computer Science");

  for (const student of attStudents.slice(0, 10)) {
    for (const subject of attSubjects) {
      for (let dayOffset = 90; dayOffset >= 0; dayOffset -= 3) {
        const date = new Date();
        date.setDate(date.getDate() - dayOffset);
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const rand = Math.random();
        const status = rand > 0.15 ? "PRESENT" : rand > 0.08 ? "ABSENT" : rand > 0.04 ? "LATE" : "EXCUSED";

        try {
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              subjectId: subject.id,
              date,
              status: status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
              markedBy: randomFrom(admins).id,
            },
          });
          attendanceCount++;
        } catch { /* skip duplicates */ }
      }
    }
  }
  console.log(`  ✅ ${attendanceCount} attendance records created`);

  // ============ CREATE NOTES ============
  console.log("\n📔 Creating sample notes for demo student...");

  const notesData = [
    { title: "DSA - Binary Trees", content: "A binary tree is a tree data structure in which each node has at most two children. Key operations: insert, delete, search, traversal (inorder, preorder, postorder). Time complexities: Average O(log n), Worst O(n).", category: "LECTURE" as const, tags: "dsa,trees,algorithms" },
    { title: "OS - Process Scheduling", content: "Process scheduling algorithms: FCFS (First Come First Served), SJF (Shortest Job First), Round Robin, Priority Scheduling. Key metrics: Throughput, Turnaround Time, Waiting Time, Response Time.", category: "STUDY" as const, tags: "os,scheduling,processes", isPinned: true },
    { title: "DBMS - Normalization", content: "Database normalization reduces redundancy and dependency. 1NF: Atomic values, 2NF: Full dependency, 3NF: Transitive dependency removed. BCNF is stronger form of 3NF.", category: "LECTURE" as const, tags: "dbms,normalization,sql" },
    { title: "ML Project Ideas", content: "1. Sentiment Analysis on social media\n2. Image Classification using CNN\n3. Recommendation System\n4. Fraud Detection\n5. Natural Language Processing chatbot", category: "PROJECT" as const, tags: "ml,ai,project", isPinned: true },
    { title: "Network Security Notes", content: "Key concepts: Encryption (symmetric/asymmetric), SSL/TLS, Firewalls, IDS/IPS, VPN, Zero Trust Architecture. OWASP Top 10 vulnerabilities to know.", category: "STUDY" as const, tags: "security,networking,cyber" },
  ];

  for (const note of notesData) {
    await prisma.note.create({
      data: { ...note, studentId: demoStudent.id },
    });
  }
  console.log("  ✅ Sample notes created for demo student");

  // ============ DONE ============
  console.log("\n🎉 Seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 DEMO CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👑 ADMIN:");
  console.log("   Email:    admin@campusdex.com");
  console.log("   Password: Admin@123");
  console.log("");
  console.log("🎓 STUDENT:");
  console.log("   Email:    student1@campusdex.com");
  console.log("   Password: Student@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Students: ${students.length}`);
  console.log(`✅ Admins: ${admins.length}`);
  console.log(`✅ Subjects: ${subjects.length}`);
  console.log(`✅ Timetable: ${timetableCount} entries`);
  console.log(`✅ Assignments: ${assignmentCount}`);
  console.log(`✅ Submissions: ${submissionCount}`);
  console.log(`✅ Notices: ${noticeCount}`);
  console.log(`✅ Attendance: ${attendanceCount} records`);
}

main()
  .catch((e) => { console.error("Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
