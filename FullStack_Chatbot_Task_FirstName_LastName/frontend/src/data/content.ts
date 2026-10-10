// Sample content written for this assignment. Replace with real DroneTV details before going live.
export const CONTACT = {
  email: 'hello@dronetv.example',
  phone: '+91 98765 00000',
  city: 'Agra, Uttar Pradesh, India',
  hours: 'Mon to Sat, 10:00 to 18:00 IST',
};

export interface Service {
  id: string;
  title: string;
  summary: string;
  icon: 'camera' | 'map' | 'sprout' | 'radar' | 'film' | 'shield';
}

export const SERVICES: Service[] = [
  { id: 's1', title: 'Aerial Photography & Videography', summary: 'Weddings, real estate, events and brand films shot with cinema-grade drones.', icon: 'camera' },
  { id: 's2', title: 'Land Survey & Mapping', summary: 'Orthomosaic maps, contours and volume estimates delivered in days, not weeks.', icon: 'map' },
  { id: 's3', title: 'Agriculture Spraying', summary: 'Precision spraying and crop-health imaging that saves water, time and chemicals.', icon: 'sprout' },
  { id: 's4', title: 'Infrastructure Inspection', summary: 'Roofs, towers, solar farms and bridges inspected safely without scaffolding.', icon: 'radar' },
  { id: 's5', title: 'Media & Live Coverage', summary: 'Aerial footage for news, documentaries and live events with fast turnaround.', icon: 'film' },
  { id: 's6', title: 'Compliance Guidance', summary: 'Help with permissions, flight planning and safe-operation checklists.', icon: 'shield' },
];

export interface Course {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  mode: string;
  summary: string;
}

export const COURSES: Course[] = [
  { id: 'c1', title: 'Drone Pilot Certification', level: 'Beginner', duration: '5 days', mode: 'Classroom + field', summary: 'Flight basics, safety, regulations and supervised flying to get you certified.' },
  { id: 'c2', title: 'FPV & Cinematography Workshop', level: 'Intermediate', duration: '2 weekends', mode: 'Hands-on', summary: 'Smooth camera moves, FPV control and colour grading for aerial footage.' },
  { id: 'c3', title: 'Drone Mapping & Photogrammetry', level: 'Advanced', duration: '10 days', mode: 'Lab + field', summary: 'Plan missions, capture data and process maps and 3D models.' },
  { id: 'c4', title: 'Agri-Drone Operator Program', level: 'Intermediate', duration: '7 days', mode: 'Field training', summary: 'Operate spraying drones, calibrate payloads and read crop-health maps.' },
];

export const FAQS = [
  { q: 'Do I need prior experience to join a course?', a: 'No. The certification course starts from zero. Advanced programs ask for a basic flying background.' },
  { q: 'Can I book a service for just one day?', a: 'Yes. Most photography, inspection and mapping jobs are priced per project or per day. Send an enquiry with your location and date.' },
  { q: 'How fast will someone reply to my enquiry?', a: 'Enquiries are reviewed in order, usually within one working day.' },
  { q: 'Do you cover locations outside the city?', a: 'Yes, for surveys and agriculture work. Travel is quoted with the project.' },
];

export const INTEREST_OPTIONS: string[] = [
  ...SERVICES.map((s) => s.title),
  ...COURSES.map((c) => c.title),
  'Partnership / Collaboration',
  'Something else',
];

// Short list shown as quick-reply chips inside the chatbot
export const CHAT_INTEREST_CHIPS = [
  'Aerial Photography & Videography',
  'Land Survey & Mapping',
  'Agriculture Spraying',
  'Drone Pilot Certification',
  'Something else',
];
