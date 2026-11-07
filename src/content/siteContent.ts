// ============================================================
// Site Content — Rebuild the Youth Foundation
// Updated: October 2026
// All content reflects information supplied by the foundation.
// Sections marked TODO still require confirmation before launch.
// ============================================================

import type { NavLink, HostProfile } from '@/types'

// ── Organisation identifiers ──────────────────────────────────
export const orgName    = 'Rebuild the Youth Foundation'
export const orgTagline = 'Restoring Lives. Building Futures. Guided by Faith.'

// ── Event identifiers ─────────────────────────────────────────
export const eventTitle = 'The Rebuild Hangout 2026'
export const eventTheme = 'Beyond the Message'
export const eventYear  = '2026'

// Confirmed event details — December 5, 2026 / FMC OWO, ARD LOUNGE
export const eventDate          = 'December 5, 2026'
export const eventTime          = '9:00 AM'
export const eventVenuePhysical = 'FMC OWO, ARD LOUNGE'
export const eventVenueVirtual  = 'Online via Live Stream'
/** ISO date string used by the countdown timer */
export const eventDateISO = '2026-12-05T09:00:00'

// ── Navigation ────────────────────────────────────────────────
export const navLinks: NavLink[] = [
  { label: 'About',    href: '#about'    },
  { label: 'Vision',   href: '#vision'   },
  { label: 'Why?',     href: '#why'      },
  { label: 'Impact',   href: '#impact'   },
  { label: 'Founders', href: '#hosts'    },
  { label: 'Event',    href: '#event'    },
  { label: 'Register', href: '#register' },
]

// ============================================================
// About Section
// ============================================================
export const aboutContent = {
  heading: 'A Vision to Rebuild. A Generation to Transform.',
  paragraphs: [
    `Rebuild the Youth Foundation exists because young people deserve more than a moment of inspiration. They deserve the opportunity for lasting transformation. Co-founded by Dr. Barnabas Adefemi and Mrs. Moyosola Adefemi, the foundation is built on a shared conviction that faith, character, and community can change the direction of a generation.`,
    `The Rebuild Hangout 2026 marks the beginning of that vision taking shape. It is a welcoming space for young people to connect, reflect, ask honest questions, and discover new perspectives. This gathering is more than an event. It is an invitation to rethink how we live, relate to others, and respond to the world around us.`,
    `Our theme, "Beyond the Message," expresses the heart of what we are building: a desire to move beyond words and moments of inspiration into the choices, attitudes, and actions that shape everyday life. Rooted in Christ and open to people from every background, the Rebuild Hangout invites us to explore faith not merely as something we hear, but as something that transforms how we live.`,
    `This is the beginning of a journey, a vision to inspire change, nurture purpose, and help build a generation ready to make a meaningful difference in their families, communities, and spheres of influence.`,
  ],
  pullQuote: '"Because the message matters most when it becomes a way of life."',
  // Co-founder statement — displayed in the About section and Impact section
  coFounderStatement: `Rebuild the Youth Foundation was co-founded by Dr. Barnabas Adefemi and Mrs. Moyosola Adefemi out of a shared commitment to empowering young people, promoting positive values, encouraging personal development, and creating opportunities for meaningful community impact.`,
}

// ============================================================
// Vision & Mission
// ============================================================
export const visionMission = {
  vision: {
    icon: '✦',
    heading: 'Our Vision',
    body: `A generation of young people who are not only transformed by the message of Christ but are actively living it out in every sphere, family, career, community, and culture. We envision a movement that outlasts any single gathering and shapes lives for years to come.`,
  },
  mission: {
    icon: '✦',
    heading: 'Our Mission',
    body: `To create environments where young people can encounter God authentically, build meaningful community, and be equipped with practical tools to live faithfully and purposefully. We pursue this through gatherings, mentorship, educational outreach, and intentional follow-up. One of our major missions is to help the youth live a health conscious life.`,
  },
}

