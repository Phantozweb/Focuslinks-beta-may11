// ─── Help Center Data ──────────────────────────────────────────────
// Self-contained help articles for FocusLinks. No external dependencies.

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  tags: string[];
  content: string; // rich text (plain, will be rendered with whitespace-pre-wrap + paragraphs)
  relatedArticleIds: string[];
  popular?: boolean; // show in "Popular Articles" section
}

export type HelpCategory =
  | 'getting-started'
  | 'profile-directory'
  | 'community-posts'
  | 'optomap'
  | 'connections'
  | 'messages'
  | 'membership'
  | 'labs-tools'
  | 'events-webinars'
  | 'jobs-marketplace'
  | 'academy'
  | 'account-settings';

export interface HelpCategoryInfo {
  id: HelpCategory;
  title: string;
  description: string;
  icon: string; // lucide icon name
}

export const helpCategories: HelpCategoryInfo[] = [
  { id: 'getting-started', title: 'Getting Started', description: 'New to FocusLinks? Start here.', icon: 'BookOpen' },
  { id: 'profile-directory', title: 'Profile & Directory', description: 'Managing your profile and finding professionals.', icon: 'User' },
  { id: 'community-posts', title: 'Community & Posts', description: 'Posting, commenting, and engaging with the community.', icon: 'Users' },
  { id: 'optomap', title: 'OptoMap', description: 'Interactive map of optometrists worldwide.', icon: 'MapPin' },
  { id: 'connections', title: 'Connections', description: 'Building your professional network.', icon: 'Link' },
  { id: 'messages', title: 'Messages', description: 'Direct messaging and group chats.', icon: 'MessageCircle' },
  { id: 'membership', title: 'Membership', description: 'Membership tiers, benefits, and applications.', icon: 'ShieldCheck' },
  { id: 'labs-tools', title: 'Labs & Tools', description: 'Clinical AI tools: OD-CAM, OptoScholar, IPD Measure, RAPD.', icon: 'Wrench' },
  { id: 'events-webinars', title: 'Events & Webinars', description: 'Upcoming events, Eye Q Arena, and webinar recordings.', icon: 'Calendar' },
  { id: 'jobs-marketplace', title: 'Jobs & Marketplace', description: 'Career opportunities and marketplace listings.', icon: 'Briefcase' },
  { id: 'academy', title: 'Academy', description: 'Courses, learning paths, and educational content.', icon: 'GraduationCap' },
  { id: 'account-settings', title: 'Account & Settings', description: 'Privacy, notifications, and account management.', icon: 'Settings' },
];

