export const image = (id: string) => `/images/${id}.png`;
export const siteConfig = {
  name: "Atilade Wasilat",
  projectBrand: "Atilade Wasilat",
  hero: {
    title: "Hi, I'm Wasilah",
    description:
      "I create, coordinate and promote experiences that connect people.",
  },
  specialties: ["Marketing", "Social Media", "Events"],
  availability: "Available for projects",
  timezone: "auto",
  location: "auto",
  wallpaper: {
    desktop: "/images/floral-wallpaper-1672.webp",
    mobile: "/images/floral-wallpaper-640.webp",
    tablet: "/images/floral-wallpaper-1024.webp",
    original: "/images/floral-wallpaper-1672.webp",
  },
  resume: {
    path: "/documents/qVI4VexACDjeL2UOQF9oibjSXo.pdf",
    filename: "Wasilat-Atilade-Resume.pdf",
    pages: ["/documents/resume-1.png", "/documents/resume-2.png"],
  },
  audio: "/audio/piano-gymnopedie.mp3",
  about: {
    title: "Hi, I’m Wasilah.",
    paragraphs: [
      "I’m Wasilah, a Sociology graduate with experience across social media marketing, events and project coordination, and community engagement.",
      "I enjoy turning ideas into well-organised, well-executed experiences. Whether I’m coordinating a team, planning an event, managing a campaign, or bringing an audience together, I’m at my best when there’s something to build and people to bring along.",
    ],
    capabilitiesIntro: "I direct practical execution across digital marketing channels, campus-scale events and community leadership.",
    capabilities: [
      { title: "Marketing", items: ["Campaign support", "Social media management", "Content planning", "Audience engagement", "Digital promotion"] },
      { title: "Events", items: ["Event planning", "Event promotion", "Audience mobilisation", "On-ground execution", "Vendor coordination"] },
      { title: "Community", items: ["Community engagement", "Stakeholder communication", "Team coordination", "Audience communication"] },
      { title: "Operations", items: ["Project planning", "Timeline management", "Task delegation", "Follow-ups", "Problem-solving"] },
    ],
    impact: [
      { value: "1,000+", label: "Final-year students engaged" },
      { value: "800+", label: "Students represented through NSASA" },
      { value: "₦2.5M+", label: "Sponsorship support secured" },
      { value: "500+", label: "Conference attendees" },
      { value: "6/6", label: "Major NSASA events delivered" },
    ],
    awards: [
      { year: 2025, items: [
        { title: "Penultimate of the Year", count: 1 },
        { title: "Exco of the Year", count: 1 },
        { title: "Most Social Female Student", count: 2 },
        { title: "Most Influential in Politics", count: 1 },
      ] },
      { year: 2026, items: [
        { title: "Finalist of the Year", count: 1 },
        { title: "Most Influential in Politics", count: 1 },
        { title: "Most Supportive NSASAite", count: 1 },
        { title: "Most Popular Female Student", count: 1 },
        { title: "Special Recognition Award", count: 1 },
      ] },
    ],
    tools: [
      "Chat GPT",
      "Claude Design",
      "Canva",
      "Figma",
      "Capcut",
      "Google workspaces",
      "Microsoft office suit",
      "Notion",
    ],
    portrait: image("NZPMNGX6U6yZRWTpTTs7ZeCDmk"),
    candid: "/images/projects/portrait.webp",
  },
};
export type WindowId = "about" | "work" | "resume" | "contact";
export const navigation: {
  id: WindowId;
  label: string;
  mobileLabel: string;
  mobileImage?: string;
  image: string;
}[] = [
  {
    id: "about",
    label: "About Wasilah",
    mobileLabel: "About Me",
    image: image("DnMEJJsFz5E5G7QeY8jM5Hz5A1Y"),
  },
  {
    id: "work",
    label: "My Work",
    mobileLabel: "My Work",
    image: image("su3RltFj7wmRPJuC5izK9K6AIjM"),
  },
  {
    id: "resume",
    label: "Résumé.pdf",
    mobileLabel: "Résumé",
    image: image("N1yShsTTdF3i8Jv4HdzPOskWrc"),
  },
  {
    id: "contact",
    label: "Contact Me",
    mobileLabel: "Contact me",
    mobileImage: image("CF5as0hEHAFNJmlYq0Zf65kCQ-512"),
    image: image("DrhCTvdXIAltzmPzqWytmNcMQQ"),
  },
];
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/wasilat-atilade-2b54a823a/", image: "/images/dock/linkedin.jpg" },
  { label: "Email", href: "mailto:wasilahatilade01@gmail.com", image: "/images/dock/mail.png" },
  { label: "LinkedIn profile", href: "https://www.linkedin.com/in/wasilat-atilade-2b54a823a/", image: "/images/dock/linkedin.jpg" },
  { label: "Phone", href: "tel:+2348142438558", image: "/images/dock/phone.png" },
];
