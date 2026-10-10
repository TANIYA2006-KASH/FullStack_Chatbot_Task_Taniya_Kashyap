import type { UserType } from '../types';
import { CONTACT, COURSES, SERVICES } from '../data/content';

export interface BotReply {
  text: string;
  chips?: string[];
  action?: 'start-lead';
  userType?: UserType;
  presetMessage?: string;
}

// The 7 predefined questions from the brief double as quick-reply chips.
export const WELCOME_CHIPS = [
  'What services does DroneTV provide?',
  'What courses / training are available?',
  'How can I contact DroneTV?',
  'How can I register?',
  'I am interested in a service',
  'I am a student',
  'I want to speak with someone',
];

const MORE_CHIPS = ['What services does DroneTV provide?', 'What courses / training are available?', 'I want to speak with someone'];

interface Intent {
  id: string;
  phrases: string[]; // matched as substrings (strong signal)
  keywords: string[]; // matched as whole words (weak signal)
  reply: () => BotReply;
}

const bullets = (items: string[]) => items.map((i) => `• ${i}`).join('\n');

const INTENTS: Intent[] = [
  {
    id: 'greeting',
    phrases: ['good morning', 'good evening', 'good afternoon'],
    keywords: ['hi', 'hii', 'hello', 'hey', 'namaste', 'hola'],
    reply: () => ({ text: 'Hello! 👋 I can tell you about our drone services and training, or take down an enquiry. What would you like to know?', chips: WELCOME_CHIPS.slice(0, 4) }),
  },
  {
    id: 'services',
    phrases: ['what services', 'services does', 'your services', 'what do you do', 'what do you offer', 'services available'],
    keywords: ['services', 'offer', 'offerings', 'provide', 'provides'],
    reply: () => ({
      text: `Here is what DroneTV offers:\n${bullets(SERVICES.map((s) => s.title))}\n\nWant a quote for any of these?`,
      chips: ['I am interested in a service', 'What courses / training are available?'],
    }),
  },
  {
    id: 'courses',
    phrases: ['what courses', 'training available', 'courses available', 'what training', 'courses / training'],
    keywords: ['course', 'courses', 'training', 'certification', 'certificate', 'learn', 'class', 'classes', 'workshop', 'syllabus'],
    reply: () => ({
      text: `Training programs:\n${bullets(COURSES.map((c) => `${c.title} (${c.level}, ${c.duration})`))}\n\nTell me if you want help picking one.`,
      chips: ['I am a student', 'How can I register?'],
    }),
  },
  {
    id: 'contact',
    phrases: ['how can i contact', 'contact dronetv', 'contact you', 'phone number', 'email address', 'where are you', 'office address'],
    keywords: ['contact', 'phone', 'email', 'address', 'location', 'reach', 'call', 'whatsapp', 'timing', 'hours'],
    reply: () => ({
      text: `You can reach us here:\n📧 ${CONTACT.email}\n📞 ${CONTACT.phone}\n📍 ${CONTACT.city}\n🕒 ${CONTACT.hours}\n\nOr leave your details here and we will contact you.`,
      chips: ['I want to speak with someone', 'I am interested in a service'],
    }),
  },
  {
    id: 'register',
    phrases: ['how can i register', 'how to register', 'how do i register', 'sign up', 'how to join', 'how can i join'],
    keywords: ['register', 'registration', 'enroll', 'enrol', 'enrolment', 'admission', 'signup', 'apply', 'join'],
    reply: () => ({
      text: 'Registering takes about two minutes:\n1. Share your details with me (or use the enquiry form).\n2. Our team calls you to confirm the batch and fees.\n3. Pay to reserve your seat and get your joining details.\n\nShall we start?',
      chips: ['Start my enquiry', 'What courses / training are available?'],
    }),
  },
  {
    id: 'interested-service',
    phrases: ['interested in a service', 'interested in service', 'i need a service', 'book a service', 'get a quote', 'start my enquiry', 'need a quote', 'hire a drone'],
    keywords: ['quote', 'booking', 'hire', 'enquiry', 'inquiry'],
    reply: () => ({
      text: 'Great, let me take a few details so the team can prepare a quote. You can type "cancel" at any time.',
      action: 'start-lead',
      userType: 'Customer',
    }),
  },
  {
    id: 'student',
    phrases: ['i am a student', "i'm a student", 'im a student', 'student here'],
    keywords: ['student', 'college', 'school', 'university', 'beginner', 'career'],
    reply: () => ({
      text: `Welcome, future pilot! 🎓 Students usually start with ${COURSES[0].title} (${COURSES[0].duration}, no prior experience needed). Let me note your details so a counsellor can guide you. Type "cancel" any time.`,
      action: 'start-lead',
      userType: 'Student',
    }),
  },
  {
    id: 'human',
    phrases: ['speak with someone', 'speak to someone', 'talk to someone', 'talk to a human', 'speak to a human', 'call me', 'call back', 'callback', 'talk to a person', 'customer care'],
    keywords: ['human', 'agent', 'representative', 'someone', 'executive', 'support'],
    reply: () => ({
      text: 'Sure, I will pass you to a human. Share your details and someone from the team will call you back. Type "cancel" any time.',
      action: 'start-lead',
      presetMessage: 'Please call me back. I would like to speak with someone from the team.',
    }),
  },
  {
    id: 'pricing',
    phrases: ['how much', 'what is the price', 'what are the charges'],
    keywords: ['price', 'prices', 'pricing', 'cost', 'costs', 'fee', 'fees', 'charges', 'rate', 'rates', 'package', 'packages'],
    reply: () => ({
      text: 'Pricing depends on the service, location and project size, and course fees depend on the batch. The quickest way to get an exact number is to send an enquiry and we will reply with a quote.',
      chips: ['I am interested in a service', 'I am a student'],
    }),
  },
  {
    id: 'rules',
    phrases: ['is it legal', 'do i need permission'],
    keywords: ['dgca', 'license', 'licence', 'permit', 'permission', 'legal', 'regulation', 'regulations', 'rules'],
    reply: () => ({
      text: 'Drone flying in India follows government aviation rules, and requirements can change. Our team guides every client and student through the current requirements, so just ask when you enquire.',
      chips: ['I want to speak with someone', 'What courses / training are available?'],
    }),
  },
  {
    id: 'thanks',
    phrases: ['thank you', 'thanks a lot'],
    keywords: ['thanks', 'thx', 'thankyou', 'shukriya', 'dhanyavad'],
    reply: () => ({ text: "You're welcome! Is there anything else I can help with?", chips: MORE_CHIPS }),
  },
  {
    id: 'bye',
    phrases: ['see you', 'good bye'],
    keywords: ['bye', 'goodbye', 'cya'],
    reply: () => ({ text: 'Goodbye! Come back any time. Blue skies ☁️' }),
  },
];

const normalise = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s'/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export function getReply(input: string): BotReply {
  const text = normalise(input);
  const words = new Set(text.split(' '));

  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const p of intent.phrases) if (text.includes(p)) score += 5;
    for (const k of intent.keywords) if (words.has(k)) score += 1;
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }
  if (best) return best.intent.reply();

  // Graceful fallback for anything we do not understand
  return {
    text: "I'm not sure I understood that, but I can help with the topics below. If you would rather talk to a person, choose \"I want to speak with someone\".",
    chips: WELCOME_CHIPS.slice(0, 4).concat('I want to speak with someone'),
  };
}
