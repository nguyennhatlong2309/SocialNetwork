// ============================================================
// MOCK DATA – dùng để test frontend mà không cần backend
// Để bật/tắt mock: đổi biến USE_MOCK trong từng api file
// ============================================================

export const MOCK_USERS = [
  {
    userId: 1,
    username: 'alex_m',
    email: 'alex@example.com',
    firstName: 'Alex',
    lastName: 'Morgan',
    fullName: 'Alex Morgan',
    avatarUrl: null,
    bio: 'Digital creator & design enthusiast ✨',
    followersCount: 1240,
    followingCount: 380,
    postsCount: 58,
    accessToken: 'mock-token-alex-123',
    password: 'Password123!',
  },
  {
    userId: 2,
    username: 'elena_r',
    email: 'elena@example.com',
    firstName: 'Elena',
    lastName: 'Rivera',
    fullName: 'Elena Rivera',
    avatarUrl: null,
    bio: 'UX Designer | Photographer',
    followersCount: 3500,
    followingCount: 210,
    postsCount: 120,
    accessToken: 'mock-token-elena-456',
    password: 'Password123!',
  },
  {
    userId: 3,
    username: 'marcus_w',
    email: 'marcus@example.com',
    firstName: 'Marcus',
    lastName: 'Webb',
    fullName: 'Marcus Webb',
    avatarUrl: null,
    bio: 'Software engineer & coffee addict ☕',
    followersCount: 890,
    followingCount: 450,
    postsCount: 34,
    accessToken: 'mock-token-marcus-789',
    password: 'Password123!',
  },
];

