// Central mock dataset for Capacity Connect prototype.
// In a real deployment this would be replaced by API calls to the LMS backend.

export const CATEGORIES = ['Data Analytics', 'Cybersecurity', 'Public Policy', 'Leadership', 'Communication', 'Digital Governance'];
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const initialCourses = [
  {
    id: 'c1',
    title: 'Foundations of Data Analytics for Public Administration',
    description: 'Learn how to read, clean, and interpret administrative datasets to support evidence-based policy decisions.',
    category: 'Data Analytics',
    difficulty: 'Beginner',
    duration: '6h 20m',
    thumbnail: 'navy-teal',
    objectives: ['Understand core statistical terms', 'Clean a raw dataset in spreadsheets', 'Build a basic dashboard', 'Interpret trend charts for reports'],
    trainer: 'Dr. Anika Rao',
    status: 'Approved',
    submittedOn: '2026-06-02',
    rating: 4.6,
    learners: 1240,
    modules: [
      { id: 'm1', title: 'Why Data Matters in Governance', lessons: [
        { id: 'l1', title: 'Introduction & Course Roadmap', duration: '6:12', type: 'video' },
        { id: 'l2', title: 'Data in Everyday Administration', duration: '9:40', type: 'video' },
      ]},
      { id: 'm2', title: 'Cleaning & Structuring Data', lessons: [
        { id: 'l3', title: 'Common Data Errors', duration: '11:05', type: 'video' },
        { id: 'l4', title: 'Hands-on: Cleaning a Dataset', duration: '14:30', type: 'video' },
      ]},
      { id: 'm3', title: 'Dashboards & Reporting', lessons: [
        { id: 'l5', title: 'Designing a Readable Dashboard', duration: '10:15', type: 'video' },
        { id: 'l6', title: 'Module Quiz', duration: '10 Qs', type: 'quiz' },
      ]},
    ],
    skillsGained: ['Data Cleaning', 'Dashboarding', 'Statistical Reasoning'],
    reviews: [
      { user: 'R. Sharma', rating: 5, text: 'Practical and directly applicable to my department\'s reporting work.' },
      { user: 'K. Iyer', rating: 4, text: 'Good pacing, would like more real government datasets as examples.' },
    ],
  },
  {
    id: 'c2',
    title: 'Cybersecurity Essentials for Government Officers',
    description: 'A practical introduction to protecting citizen data, recognising phishing attempts, and following secure digital workflows.',
    category: 'Cybersecurity',
    difficulty: 'Intermediate',
    duration: '4h 45m',
    thumbnail: 'coral-navy',
    objectives: ['Identify phishing & social engineering', 'Apply secure password practices', 'Understand data classification', 'Respond to a suspected breach'],
    trainer: 'Vikram Nair',
    status: 'Pending Approval',
    submittedOn: '2026-08-18',
    rating: 0,
    learners: 0,
    modules: [
      { id: 'm1', title: 'Threat Landscape', lessons: [
        { id: 'l1', title: 'Common Attack Vectors', duration: '8:20', type: 'video' },
      ]},
      { id: 'm2', title: 'Everyday Secure Practices', lessons: [
        { id: 'l2', title: 'Passwords & MFA', duration: '7:10', type: 'video' },
      ]},
    ],
    skillsGained: ['Threat Awareness', 'Secure Workflows'],
    reviews: [],
  },
  {
    id: 'c3',
    title: 'Leadership for First-Time Team Leads',
    description: 'Build the core people-management skills needed to lead a small government team through change.',
    category: 'Leadership',
    difficulty: 'Beginner',
    duration: '5h 10m',
    thumbnail: 'saffron-navy',
    objectives: ['Run effective one-on-ones', 'Delegate with clarity', 'Give constructive feedback', 'Manage team conflict'],
    trainer: 'Dr. Anika Rao',
    status: 'Draft',
    submittedOn: null,
    rating: 0,
    learners: 0,
    modules: [
      { id: 'm1', title: 'Getting Started as a Lead', lessons: [
        { id: 'l1', title: 'What Changes When You Lead', duration: '9:00', type: 'video' },
      ]},
    ],
    skillsGained: ['Delegation', 'Feedback'],
    reviews: [],
  },
  {
    id: 'c4',
    title: 'Digital Governance & e-Service Delivery',
    description: 'Understand how digital platforms are reshaping citizen service delivery, with case studies from state e-governance missions.',
    category: 'Digital Governance',
    difficulty: 'Intermediate',
    duration: '7h 00m',
    thumbnail: 'teal-navy',
    objectives: ['Map an end-to-end e-service journey', 'Evaluate accessibility of digital services', 'Apply UX basics to government forms'],
    trainer: 'Meera Joseph',
    status: 'Approved',
    submittedOn: '2026-05-11',
    rating: 4.8,
    learners: 2110,
    modules: [
      { id: 'm1', title: 'The Shift to Digital-First', lessons: [
        { id: 'l1', title: 'From Counters to Portals', duration: '8:45', type: 'video' },
        { id: 'l2', title: 'Case Study: e-District Mission', duration: '12:30', type: 'video' },
      ]},
      { id: 'm2', title: 'Designing for Citizens', lessons: [
        { id: 'l3', title: 'Accessibility Basics', duration: '9:55', type: 'video' },
        { id: 'l4', title: 'Module Quiz', duration: '8 Qs', type: 'quiz' },
      ]},
    ],
    skillsGained: ['Service Design', 'Accessibility', 'Citizen Journeys'],
    reviews: [
      { user: 'P. Das', rating: 5, text: 'Case studies made abstract policy ideas feel concrete.' },
    ],
  },
  {
    id: 'c5',
    title: 'Communication Skills for Public-Facing Roles',
    description: 'Sharpen written and verbal communication for handling citizen queries, grievances, and interdepartmental coordination.',
    category: 'Communication',
    difficulty: 'Beginner',
    duration: '3h 30m',
    thumbnail: 'navy-saffron',
    objectives: ['Write clear grievance responses', 'De-escalate difficult conversations', 'Coordinate across departments'],
    trainer: 'Meera Joseph',
    status: 'Rejected',
    submittedOn: '2026-08-05',
    rejectionReason: 'Video audio quality in Module 2 is inconsistent — please re-record with a external microphone and resubmit.',
    rating: 0,
    learners: 0,
    modules: [
      { id: 'm1', title: 'Written Communication', lessons: [
        { id: 'l1', title: 'Grievance Response Templates', duration: '7:40', type: 'video' },
      ]},
    ],
    skillsGained: ['Written Communication'],
    reviews: [],
  },
];