// ============================================================
// Why "Beyond the Message"
// ============================================================
export const whyContent = {
  heading: 'Why "Beyond the Message?"',
  intro: `The theme is not a critique of preaching. It is an invitation. Every great message plants a seed. But seeds need soil, water, and time. This year, we are creating the conditions for what was planted to actually grow.`,
  pullQuote: '"A word received is only the beginning. The question is what you do when you walk out the door."',
  points: [
    {
      icon: '🌱',
      title: 'From Inspiration to Application',
      body: 'We bridge the gap between the moment of inspiration and the daily practice of living it out.',
    },
    {
      icon: '🤝',
      title: 'Community Over Consumption',
      body: 'Faith was never meant to be experienced alone. We build spaces where genuine relationships form and last.',
    },
    {
      icon: '🔥',
      title: 'Sustained Transformation',
      body: 'One gathering can spark a fire. The Rebuild movement exists to keep that fire burning long after the event ends.',
    },
    {
      icon: '🌍',
      title: 'A Faith for the Real World',
      body: 'We equip young people to carry their convictions into workplaces, homes, and communities, not just places of worship.',
    },
  ],
}

// ============================================================
// Impact & Initiatives
// Confirmed achievements supplied by the foundation.
// ============================================================
export const impactContent = {
  sectionLabel: 'Our Impact',
  heading: 'Making a Difference',
  subheading: 'Reaching young people where they are.',
  items: [
    {
      id: 'book-distribution',
      stat: '200+',
      statLabel: 'Hard Copies Distributed',
      title: 'WHY HARM YOUR BODY',
      description: `More than 200 hard copies of WHY HARM YOUR BODY were distributed free of charge to young people as part of efforts to promote awareness, encourage informed choices, and support youth wellbeing.`,
      note: 'Free distribution to young people',
      icon: '📚',
    },
  ],
}

// ============================================================
// Founders / Hosts
// Biographies supplied by the foundation — October 2026.
// Portrait images: see imageConfig.ts — supply files to activate.
// ============================================================
export const hosts: HostProfile[] = [
  {
    id: 'dr-adefemi',
    name: 'Dr. Barnabas Adefemi',
    title: 'Co-Founder',
    initials: 'DA',
    photo: '/images/hosts/dr-adefemi.jpg?v=8',
    bio: `Dr. Barnabas Adefemi is the Co-Founder and Chief Executive Officer of Rebuild the Youth Foundation (RTYF), a Senior Resident Doctor in Family Medicine, youth advocate and public health enthusiast.

A recipient of a Presidential Honour and two Governor's Awards, he is also an Associate Pastor in a Bible-believing church. He has held several leadership positions within and outside the church and is passionate about community development, youth mentorship, character development and nation-building initiatives.`,
  },
  {
    id: 'mrs-adefemi',
    name: 'Mrs. Moyosola Adefemi',
    title: 'Co-Founder',
    initials: 'MA',
    photo: '/images/hosts/mrs-adefemi.jpg?v=8',
    bio: `Mrs. Moyosola Adefemi is the Co-Founder and Executive Director of Rebuild the Youth Foundation (RTYF), a public health enthusiast, counsellor, youth advocate and public speaker.

She also serves as an Associate Coordinator in a Bible-believing church and has held various leadership positions. She is passionate about youth mentorship, character building and community development.`,
  },
]

// ============================================================
// Event Details
// Confirmed: December 5, 2026 — FMC OWO, ARD LOUNGE
// ============================================================
export const eventDetails = {
  physical: {
    icon: '📍',
    heading: 'Physical Attendance',
    label: 'In Person',
    venue: 'FMC OWO, ARD LOUNGE',
    date: 'December 5, 2026',
    time: '9:00 AM',
    description: 'Join us in person for the full Rebuild Hangout 2026 experience. Enjoy life-transforming sessions, capacity building, legal literacy, health and relationship talks, interactive sessions, and ICT.',
    cta: 'Register for Physical',
  },
  virtual: {
    icon: '🌐',
    heading: 'Virtual Attendance',
    label: 'Online',
    venue: 'Live Stream Link TBA',
    date: 'December 5, 2026',
    time: '9:00 AM',
    description: 'Joining us from a distance? Stream every session live and be part of the movement from wherever you are in the world.',
    cta: 'Register for Virtual',
  },
}

// ============================================================
// Footer
// TODO: Replace null values with confirmed URLs and email.
// ============================================================
export const footerContent = {
  copyright: `© ${eventYear} Rebuild the Youth Foundation. All rights reserved.`,
  /** Contact email for enquiries */
  contactEmail: 'bringthembackhomeinitiative@gmail.com',
  /** Social media URLs */
  socialFacebook: 'https://www.facebook.com/profile.php?id=61560681532109',
  socialTwitter:  'https://x.com/Rebuild1990',
  socialYouTube:  'https://www.youtube.com/@rebuildtheyouthfoundation5875',
}