export const MOCK_POSTS = [
  {
    id: 1,
    userId: 2,
    user: {
      username: 'elena_r',
      fullName: 'Elena Rivera',
      avatarUrl: null,
    },
    content: 'Just launched my new design portfolio! After months of crafting every pixel, it\'s finally live 🎨 #Design #Portfolio #UX',
    media: [],
    likeCount: 248,
    commentCount: 32,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    comments: [
      { id: 1, userId: 1, user: { username: 'alex_m', fullName: 'Alex Morgan' }, content: 'Absolutely stunning work! 🔥', createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 2, userId: 3, user: { username: 'marcus_w', fullName: 'Marcus Webb' }, content: 'The glassmorphism cards are 🤌', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ]
  },
  {
    id: 2,
    userId: 3,
    user: {
      username: 'marcus_w',
      fullName: 'Marcus Webb',
      avatarUrl: null,
    },
    content: 'Hot take: Spatial computing is the next paradigm shift, and most developers are still sleeping on it. The apps we\'re going to build in the next 5 years will make today\'s look ancient. #SpatialComputing #Tech #Future',
    media: [],
    likeCount: 512,
    commentCount: 89,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    comments: [
      { id: 3, userId: 2, user: { username: 'elena_r', fullName: 'Elena Rivera' }, content: 'Couldn\'t agree more! Already exploring visionOS APIs.', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
    ]
  },
  {
    id: 3,
    userId: 1,
    user: {
      username: 'alex_m',
      fullName: 'Alex Morgan',
      avatarUrl: null,
    },
    content: 'Morning coffee + lo-fi beats + generative art experiments. This is the life ☕🎵 #GenerativeArt #CreativeCoding #Vibes',
    media: [],
    likeCount: 174,
    commentCount: 21,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    comments: []
  },
  {
    id: 4,
    userId: 2,
    user: {
      username: 'elena_r',
      fullName: 'Elena Rivera',
      avatarUrl: null,
    },
    content: 'New case study out: How we reduced onboarding drop-off by 40% with micro-interactions and progressive disclosure. Link in bio 📊 #UXResearch #ProductDesign #CaseStudy',
    media: [],
    likeCount: 892,
    commentCount: 115,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    comments: [
      { id: 4, userId: 3, user: { username: 'marcus_w', fullName: 'Marcus Webb' }, content: 'Would love to see the full process. Any chance of a walkthrough?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
      { id: 5, userId: 1, user: { username: 'alex_m', fullName: 'Alex Morgan' }, content: 'Saving this for our next sprint 🙌', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString() },
    ]
  },
  {
    id: 5,
    userId: 3,
    user: {
      username: 'marcus_w',
      fullName: 'Marcus Webb',
      avatarUrl: null,
    },
    content: 'Just hit 500 GitHub stars on my open-source auth library! Didn\'t expect this kind of response when I pushed it 3 months ago. Thank you all ⭐ #OpenSource #GitHub #Dev',
    media: [],
    likeCount: 1340,
    commentCount: 203,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    comments: []
  },
  {
    id: 6,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Just discovered an amazing new VS Code extension for React developers. It saves me so much time! 🚀 #ReactJS #VSCode #Productivity',
    media: [],
    likeCount: 342,
    commentCount: 15,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    comments: []
  },
  {
    id: 7,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Typography is 90% of web design. Change my mind. ✍️ #WebDesign #Typography #UXUI',
    media: [],
    likeCount: 1024,
    commentCount: 88,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    comments: [
      { id: 6, userId: 3, user: { username: 'marcus_w', fullName: 'Marcus Webb' }, content: '100% agree. Good typography can save a bad layout.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString() }
    ]
  },
  {
    id: 8,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Weekend project: Building a mini drone from scratch! So far I have burned 3 fingers and written 0 lines of code. Success! 🚁 #DIY #Hardware #WeekendVibes',
    media: [],
    likeCount: 567,
    commentCount: 42,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    comments: []
  },
  {
    id: 9,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Anyone else feeling the AI fatigue? Every tool now has an AI feature. Sometimes I just want a dumb tool that does one thing well. 🤖 #TechTrends #AI',
    media: [],
    likeCount: 2100,
    commentCount: 340,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(),
    comments: []
  },
  {
    id: 10,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Finding inspiration in nature today. Sometimes the best color palettes come from a simple walk in the park. 🌿🌸 #Inspiration #Design #Nature',
    media: [],
    likeCount: 450,
    commentCount: 12,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    comments: []
  },
  {
    id: 11,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Debugging CSS Grid issues is my new form of meditation. 🧘‍♂️ #CSS #Frontend #WebDev',
    media: [],
    likeCount: 890,
    commentCount: 65,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString(),
    comments: []
  },
  {
    id: 12,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Just deployed the new landing page using Next.js 14. The performance improvements are insane! ⚡ #NextJS #React #WebPerf',
    media: [],
    likeCount: 670,
    commentCount: 28,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 110).toISOString(),
    comments: []
  },
  {
    id: 13,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Why do clients always ask to "make the logo bigger"? 😅 #FreelanceLife #DesignHumor',
    media: [],
    likeCount: 1540,
    commentCount: 120,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    comments: []
  },
  {
    id: 14,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Learning Rust. The borrow checker is humbling me. 🦀 #RustLang #Programming',
    media: [],
    likeCount: 920,
    commentCount: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 130).toISOString(),
    comments: []
  },
  {
    id: 15,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Started listening to synthwave while coding. Productivity increased by 200%. 🎧💻 #CodingMusic #Synthwave',
    media: [],
    likeCount: 430,
    commentCount: 22,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    comments: []
  },
  {
    id: 16,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Dark mode is not just a trend, it\'s a lifestyle choice. 🌙 #DarkMode #UIUX',
    media: [],
    likeCount: 1890,
    commentCount: 150,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 150).toISOString(),
    comments: []
  },
  {
    id: 17,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Finally fixed that memory leak that has been haunting me for a week. I feel invincible! 💪 #Debugging #SoftwareEngineering',
    media: [],
    likeCount: 1100,
    commentCount: 95,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 160).toISOString(),
    comments: []
  },
  {
    id: 18,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Can we all agree that naming variables is the hardest part of computer science? 🤔 #CodingLife #DeveloperStruggles',
    media: [],
    likeCount: 2500,
    commentCount: 420,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 170).toISOString(),
    comments: []
  },
  {
    id: 19,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Just got my hands on the new Figma updates. Variables are going to change the game for design systems! 🎨🔧 #Figma #DesignSystems',
    media: [],
    likeCount: 880,
    commentCount: 54,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
    comments: []
  },
  {
    id: 20,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Coffee: turning coffee beans into code since forever. ☕➡️💻 #CoffeeAddict #Developer',
    media: [],
    likeCount: 650,
    commentCount: 30,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 190).toISOString(),
    comments: []
  },
  {
    id: 21,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Exploring 3D graphics in the browser with React Three Fiber. Mind blown! 🤯 #WebGL #ReactThreeFiber #3D',
    media: [],
    likeCount: 720,
    commentCount: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
    comments: []
  },
  {
    id: 22,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'A friendly reminder to take breaks, stretch, and drink water. Your posture will thank you later. 🧘‍♀️💧 #Wellness #DeskLife',
    media: [],
    likeCount: 1200,
    commentCount: 60,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 210).toISOString(),
    comments: []
  },
  {
    id: 23,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'My terminal setup is finally perfect. It only took me 3 years to get it right. 🐧 #Linux #Terminal #Zsh',
    media: [],
    likeCount: 950,
    commentCount: 75,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 220).toISOString(),
    comments: []
  },
  {
    id: 24,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Writing documentation is like eating vegetables. You don\'t always want to do it, but it\'s good for you (and everyone else). 🥦📄 #Documentation #DevLife',
    media: [],
    likeCount: 1400,
    commentCount: 110,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 230).toISOString(),
    comments: []
  },
  {
    id: 25,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Just finished reading "The Design of Everyday Things". A must-read for anyone building products! 📚 #UX #ProductDesign #ReadingList',
    media: [],
    likeCount: 800,
    commentCount: 40,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
    comments: []
  },
  {
    id: 26,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'Migrating a monolithic app to microservices. Wish me luck. 🏗️ #Architecture #Microservices #Backend',
    media: [],
    likeCount: 600,
    commentCount: 55,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 250).toISOString(),
    comments: []
  },
  {
    id: 27,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Does anyone else have 50 tabs open at all times, or is it just me? 📑 #BrowserTabs #Chaos',
    media: [],
    likeCount: 2200,
    commentCount: 300,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 260).toISOString(),
    comments: []
  },
  {
    id: 28,
    userId: 2,
    user: { username: 'elena_r', fullName: 'Elena Rivera', avatarUrl: null },
    content: 'Accessibility should not be an afterthought. It\'s a fundamental part of good design. ♿🌐 #A11y #InclusiveDesign',
    media: [],
    likeCount: 1750,
    commentCount: 130,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 270).toISOString(),
    comments: []
  },
  {
    id: 29,
    userId: 3,
    user: { username: 'marcus_w', fullName: 'Marcus Webb', avatarUrl: null },
    content: 'I love how open-source brings people together from all over the world to build cool things. ❤️🌍 #Community #OpenSource',
    media: [],
    likeCount: 1300,
    commentCount: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 280).toISOString(),
    comments: []
  },
  {
    id: 30,
    userId: 1,
    user: { username: 'alex_m', fullName: 'Alex Morgan', avatarUrl: null },
    content: 'Just updated my mechanical keyboard with new tactile switches. The thock is real. ⌨️🎶 #MechanicalKeyboards #Keebs',
    media: [],
    likeCount: 580,
    commentCount: 25,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 290).toISOString(),
    comments: []
  }
];