export const traineeCreditTxns = [
  { id: 't1', label: 'Course Completed — Digital Governance & e-Service Delivery', amount: 50, date: '2026-08-24', type: 'earn', icon: '🎓' },
  { id: 't2', label: 'Quiz Passed — Module 3, Data Analytics', amount: 30, date: '2026-08-22', type: 'earn', icon: '📝' },
  { id: 't3', label: 'Certificate Issued — Data Analytics Foundations', amount: 100, date: '2026-08-20', type: 'earn', icon: '📜' },
  { id: 't4', label: 'Reward Redeemed — Advanced Course Access', amount: -200, date: '2026-08-15', type: 'redeem', icon: '🎁' },
  { id: 't5', label: '7-Day Learning Streak Bonus', amount: 40, date: '2026-08-10', type: 'earn', icon: '🔥' },
  { id: 't6', label: 'Course Completed — Leadership Basics', amount: 50, date: '2026-07-29', type: 'earn', icon: '🎓' },
];

export const trainerCreditTxns = [
  { id: 'tc1', label: 'Course Approved — Digital Governance & e-Service Delivery', amount: 150, date: '2026-05-12', type: 'earn', icon: '✅' },
  { id: 'tc2', label: 'Learner Completions — 40 learners finished your course', amount: 200, date: '2026-08-18', type: 'earn', icon: '👥' },
  { id: 'tc3', label: 'High Engagement Bonus — 4.8★ average rating', amount: 80, date: '2026-08-19', type: 'earn', icon: '⭐' },
  { id: 'tc4', label: 'Course Approved — Data Analytics Foundations', amount: 150, date: '2026-06-03', type: 'earn', icon: '✅' },
  { id: 'tc5', label: 'Learner Completions — 25 learners finished your course', amount: 100, date: '2026-06-28', type: 'earn', icon: '👥' },
];

export const rewards = [
  { id: 'r1', title: 'Advanced Course Access Pass', desc: 'Unlock any Advanced-level course without prerequisite checks.', cost: 1000, icon: '🚀' },
  { id: 'r2', title: 'Priority Mentor Session', desc: '30-minute 1:1 session with a senior domain trainer.', cost: 600, icon: '🧑‍🏫' },
  { id: 'r3', title: 'e-Certificate Frame Upgrade', desc: 'Premium verified certificate design with holographic seal.', cost: 250, icon: '🖼️' },
  { id: 'r4', title: 'Capacity Connect Merchandise Kit', desc: 'Notebook, pen and lanyard shipped to your office address.', cost: 400, icon: '🎒' },
  { id: 'r5', title: 'Skip-the-Queue Support', desc: 'Priority helpdesk support for 30 days.', cost: 150, icon: '⚡' },
  { id: 'r6', title: 'Leadership Bootcamp Seat', desc: 'Reserved seat in the quarterly in-person leadership bootcamp.', cost: 1500, icon: '🏛️' },
];

export const redemptionHistory = [
  { id: 'rh1', title: 'Advanced Course Access Pass', cost: 200, date: '2026-08-15', status: 'Delivered' },
  { id: 'rh2', title: 'e-Certificate Frame Upgrade', cost: 250, date: '2026-07-02', status: 'Delivered' },
];

