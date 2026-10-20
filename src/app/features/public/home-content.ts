export const COMMUNITY_LINKS = {
  reviewsUrl:
    "https://www.trustpilot.com/review/fearlesscommunicationclub.com?page=2",
  youtubeUrl: "https://www.youtube.com/@BhuvaneswariSistala",
} as const;

// Public contact details supplied by FCC. Placeholder email intentionally omitted.
export const COMMUNITY_CONTACT = {
  phoneLabel: "93900 00479",
  phoneUrl: "tel:9390000479",
} as const;

export const SOCIAL_LINKS = [
  { icon: "youtube", label: "YouTube", url: COMMUNITY_LINKS.youtubeUrl },
  {
    icon: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/bhuvaneswari-sistala-0745092b7/",
  },
  {
    icon: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61556675529122",
  },
  {
    icon: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/bhuvaneswarisistala/",
  },
] as const;

// Community offerings confirmed by FCC and the supplied learner reviews.
export const LEARNING_PATHS = [
  {
    title: "Spoken English courses",
    description:
      "Learn through a natural, gamified approach that connects English to everyday situations.",
  },
  {
    title: "Live classes",
    description:
      "Put ideas into words through live sessions, group discussions, and guided speaking practice.",
  },
  {
    title: "Community practice",
    description:
      "Learn alongside other English speakers, share your progress, and encourage each other to keep going.",
  },
] as const;

export const AUDIENCES = [
  {
    title: "Students & job seekers",
    description: "Express your ideas more confidently in interviews.",
  },
  {
    title: "Stay-at-home parents",
    description: "Build confidence for a fresh start.",
  },
  {
    title: "Working professionals",
    description: "Speak up in meetings and everyday work conversations.",
  },
  {
    title: "Teachers & trainers",
    description: "Explain ideas clearly and connect with your audience.",
  },
  {
    title: "Older learners",
    description: "Connect with English-speaking grandchildren and family.",
  },
] as const;

// Selected community reviews, checked against the supplied Trustpilot page on 2 October 2026.
// Summaries are explicitly labelled; only the short Lalitha excerpt is a direct quotation.
export const LEARNER_REVIEWS = [
  {
    name: "Lalitha Addanki",
    rating: 5,
    date: "8 July 2025",
    datetime: "2025-07-08",
    quote: "Now I am not scared to speak",
    takeaway: null,
    summary:
      "Lalitha credits live sessions, games, and regular practice with helping her speak more confidently.",
    url: "https://www.trustpilot.com/reviews/686d2e00195f123c68d99564",
  },
  {
    name: "Lakshmi Sailaja Yalakala",
    rating: 5,
    date: "12 July 2025",
    datetime: "2025-07-12",
    quote: null,
    takeaway: "A new start in her forties",
    summary:
      "Sailaja joined after a webinar and describes earning a Confident Speaker Award.",
    url: "https://www.trustpilot.com/reviews/6872b488b082da37d9714b0b",
  },
  {
    name: "prasangi sreenwas",
    rating: 4,
    date: "25 July 2025",
    datetime: "2025-07-25",
    quote: null,
    takeaway: "Learning through conversation",
    summary:
      "Prasangi highlights group discussions, breakout rooms, and Bhuvana’s natural teaching approach.",
    url: "https://www.trustpilot.com/reviews/68830abea26ec18e9512d8c6",
  },
] as const;