export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    participants: [
      { userId: 1, username: 'alex_m', fullName: 'Alex Morgan' },
      { userId: 2, username: 'elena_r', fullName: 'Elena Rivera' },
    ],
    lastMessage: { content: 'Hey, saw your new portfolio! Absolutely love the case study section 🔥', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    unreadCount: 2,
  },
  {
    id: 2,
    participants: [
      { userId: 1, username: 'alex_m', fullName: 'Alex Morgan' },
      { userId: 3, username: 'marcus_w', fullName: 'Marcus Webb' },
    ],
    lastMessage: { content: 'Are you going to the design meetup next Thursday?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES = {
  1: [
    { id: 1, senderId: 2, content: 'Hey! Loved your generative art post 🎨', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: 2, senderId: 1, content: 'Thanks Elena! Been experimenting with p5.js lately', createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
    { id: 3, senderId: 2, content: 'Oh that\'s so cool! I\'ve been using Three.js for some 3D stuff', createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { id: 4, senderId: 1, content: 'Nice! We should collab sometime 🚀', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
    { id: 5, senderId: 2, content: 'Hey, saw your new portfolio! Absolutely love the case study section 🔥', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  ],
  2: [
    { id: 6, senderId: 3, content: 'Bro did you see the new React 20 announcement?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
    { id: 7, senderId: 1, content: 'Yeah! Server components are getting wild', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3.5).toISOString() },
    { id: 8, senderId: 3, content: 'Are you going to the design meetup next Thursday?', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
  ],
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'like', actor: { username: 'elena_r', fullName: 'Elena Rivera' }, targetPostId: 3, message: 'liked your post', createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), read: false },
  { id: 2, type: 'comment', actor: { username: 'marcus_w', fullName: 'Marcus Webb' }, targetPostId: 3, message: 'commented on your post', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), read: false },
  { id: 3, type: 'follow', actor: { username: 'elena_r', fullName: 'Elena Rivera' }, message: 'started following you', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: true },
  { id: 4, type: 'like', actor: { username: 'marcus_w', fullName: 'Marcus Webb' }, targetPostId: 1, message: 'liked your post', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), read: true },
  { id: 5, type: 'mention', actor: { username: 'elena_r', fullName: 'Elena Rivera' }, targetPostId: 4, message: 'mentioned you in a comment', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true },
];

// Helper: giả lập delay network (ms)
export function simulateDelay(ms = 400) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