export const achievements = [
  { id: 'a1', title: 'First Course', desc: 'Completed your first course', icon: '🌱', earned: true },
  { id: 'a2', title: '5 Courses Completed', desc: 'Finished 5 full courses', icon: '🏅', earned: true },
  { id: 'a3', title: '7-Day Learning Streak', desc: 'Learned for 7 days in a row', icon: '🔥', earned: true },
  { id: 'a4', title: 'Top Learner', desc: 'Ranked in the top 10 this month', icon: '🏆', earned: false },
  { id: 'a5', title: 'Knowledge Contributor', desc: 'Left 10 helpful course reviews', icon: '💬', earned: false },
  { id: 'a6', title: 'Quiz Master', desc: 'Scored 100% on 3 quizzes', icon: '🎯', earned: true },
];

export const topLearners = [
  { rank: 1, name: 'Ritika Sharma', dept: 'Dept. of Revenue', credits: 3120, badge: '🏆' },
  { rank: 2, name: 'Arjun Mehta', dept: 'Dept. of IT & e-Gov', credits: 2870, badge: '🥈' },
  { rank: 3, name: 'Fatima Sheikh', dept: 'Health Dept.', credits: 2640, badge: '🥉' },
  { rank: 4, name: 'Sandeep Kulkarni', dept: 'Rural Development', credits: 2210, badge: '' },
  { rank: 5, name: 'You', dept: 'Dept. of IT & e-Gov', credits: 1250, badge: '', isYou: true },
];

export const topTrainers = [
  { rank: 1, name: 'Meera Joseph', dept: 'Digital Governance Cell', credits: 4210, badge: '🏆' },
  { rank: 2, name: 'Dr. Anika Rao', dept: 'Analytics Training Wing', credits: 3980, badge: '🥈' },
  { rank: 3, name: 'Vikram Nair', dept: 'Cybersecurity Cell', credits: 3105, badge: '🥉' },
  { rank: 4, name: 'You (Trainer)', dept: 'Analytics Training Wing', credits: 680, badge: '', isYou: true },
];

export const certificates = [
  { id: 'cert1', course: 'Digital Governance & e-Service Delivery', date: '2026-08-24', certId: 'CC-2026-DG-88231', score: 92 },
  { id: 'cert2', course: 'Leadership for First-Time Team Leads', date: '2026-07-29', certId: 'CC-2026-LD-77120', score: 85 },
];

export const skills = [
  { name: 'Data Analytics', pct: 80 },
  { name: 'Communication', pct: 64 },
  { name: 'Leadership', pct: 50 },
  { name: 'Digital Governance', pct: 71 },
  { name: 'Cybersecurity', pct: 28 },
];

export const recommendedSkill = { name: 'Cybersecurity', reason: 'Your Cybersecurity score is your lowest, and 3 upcoming policy changes in your department require baseline certification.' };

export const quizBank = {
  c1: [
    { q: 'Which of these is NOT a common data cleaning task?', options: ['Removing duplicate rows', 'Standardising date formats', 'Deleting the entire dataset', 'Handling missing values'], answer: 2 },
    { q: 'A dashboard is most useful for:', options: ['Storing raw data permanently', 'Communicating trends at a glance', 'Replacing all written reports', 'Encrypting sensitive data'], answer: 1 },
    { q: 'What should you check first in a new administrative dataset?', options: ['Column names & data types', 'The file\'s creation date only', 'Nothing, just start analysis', 'The font used in the file'], answer: 0 },
  ],
  c4: [
    { q: 'End-to-end service mapping helps teams:', options: ['Ignore citizen pain points', 'Identify friction across the full journey', 'Add more approval steps', 'Remove the need for feedback'], answer: 1 },
    { q: 'Accessibility in digital forms means:', options: ['Usable only on desktop', 'Usable by people with diverse abilities', 'Available in one language only', 'Requires a smartphone app'], answer: 1 },
  ],
};

export const trainerAnalytics = {
  totalLearners: 3350,
  completions: 1512,
  completionPct: 68,
  avgQuizScore: 81,
  avgRating: 4.7,
  contributionCredits: 680,
  perCourse: [
    { title: 'Data Analytics Foundations', learners: 1240, completionPct: 71, rating: 4.6 },
    { title: 'Digital Governance & e-Service Delivery', learners: 2110, completionPct: 66, rating: 4.8 },
  ],
};

export const adminAnalytics = {
  totalTrainees: 18420,
  totalTrainers: 214,
  totalCourses: 96,
  pendingCourses: 7,
  completionRate: 62,
  creditsDistributed: 486200,
  creditsRedeemed: 191300,
  mostPopular: [
    { title: 'Digital Governance & e-Service Delivery', learners: 2110 },
    { title: 'Data Analytics Foundations', learners: 1240 },
    { title: 'Cybersecurity Essentials', learners: 980 },
  ],
};