export const helpArticles: HelpArticle[] = [
  // ═══════════════════════════════════════════════════════════════
  // GETTING STARTED
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'gs-what-is-focuslinks',
    title: 'What is FocusLinks?',
    category: 'getting-started',
    tags: ['focuslinks', 'platform', 'about', 'introduction', 'optometry'],
    content: `FocusLinks is the world's largest digital community built exclusively for eye care professionals — optometrists, ophthalmologists, students, researchers, and educators.

Our mission is to unite the global eye care community through technology, providing:

• Professional Networking — Connect with optometrists, students, and clinics worldwide
• Clinical AI Tools — Free access to OD-CAM, OptoScholar, IPD Measure Pro, and RAPD Simulator
• Knowledge Sharing — Community feed, articles, webinars, and educational courses
• Career Growth — Job board, marketplace, and leadership opportunities
• Global Events — International webinars, Eye Q Arena competitions, and clinical workshops

FocusLinks is a non-commercial, passion-driven platform. All core features are completely free for eye care professionals.`,
    relatedArticleIds: ['gs-create-profile', 'gs-navigate', 'ms-benefits'],
    popular: true,
  },
  {
    id: 'gs-create-profile',
    title: 'How to Create Your Profile',
    category: 'getting-started',
    tags: ['profile', 'create', 'signup', 'register', 'new user', 'onboarding'],
    content: `Creating a professional profile is your first step on FocusLinks. Here's how:

Step 1: Become a Member
Visit /membership-application and fill out the registration form. This registers you in our system.

Step 2: Create Your Profile
Once approved, go to /create-profile. Fill in your professional details:
• Name, title, and email
• Location and country
• Clinical skills and specialties
• Education and experience history
• Professional bio and interests
• Languages spoken
• LinkedIn profile (optional)
• Profile photo (optional but recommended)

Step 3: Explore
Your profile will appear in the global Directory (/directory). Browse the Community Feed (/feed), try clinical Labs (/labs), register for events (/events), and explore the Job Board (/jobs).

Tips for a Great Profile:
• Use a professional headshot
• Write a compelling bio that highlights your expertise
• List specific clinical skills (e.g., specialty contact lenses, low vision, pediatric optometry)
• Add your education and work experience
• Participate in community discussions to increase visibility`,
    relatedArticleIds: ['gs-what-is-focuslinks', 'pd-edit-profile', 'pd-stand-out'],
    popular: true,
  },
  {
    id: 'gs-navigate',
    title: 'Navigating the Dashboard',
    category: 'getting-started',
    tags: ['dashboard', 'navigation', 'home', 'menu', 'explore'],
    content: `Your Dashboard (/dashboard or /home) is your personal control center after logging in. Here's what you'll find:

• Welcome Banner — Shows your name, membership ID, and a greeting based on time of day
• Quick Stats — Community members, your posts, messages, and bookmarks
• Suggested Profiles — Scrollable cards of professionals to connect with
• Community Feed — Latest posts from the community with like and comment options
• Quick Actions — Grid of links to Create Post, Find Profiles, Browse Events, etc.

Top Navigation Bar:
Use the navigation bar at the top to access all major pages. On mobile, use the bottom navigation bar with 5 tabs: Home, Feed, Search, Messages, and Profile.

Other Key Pages:
• Search (/search) or Ctrl+K — Find members, articles, events, and tools
• Explore (/explore) — Discover trending topics and recommended content
• Guide (/guide) — Personal assistant dashboard with search and suggestions`,
    relatedArticleIds: ['gs-what-is-focuslinks', 'gs-create-profile'],
  },
  {
    id: 'gs-understanding-dashboard',
    title: 'Understanding the Platform',
    category: 'getting-started',
    tags: ['platform', 'features', 'overview', 'pages', 'sitemap'],
    content: `FocusLinks has 40+ pages organized into key sections:

Community & Social:
• Feed (/feed) — Real-time posts, likes, comments
• Community (/community) — Social hub with discussions and webinars
• Directory (/directory) — Searchable member database
• Connections (/connections) — Your professional network
• Messages (/messages) — Private and group messaging

Professional Tools:
• Labs (/labs) — AI clinical tools (OD-CAM, OptoScholar, IPD Measure, RAPD)
• OptoMap (/optomap) — Interactive global map of optometrists
• Academy (/academy/beyond-the-phoropter) — Educational courses

Career & Resources:
• Jobs (/jobs) — Job board for eye care positions
• Marketplace (/marketplace) — Buy/sell equipment and services
• Resources (/resources) — Clinical guidelines and reference materials
• Blog (/blog) & Articles (/articles) — Educational content

Events & Engagement:
• Events (/events) — Upcoming webinars and competitions
• Eye Q Arena (/event/eye-q-arena) — Knowledge championship
• Leaderboard (/leaderboard) — Top contributors ranking

Account & Support:
• Settings (/settings) — Account preferences
• Notifications (/notifications) — Activity alerts
• Bookmarks (/bookmarks) — Saved content
• Help Center (/help-center) — This page!`,
    relatedArticleIds: ['gs-what-is-focuslinks', 'gs-navigate'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PROFILE & DIRECTORY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'pd-edit-profile',
    title: 'Editing Your Profile',
    category: 'profile-directory',
    tags: ['profile', 'edit', 'update', 'settings', 'bio'],
    content: `You can edit your profile at any time after creating it.

From the Dashboard (/dashboard):
1. Find your profile summary card
2. Click "Edit Profile" to open the edit modal
3. Update your personal info: Name, Email, WhatsApp, LinkedIn, Role, Country, Location

For your public profile:
1. Navigate to My Profile (/my-profile)
2. Click "Edit Profile" 
3. Update your Title, Location, Description, Image URL, Bio, and Skills

Changes are saved automatically and reflected in the Directory immediately.

What to Keep Updated:
• Your current position and title
• Contact information (email, WhatsApp)
• Clinical skills and specialties
• Education and certifications
• Professional bio`,
    relatedArticleIds: ['gs-create-profile', 'pd-stand-out', 'pd-verification'],
    popular: true,
  },
  {
    id: 'pd-stand-out',
    title: 'Making Your Profile Stand Out',
    category: 'profile-directory',
    tags: ['profile', 'optimize', 'visibility', 'search', 'stand out'],
    content: `A well-crafted profile helps you get discovered by employers, collaborators, and peers. Here's how to stand out:

1. Professional Photo
Upload a clear, professional headshot. Profiles with photos get significantly more views and connections.

2. Compelling Bio
Write 2-3 sentences about who you are, your specialty, and what drives you. Be specific — instead of "I love optometry," try "Specializing in pediatric optometry and myopia management with 5 years of clinical experience."

3. List Specific Skills
Don't just write "optometry." List your specialties:
• Specialty contact lenses (scleral, ortho-k, hybrid)
• Low vision rehabilitation
• Pediatric optometry
• Dry eye management
• Glaucoma co-management
• Vision therapy

4. Education & Experience
Add your degrees, certifications, and work history. This builds credibility.

5. Stay Active
Post on the Feed, comment on discussions, and participate in events. Active members rank higher on the Leaderboard.

6. Get Verified
Apply for profile verification (/verify) to earn a verified badge that increases trust and visibility.`,
    relatedArticleIds: ['gs-create-profile', 'pd-edit-profile', 'pd-verification'],
  },
  {
    id: 'pd-directory-search',
    title: 'Finding Professionals in the Directory',
    category: 'profile-directory',
    tags: ['directory', 'search', 'find', 'members', 'professionals', 'filter'],
    content: `The Directory (/directory) is your gateway to finding eye care professionals worldwide.

How to Search:
1. Go to /directory
2. Use the search bar to search by name, skill, or location
3. Use filters to narrow results by:
   • Location and country
   • Clinical specialty
   • Role (student, practitioner, researcher, educator)
   • Skills and interests

Understanding Directory Cards:
Each member card shows:
• Profile photo or initials
• Name and professional title
• Location and country
• Key skills (tags)
• Verification badge (if verified)
• "View Profile" button to see full details

Viewing Full Profiles:
Click any member to see their complete profile with bio, education, experience, skills, interests, and contact information.

Tips:
• Use specific skill names to find specialists (e.g., "scleral lenses")
• Filter by country to find local professionals
• Visit the OptoMap (/optomap) to visually explore professionals by geographic location`,
    relatedArticleIds: ['gs-create-profile', 'pd-stand-out', 'om-find-clinic'],
    popular: true,
  },
  {
    id: 'pd-verification',
    title: 'Profile Verification',
    category: 'profile-directory',
    tags: ['verification', 'verified', 'badge', 'trust', 'identity'],
    content: `Profile verification confirms your professional identity and earns you a verified badge.

What Verification Gives You:
• Blue verified badge on your profile and directory listing
• Higher visibility in search results
• Increased trust from employers and collaborators
• Priority access to certain features

How to Get Verified:
1. Go to /verify
2. Submit your professional credentials
3. Our team reviews your application
4. Once approved, you'll receive the verified badge

Verification typically requires:
• A valid professional license or registration
• Institutional affiliation
• Professional email address from an eye care organization

Note: Verification is currently managed by our team. If you have questions, contact us via /contactus.`,
    relatedArticleIds: ['pd-edit-profile', 'pd-stand-out', 'ms-benefits'],
  },

  // ═══════════════════════════════════════════════════════════════
  // COMMUNITY & POSTS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cp-create-post',
    title: 'Creating a Post',
    category: 'community-posts',
    tags: ['post', 'create', 'feed', 'write', 'share', 'community'],
    content: `The Community Feed (/feed) is where you share ideas, clinical insights, and connect with other professionals.

How to Create a Post:
1. Navigate to /feed
2. Find the post composer at the top of the feed
3. Write your content in the text area
4. Optionally add:
   • Images (up to 4 per post) — Click the image icon or drag-and-drop
   • Hashtags — Use # to tag topics (e.g., #myopia #contactlenses)
   • Emoji — Click the emoji picker
   • Poll — Toggle the poll option to create a voting poll
5. Click "Post" to publish

Best Practices:
• Keep posts relevant to eye care, optometry, or related fields
• Use specific hashtags to help others find your content
• Add images for clinical cases or educational content
• Engage with comments on your posts
• Tag trending topics to increase visibility

Community Guidelines:
• Be respectful and professional
• Share evidence-based information
• Cite sources when sharing clinical findings
• Do not share patient-identifiable information
• Report inappropriate content using the report feature`,
    relatedArticleIds: ['cp-engage', 'cp-optometry-inspires', 'cp-trending'],
    popular: true,
  },
  {
    id: 'cp-engage',
    title: 'Engaging with the Community',
    category: 'community-posts',
    tags: ['engage', 'comment', 'like', 'share', 'interact', 'discussions'],
    content: `Being active in the community helps you build your network and establish your professional reputation.

Ways to Engage:

Like Posts
Click the heart icon on any post to show your appreciation. Posts with 5+ likes get a "Trending" badge.

Comment
Share your thoughts, ask questions, or provide clinical insights in the comments section. Meaningful comments drive discussions.

Share Images
Add clinical photos, diagrams, or educational images to your posts (up to 4 per post). Images are automatically compressed and encoded for sharing.

Use Hashtags
Include relevant hashtags in your posts (e.g., #glaucoma #pediatricoptometry). Clicking a hashtag takes you to /explore where you can see all related content.

Create Polls
Engage the community with polls on clinical topics. Toggle the poll option when composing a post.

Follow the Community Page
Visit /community for a broader view including trending topics, Academy webinars, and a browse section organized by topic icons.

Why Engagement Matters:
• Active members rank higher on the Leaderboard
• Your posts and comments increase your professional visibility
• Engaging with others is the best way to grow your network
• Employers and collaborators notice active community members`,
    relatedArticleIds: ['cp-create-post', 'cp-trending', 'cn-send-request'],
  },
  {
    id: 'cp-optometry-inspires',
    title: 'Optometry Inspires',
    category: 'community-posts',
    tags: ['optometry inspires', 'stories', 'inspiration', 'community', 'featured'],
    content: `Optometry Inspires is a community initiative on FocusLinks that highlights inspiring stories, achievements, and contributions from eye care professionals.

What You'll Find:
• Featured member stories and career journeys
• Clinical breakthroughs and case studies
• Community impact stories
• Student achievements and milestones
• Mentorship success stories

How to Participate:
• Share your story on the Feed with the hashtag #OptometryInspires
• Nominate a colleague who inspires you
• Share your clinical achievements and lessons learned

This initiative celebrates the diversity and impact of the global eye care community. Visit /community to explore featured content.`,
    relatedArticleIds: ['cp-create-post', 'cp-engage'],
  },
  {
    id: 'cp-trending',
    title: 'Trending Topics & Explore',
    category: 'community-posts',
    tags: ['trending', 'explore', 'discover', 'hashtags', 'topics', 'popular'],
    content: `The Explore page (/explore) and trending topics help you discover what's happening in the community.

Explore Page (/explore):
• Trending topics extracted from community hashtags
• Recommended members based on activity
• Popular discussions and posts
• Content organized by clinical categories

Trending Topics:
Found on the Home page and Feed, trending topics are hashtags that appear frequently in recent posts. Click any topic to see all related content.

How to Get on the Trending List:
• Use specific, relevant hashtags in your posts
• Create engaging content that others interact with
• Post consistently about topics you're passionate about
• Encourage others to use the same hashtags

Discover New Content:
The Explore page is refreshed regularly. Check back often to find new discussions, articles, and members to follow.`,
    relatedArticleIds: ['cp-create-post', 'cp-engage', 'gs-navigate'],
  },

  // ═══════════════════════════════════════════════════════════════
  // OPTOMAP
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'om-what-is-optomap',
    title: 'What is OptoMap?',
    category: 'optomap',
    tags: ['optomap', 'map', 'global', 'geography', 'professionals', 'worldwide'],
    content: `OptoMap (/optomap) is FocusLinks' interactive global map showing the geographic distribution of eye care professionals.

What You'll See:
• An interactive world map powered by Leaflet
• Color-coded markers for different professional types:
  🟢 Teal — Practitioners (optometrists, ophthalmologists)
  🟡 Amber — Students
  🟢 Emerald — Clinics and institutions
• Verified members have a special badge overlay on their marker

Features:
• Click any marker to see the member's name, title, location, and skills
• Zoom in/out and pan across the map
• View statistics including total members, countries represented, and top locations
• Filter by profile type (professionals, students, users)

Why It Matters:
OptoMap helps you visualize the global reach of the FocusLinks community and find professionals in specific regions. It's especially useful for:
• Finding local eye care professionals
• Understanding the community's global distribution
• Discovering professionals in underserved areas`,
    relatedArticleIds: ['om-find-clinic', 'pd-directory-search'],
    popular: true,
  },
  {
    id: 'om-find-clinic',
    title: 'Finding Optometrists Near You',
    category: 'optomap',
    tags: ['find', 'near me', 'local', 'location', 'search', 'clinic'],
    content: `Need to find an optometrist in a specific area? Here's how:

Using OptoMap:
1. Go to /optomap
2. Zoom into your desired region on the map
3. Click on markers to see professional details
4. Use the type filter to show only practitioners, students, or users

Using the Directory:
1. Go to /directory
2. Search by city, state, or country
3. Apply location filters to narrow results
4. View full profiles with contact information

Using Search:
1. Press Ctrl+K or go to /search
2. Type a location name
3. Results will include members from that area

Tips:
• Combine location with specialty (e.g., "Mumbai contact lenses")
• Check the profile for direct contact information
• Use Messages (/messages) to reach out privately`,
    relatedArticleIds: ['om-what-is-optomap', 'pd-directory-search'],
  },
  {
    id: 'om-add-clinic',
    title: 'Adding Your Clinic to the Map',
    category: 'optomap',
    tags: ['add', 'clinic', 'location', 'register', 'map'],
    content: `Your professional profile automatically appears on OptoMap based on the location information in your profile.

How to Ensure You're on the Map:
1. Make sure your profile includes accurate location data (city, state, country)
2. Go to /my-profile and edit your location if needed
3. Your marker will appear based on your listed location

If you don't see yourself on the map:
• Check that your profile is created (not just membership application)
• Verify your location is entered correctly
• Map data updates periodically — check back later

For Clinics and Institutions:
If you represent a clinic or institution, include the clinic name in your profile title or bio. This helps others identify organizational presences on the map.`,
    relatedArticleIds: ['om-what-is-optomap', 'pd-edit-profile'],
  },

  // ═══════════════════════════════════════════════════════════════
  // CONNECTIONS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cn-send-request',
    title: 'Sending & Accepting Connection Requests',
    category: 'connections',
    tags: ['connect', 'request', 'accept', 'network', 'friend', 'colleague'],
    content: `Building your professional network on FocusLinks helps you collaborate, learn, and grow your career.

How to Connect:
1. Visit a member's profile through the Directory (/directory), Feed (/feed), or Leaderboard (/leaderboard)
2. Click "Connect" or the message icon on their profile
3. Send a personalized message with your connection request

Accepting Requests:
When someone sends you a connection request:
• You'll see it in your notifications
• Review the sender's profile
• Accept or decline the request

Connection Benefits:
• Exchange direct messages with your connections
• See each other's posts and activity
• Build a trusted professional network
• Get recommended for opportunities based on your network

Tips for Growing Your Network:
• Connect with professionals in your specialty area
• Engage with community posts to get noticed
• Personalize your connection requests
• Join events and webinars to meet people
• Participate in group discussions

Students: FocusLinks is your bridge to the professional world. Connect with experienced professionals to find mentors, gain visibility, and start building relationships before graduating.`,
    relatedArticleIds: ['cp-engage', 'msg-direct-message', 'pd-directory-search'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // MESSAGES
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'msg-direct-message',
    title: 'Using Direct Messages',
    category: 'messages',
    tags: ['message', 'DM', 'direct', 'private', 'chat', 'conversation'],
    content: `The Messages feature (/messages) enables private conversations between FocusLinks members.

Starting a Conversation:
1. Visit a member's profile
2. Click the message icon
3. Type your message and press Enter or click Send

Managing Conversations:
• Your conversation list appears in the left sidebar
• Search conversations by name using the search bar
• Click any conversation to view and respond to messages
• Conversations are automatically saved

Message Features:
• Real-time message sending
• Timestamps on all messages
• Scroll to bottom for latest messages
• Mobile-responsive layout with full-screen chat view

On Mobile:
• Tap a conversation from the list to open it
• Use the back button to return to the conversation list
• The message input auto-adjusts for comfortable typing

All messages are stored locally in your browser. They persist across sessions.`,
    relatedArticleIds: ['msg-group-chat', 'cn-send-request'],
    popular: true,
  },
  {
    id: 'msg-group-chat',
    title: 'Creating & Using Group Chats',
    category: 'messages',
    tags: ['group', 'chat', 'team', 'collaboration', 'create group'],
    content: `Group chats let you communicate with multiple members at once — perfect for study groups, event committees, or clinical case discussions.

Creating a Group:
1. Go to /messages
2. Click the "+" button in the sidebar (desktop) or the FAB button (mobile)
3. Select "New Group"
4. Fill in:
   • Group name (required)
   • Description (optional, max 200 characters)
   • Color theme — Choose from 8 preset gradient colors
5. Click "Create Group"

Managing Your Group:
• The group creator sees the admin controls
• Group conversations appear with a users icon
• Members are displayed in the chat header
• System messages show when the group was created

Group Chat Features:
• All members can send messages
• Group avatar displays initials with chosen gradient
• Mobile-responsive full-screen layout
• Messages persist in localStorage across sessions

Tips:
• Use descriptive group names (e.g., "Myopia Management Study Group")
• Add a description to explain the group's purpose
• Keep discussions professional and on-topic`,
    relatedArticleIds: ['msg-direct-message', 'cn-send-request'],
  },

  // ═══════════════════════════════════════════════════════════════
  // MEMBERSHIP
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ms-benefits',
    title: 'Membership Tiers & Benefits',
    category: 'membership',
    tags: ['membership', 'benefits', 'tiers', 'features', 'free', 'premium'],
    content: `FocusLinks is a non-commercial, passion-driven platform. All core features are completely free.

What Free Members Get:
• Professional profile in the global Directory
• Access to the Community Feed (post, like, comment)
• All clinical Labs tools (OD-CAM, OptoScholar, IPD Measure, RAPD)
• Event registration (webinars, competitions)
• Job Board browsing and applications
• Marketplace access
• Messaging with connections
• Academy educational content
• OptoMap geographic visibility
• Leaderboard ranking

Official Membership Benefits:
• Verified profile badge
• Priority event registration
• Enhanced Directory visibility
• Virtual ID card
• Ability to create and publish articles
• Advanced community features

How to Become a Member:
Visit /membership-application to register. Our team reviews applications and approves qualified eye care professionals and students.

Is there a paid tier?
Currently, FocusLinks is entirely free. We may introduce premium features in the future, but core networking, clinical tools, and community features will always remain free.`,
    relatedArticleIds: ['gs-what-is-focuslinks', 'gs-create-profile', 'ms-apply'],
    popular: true,
  },
  {
    id: 'ms-apply',
    title: 'How to Apply for Membership',
    category: 'membership',
    tags: ['apply', 'register', 'signup', 'membership application', 'join'],
    content: `Joining FocusLinks is simple and free. Here's how to apply:

Step 1: Submit Your Application
Go to /membership-application and fill out the form with:
• Full name
• Email address
• Phone number
• Profession (optometrist, student, researcher, etc.)
• College/Institution
• Country and city
• Experience level
• Specialization
• LinkedIn profile (optional)

Step 2: Review
Our team reviews your application. This typically takes 3-5 business days.

Step 3: Create Your Profile
Once approved, you'll receive a confirmation. Go to /create-profile to set up your professional profile.

Step 4: Start Exploring
Browse the Directory, join discussions, try the Labs tools, and register for events!

Who Can Join:
• Optometrists and ophthalmologists
• Optometry students
• Eye care researchers and educators
• Industry professionals in eye care
• Anyone passionate about advancing global eye care

Questions?
Contact us at /contactus if you have questions about the application process.`,
    relatedArticleIds: ['ms-benefits', 'gs-create-profile', 'pd-verification'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LABS & TOOLS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'lt-overview',
    title: 'FocusLinks Labs Overview',
    category: 'labs-tools',
    tags: ['labs', 'tools', 'AI', 'clinical', 'overview', 'suite'],
    content: `FocusLinks Labs (/labs) is our suite of AI-powered and clinical tools designed for modern eye care professionals.

Currently Available Tools:

1. OD-CAM (Ocular Disease Camera & Augmentation Model)
   Path: /labs/od-cam
   Our flagship AI vision model that simulates various visual impairments in real-time, allowing practitioners and students to see the world through the patient's eyes.

2. OptoScholar
   Path: /labs/optoscholar
   A specialized clinical research engine indexing over 1 million peer-reviewed articles. Find research papers, clinical guidelines, and evidence-based studies.

3. IPD Measure Pro
   Path: /labs/ipd-measure
   Uses AI and your webcam to measure interpupillary distance (IPD) with clinical accuracy.

4. RAPD Simulator
   Path: /labs/rapd-simulator
   Practice the swinging flashlight test virtually. Detect and grade Relative Afferent Pupillary Defects without a real patient.

All tools are free for registered members. Simply log in and start using them.

Future Tools:
We're actively developing additional clinical tools. Stay tuned for updates via the Feed and Events pages.`,
    relatedArticleIds: ['lt-odcam', 'lt-optoscholar', 'lt-ipd', 'lt-rapd'],
    popular: true,
  },
  {
    id: 'lt-odcam',
    title: 'Using OD-CAM',
    category: 'labs-tools',
    tags: ['odcam', 'OD CAM', 'vision simulator', 'visual impairment', 'empathy', 'AI'],
    content: `OD-CAM (Ocular Disease Camera & Augmentation Model) is FocusLinks' flagship AI tool, powered by Focus.Ai V5.5.

What It Does:
OD-CAM simulates various visual impairments in real-time using your device's camera. It allows practitioners, students, and caregivers to experience the world as a patient would.

Supported Conditions:
• Cataracts — Cloudy, blurred vision with reduced contrast
• Glaucoma — Peripheral vision loss (tunnel vision)
• Macular Degeneration — Central vision loss and distortion
• Diabetic Retinopathy — Blurred vision, floaters, dark spots
• And more visual conditions

How to Use:
1. Go to /labs/od-cam
2. Grant camera permission when prompted
3. Select a visual condition from the options
4. Point your camera at your surroundings
5. See the simulated view in real-time

Use Cases:
• Clinical empathy training for students
• Patient education — show family members what the patient sees
• Understanding disease progression
• Classroom demonstrations

Note: OD-CAM requires camera access. Works best on devices with good cameras in well-lit environments.`,
    relatedArticleIds: ['lt-overview', 'lt-optoscholar'],
    popular: true,
  },
  {
    id: 'lt-optoscholar',
    title: 'Using OptoScholar',
    category: 'labs-tools',
    tags: ['optoscholar', 'research', 'papers', 'scholar', 'search', 'articles'],
    content: `OptoScholar (/labs/optoscholar) is a specialized clinical research engine built for optometry professionals.

Features:
• Indexes over 1 million peer-reviewed articles
• Search by topic, keyword, or clinical question
• Filter by publication date, journal, and study type
• Get summaries of relevant findings
• Access clinical guidelines and evidence-based recommendations

How to Use:
1. Go to /labs/optoscholar
2. Enter your research query in the search bar
3. Review results with titles, abstracts, and relevance scores
4. Click on articles for more details
5. Save or bookmark important findings

Use Cases:
• Literature reviews for clinical decisions
• Research for academic papers and presentations
• Staying current with the latest evidence
• Finding clinical guidelines for specific conditions
• Student research projects

OptoScholar helps bridge the gap between research and practice, making evidence-based optometry more accessible.`,
    relatedArticleIds: ['lt-overview', 'lt-odcam'],
  },
  {
    id: 'lt-ipd',
    title: 'Using IPD Measure Pro',
    category: 'labs-tools',
    tags: ['IPD', 'measure', 'interpupillary', 'distance', 'webcam', 'tool'],
    content: `IPD Measure Pro (/labs/ipd-measure) measures interpupillary distance (IPD) using your device's camera and AI.

How It Works:
The tool uses facial landmark detection to identify the centers of your pupils and calculate the distance between them with high clinical accuracy.

How to Use:
1. Go to /labs/ipd-measure
2. Grant camera permission when prompted
3. Position your face within the on-screen guide
4. Follow the instructions (keep still, face forward)
5. The tool will capture and calculate your IPD

Best Practices for Accurate Results:
• Use a well-lit room (avoid direct overhead lighting)
• Face the camera directly, not at an angle
• Remove glasses if they cause reflections
• Keep a neutral expression
• Hold the device at arm's length

IPD Ranges:
• Average adult IPD: 58-68 mm
• Pediatric IPD: 43-58 mm (age-dependent)

Use Cases:
• Frame selection and fitting
• Contact lens fitting calculations
• Optical dispensing
• Clinical measurements`,
    relatedArticleIds: ['lt-overview', 'lt-odcam'],
  },
  {
    id: 'lt-rapd',
    title: 'Using the RAPD Simulator',
    category: 'labs-tools',
    tags: ['RAPD', 'simulator', 'pupillary', 'defect', 'flashlight', 'training'],
    content: `The RAPD Simulator (/labs/rapd-simulator) is an educational tool for practicing the swinging flashlight test.

What It Simulates:
The tool presents virtual patient scenarios with varying degrees of Relative Afferent Pupillary Defect (RAPD). You practice:
• The swinging flashlight technique
• Detecting pupillary responses
• Grading the severity of RAPD
• Identifying affected vs. unaffected eyes

How to Use:
1. Go to /labs/rapd-simulator
2. Select a scenario or difficulty level
3. Perform the virtual swinging flashlight test
4. Observe pupillary reactions
5. Grade the RAPD based on your observations
6. Compare your assessment with the correct answer

Why It's Useful:
• Students can practice without needing real patients
• Learn to detect subtle RAPD signs
• Understand the grading scale (0 to 4+)
• Build confidence before clinical rotations
• Great for exam preparation

The RAPD Simulator is completely free and can be used as many times as you need.`,
    relatedArticleIds: ['lt-overview', 'lt-odcam'],
  },

  // ═══════════════════════════════════════════════════════════════
  // EVENTS & WEBINARS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ew-overview',
    title: 'Events & Webinars Overview',
    category: 'events-webinars',
    tags: ['events', 'webinars', 'workshops', 'schedule', 'upcoming'],
    content: `FocusLinks hosts a variety of events for the global eye care community.

Types of Events:
• International Webinars — Expert-led sessions on clinical topics
• Eye Q Arena — Optometry knowledge championship competition
• Clinical Workshops — Hands-on learning experiences
• Community Meetups — Networking and discussion sessions

Finding Events:
• Visit /events to see all upcoming and past events
• Check the Community page (/community) for highlighted webinars
• Watch for announcements on the Feed (/feed)
• Check your notifications for event reminders

Event Features:
• Online registration
• Calendar integration
• Session recordings (for most webinars)
• Participant rankings (for competitions)
• Certificates of participation (select events)`,
    relatedArticleIds: ['ew-register', 'ew-eye-q-arena', 'ew-booked'],
  },
  {
    id: 'ew-register',
    title: 'Registering for Events',
    category: 'events-webinars',
    tags: ['register', 'sign up', 'enroll', 'RSVP', 'book', 'event'],
    content: `Registering for events on FocusLinks is simple:

How to Register:
1. Go to /events
2. Find the event you want to attend
3. Click "Register"
4. Fill in the required information
5. Confirm your registration

After Registering:
• You'll see the event in your Booked page (/booked)
• You'll receive a confirmation notification
• Joining links are typically sent via email and available on the Booked page
• You'll get reminder notifications before the event

Managing Registrations:
• Visit /booked to see all your registered events
• Access joining links from the Booked page
• View event details and schedules

Webinar Registration:
For Academy webinars, you can also register through the Community page's webinar section. The process is the same.

Note: Some events may have limited capacity. Register early to secure your spot!`,
    relatedArticleIds: ['ew-overview', 'ew-booked', 'ew-eye-q-arena'],
    popular: true,
  },
  {
    id: 'ew-eye-q-arena',
    title: 'Eye Q Arena — Knowledge Championship',
    category: 'events-webinars',
    tags: ['eye q arena', 'competition', 'quiz', 'championship', 'knowledge', 'contest'],
    content: `The Eye Q Arena (/event/eye-q-arena) is FocusLinks' flagship international optometry knowledge championship.

What It Is:
A competitive quiz event that brings together optometry students and professionals from 15+ countries to test their clinical knowledge.

Features:
• Multiple knowledge modules covering different clinical areas
• Timed questions with scoring
• Participant rankings by country and globally
• Real-time leaderboard during the competition
• Results with scores and completion times

Viewing Results:
Visit /event/eye-q-arena to see:
• Overall rankings and scores
• Participant details (name, country, score, time)
• Country-wise performance breakdown
• Module-specific results

Past Editions:
Results from previous editions are archived and publicly viewable. See how participants from your country performed!

How to Participate:
Registration for upcoming Eye Q Arena events is announced on the Events page (/events) and the Community Feed (/feed). Register early — spots fill up fast!`,
    relatedArticleIds: ['ew-overview', 'ew-register'],
    popular: true,
  },
  {
    id: 'ew-booked',
    title: 'Managing Booked Events',
    category: 'events-webinars',
    tags: ['booked', 'registered', 'my events', 'calendar', 'schedule'],
    content: `The Booked page (/booked) is your personal event management center.

What You'll See:
• A list of all events and webinars you've registered for
• Event details including date, time, and description
• Joining links for online events
• Registration status and confirmations

How to Access:
Navigate to /booked or find the link in your notifications.

Tips:
• Check /booked before an event to find the joining link
• Add events to your personal calendar using the details provided
• If you can't attend, consider reviewing recordings if available`,
    relatedArticleIds: ['ew-register', 'ew-overview'],
  },

  // ═══════════════════════════════════════════════════════════════
  // JOBS & MARKETPLACE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'jm-job-board',
    title: 'Using the Job Board',
    category: 'jobs-marketplace',
    tags: ['jobs', 'career', 'employment', 'apply', 'job board', 'opportunities'],
    content: `The Job Board (/jobs) connects eye care professionals with career opportunities worldwide.

Browsing Jobs:
1. Go to /jobs
2. Browse the list of available positions
3. Use search and filters to narrow results by:
   • Location and country
   • Specialty/role
   • Job type (full-time, part-time, locum, etc.)
   • Experience level

Applying for Jobs:
1. Find a position that matches your skills
2. Click "Apply"
3. Your FocusLinks profile will be shared with the employer
4. Ensure your profile is complete and up-to-date

Tips for Job Seekers:
• Keep your profile current with latest experience and skills
• Add a professional photo to make a strong first impression
• Write a detailed bio highlighting relevant experience
• List specific clinical skills that match the jobs you're targeting
• Check back regularly for new listings

For Employers:
Organizations, clinics, hospitals, and practices can post job openings. Contact us via /contactus to set up an employer account.`,
    relatedArticleIds: ['jm-marketplace', 'pd-stand-out'],
    popular: true,
  },
  {
    id: 'jm-marketplace',
    title: 'Using the Marketplace',
    category: 'jobs-marketplace',
    tags: ['marketplace', 'buy', 'sell', 'equipment', 'instruments', 'services'],
    content: `The Marketplace (/marketplace) is where you can buy and sell optometry-related products and services.

What You Can Find:
• Ophthalmic equipment and instruments
• Contact lenses (trial sets, specialty lenses)
• Diagnostic tools and devices
• Optical dispensing supplies
• Practice management software
• Professional services and consulting
• Educational materials and textbooks

How It Works:
1. Go to /marketplace
2. Browse listings by category
3. View details, pricing, and seller information
4. Contact sellers through the platform

For Sellers:
If you want to list products or services:
• Create a detailed listing with photos and descriptions
• Set fair pricing
• Respond promptly to inquiries
• Maintain professional communication

Safety Tips:
• Verify seller credentials when possible
• Use secure payment methods
• Read descriptions carefully before purchasing
• Report suspicious listings to /contactus`,
    relatedArticleIds: ['jm-job-board', 'cp-create-post'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ACADEMY
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ac-overview',
    title: 'FocusLinks Academy',
    category: 'academy',
    tags: ['academy', 'courses', 'learning', 'education', 'beyond the phoropter'],
    content: `The FocusLinks Academy offers structured educational content for eye care professionals at all stages of their career.

Current Courses:

Beyond the Phoropter (/academy/beyond-the-phoropter)
Our flagship course covering advanced clinical topics with:
• Structured learning modules
• Clear learning outcomes
• Self-assessment tools
• Progress tracking

Course Features:
• Learn at your own pace
• Access from any device
• Track your progress across modules
• Earn recognition for course completion

Educational Resources:
In addition to formal courses, the Academy section includes:
• Recorded webinar content
• Clinical case discussions
• Expert-led sessions from international events
• Research summaries and evidence-based content

Future Plans:
We're developing additional courses covering:
• Specialty contact lens fitting
• Pediatric optometry
• Low vision rehabilitation
• Clinical practice management
• Research methodology

Stay tuned for updates via the Feed and Events pages!`,
    relatedArticleIds: ['ew-overview', 'lt-overview'],
    popular: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // ACCOUNT & SETTINGS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'as-privacy',
    title: 'Privacy & Security',
    category: 'account-settings',
    tags: ['privacy', 'security', 'data', 'protection', 'settings'],
    content: `FocusLinks takes your privacy seriously. Here's what you need to know:

Privacy Policy:
Our full Privacy Policy is available at /privacy. Key points:
• We collect only the information necessary to provide our services
• Your profile information is visible to other members in the Directory
• We never sell your personal data to third parties
• You can request data deletion at any time

Profile Visibility:
• Your public profile is visible to all visitors
• Contact details (email, phone) are visible on your profile
• You can edit what's displayed in your profile settings

Data Security:
• All data is transmitted securely
• Account access requires authentication
• We use industry-standard security practices

Your Rights:
• View your data at any time in Settings
• Edit or delete your information
• Request account deletion via /contactus
• Report privacy concerns to our support team

For Organizations:
If your organization has specific privacy requirements or data processing agreements, contact us via /contactus to discuss.`,
    relatedArticleIds: ['as-notifications', 'as-account-management', 'as-terms'],
  },
  {
    id: 'as-notifications',
    title: 'Notification Settings',
    category: 'account-settings',
    tags: ['notifications', 'alerts', 'settings', 'preferences', 'email'],
    content: `Stay updated on community activity with customizable notifications.

Types of Notifications:
• New followers and connection requests
• Messages and group chat updates
• Event reminders and registration confirmations
• Engagement on your posts (likes, comments)
• Profile views
• System announcements

Managing Notifications:
1. Go to /settings
2. Find the notification preferences section
3. Toggle notifications on/off by category
4. Choose delivery method (in-app, email)

Notification Page (/notifications):
View all your recent notifications in one place. Notifications are grouped by type and show:
• Unread count
• Activity details
• Quick links to relevant content
• Mark all as read option

Tips:
• Enable event notifications so you don't miss webinars
• Keep message notifications on for timely responses
• Use "Mark as read" to keep your notification center clean
• Check notifications regularly for community activity`,
    relatedArticleIds: ['as-privacy', 'as-account-management'],
  },
  {
    id: 'as-account-management',
    title: 'Managing Your Account',
    category: 'account-settings',
    tags: ['account', 'manage', 'delete', 'settings', 'preferences'],
    content: `Your account settings give you control over your FocusLinks experience.

Accessing Settings:
Go to /settings or find the settings option in your profile menu.

Available Settings:
• Profile Information — Edit name, email, contact details
• Public Profile — Update title, bio, skills, description
• Notification Preferences — Customize alerts and notifications
• Privacy Controls — Manage profile visibility and data
• Connected Accounts — Link LinkedIn and other services
• Appearance — Dark mode toggle

Account Data:
Your account data is stored securely. You can view and edit all your information from the Settings page.

Need to Delete Your Account?
If you wish to delete your account and all associated data:
1. Contact us via /contactus
2. Request account deletion
3. Our team will process your request within 7 business days
4. All your data will be permanently removed

Note: Account deletion is irreversible. Consider exporting any content you want to keep before requesting deletion.`,
    relatedArticleIds: ['as-privacy', 'as-notifications', 'pd-edit-profile'],
  },
  {
    id: 'as-terms',
    title: 'Terms of Service',
    category: 'account-settings',
    tags: ['terms', 'service', 'rules', 'guidelines', 'legal'],
    content: `Our Terms of Service are available at /terms. Here's a summary:

By using FocusLinks, you agree to:
• Provide accurate information in your profile
• Use the platform professionally and respectfully
• Not share patient-identifiable information
• Not spam or harass other members
• Not use the platform for commercial solicitation without authorization
• Respect intellectual property rights

Community Guidelines:
• Be professional and courteous
• Share evidence-based information
• Cite sources when sharing clinical data
• Report inappropriate content
• Support fellow community members

Content Ownership:
You retain ownership of content you create (posts, articles, comments). By posting, you grant FocusLinks a license to display your content on the platform.

Reporting Issues:
If you see content that violates our terms or community guidelines:
• Use the report feature on the content
• Contact us at /contactus
• We review all reports promptly`,
    relatedArticleIds: ['as-privacy', 'cp-create-post'],
  },
];

// ─── Helper Functions ──────────────────────────────────────────────

export function getArticlesByCategory(category: HelpCategory): HelpArticle[] {
  return helpArticles.filter(a => a.category === category);
}

export function getPopularArticles(): HelpArticle[] {
  return helpArticles.filter(a => a.popular);
}

export function getArticleById(id: string): HelpArticle | undefined {
  return helpArticles.find(a => a.id === id);
}

export function searchArticles(query: string): HelpArticle[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return helpArticles.filter(article => {
    const haystack = `${article.title} ${article.content} ${article.tags.join(' ')}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getRelatedArticles(article: HelpArticle): HelpArticle[] {
  return article.relatedArticleIds
    .map(id => helpArticles.find(a => a.id === id))
    .filter((a): a is HelpArticle => a !== undefined);
}

export function getCategoryInfo(categoryId: HelpCategory): HelpCategoryInfo | undefined {
  return helpCategories.find(c => c.id === categoryId);
}
