import type { EnquiryInput, UserType } from '../types';
import { USER_TYPES } from '../types';
import { CHAT_INTEREST_CHIPS } from '../data/content';
import { validateEmail, validateInterest, validateMessage, validateName, validatePhone } from '../lib/validators';
import { WELCOME_CHIPS } from './engine';

export type Step = 'name' | 'email' | 'phone' | 'userType' | 'interest' | 'message' | 'confirm';

export interface Flow {
  step: Step;
  data: Partial<EnquiryInput>;
  defaultMessage?: string;
}

export interface Reply {
  text: string;
  chips?: string[];
  tone?: 'error' | 'success' | 'summary';
}

export interface FlowResult {
  flow: Flow | null;
  replies: Reply[];
  submit?: EnquiryInput;
}

const SKIP = 'Skip';
const CONFIRM_CHIPS = ['Submit enquiry', 'Start over', 'Cancel'];

export const STEP_HINT: Record<Step, { placeholder: string; inputMode: 'text' | 'email' | 'tel' }> = {
  name: { placeholder: 'Type your full name…', inputMode: 'text' },
  email: { placeholder: 'name@example.com', inputMode: 'email' },
  phone: { placeholder: '+91 98765 43210', inputMode: 'tel' },
  userType: { placeholder: 'Choose an option above…', inputMode: 'text' },
  interest: { placeholder: 'Pick one or type your own…', inputMode: 'text' },
  message: { placeholder: 'Write a short message…', inputMode: 'text' },
  confirm: { placeholder: 'Submit, start over or cancel…', inputMode: 'text' },
};

function nextStep(from: Step | null, data: Partial<EnquiryInput>, defaultMessage?: string): Step {
  const order: Step[] = ['name', 'email', 'phone', 'userType', 'interest', 'message', 'confirm'];
  let i = from ? order.indexOf(from) + 1 : 0;
  while (i < order.length) {
    const s = order[i];
    if (s === 'userType' && data.userType) i++;
    else if (s === 'message' && data.message && defaultMessage) i++;
    else break;
  }
  return order[i];
}

function prompt(step: Step, data: Partial<EnquiryInput>): Reply {
  switch (step) {
    case 'name':
      return { text: "First, what's your full name?" };
    case 'email':
      return { text: `Nice to meet you, ${data.name?.split(' ')[0]}! What's your email address?` };
    case 'phone':
      return { text: 'Thanks. Which phone number can we reach you on?' };
    case 'userType':
      return { text: 'Are you a student, a customer, or something else?', chips: USER_TYPES };
    case 'interest':
      return { text: data.userType === 'Student' ? 'Which course interests you?' : 'What are you interested in?', chips: data.userType === 'Student' ? ['Drone Pilot Certification', 'FPV & Cinematography Workshop', 'Drone Mapping & Photogrammetry', 'Something else'] : CHAT_INTEREST_CHIPS };
    case 'message':
      return { text: 'Anything specific you want us to know? (location, date, questions)', chips: [SKIP] };
    case 'confirm':
      return {
        text: ['Please check your details:', `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone}`, `I am a: ${data.userType}`, `Interested in: ${data.interest}`, `Message: ${data.message}`].join('\n'),
        chips: CONFIRM_CHIPS,
        tone: 'summary',
      };
  }
}

export function startLead(opts: { userType?: UserType; message?: string } = {}): { flow: Flow; replies: Reply[] } {
  const data: Partial<EnquiryInput> = { userType: opts.userType, message: opts.message };
  const flow: Flow = { step: 'name', data, defaultMessage: opts.message };
  return { flow, replies: [prompt('name', data)] };
}

const err = (flow: Flow, text: string, chips?: string[]): FlowResult => ({ flow, replies: [{ text, tone: 'error', chips }] });

export function advance(flow: Flow, raw: string): FlowResult {
  const text = raw.trim();

  if (/^(cancel|stop|exit|quit)$/i.test(text)) {
    return { flow: null, replies: [{ text: 'No problem, I have cancelled that. Nothing was saved. Anything else I can help with?', chips: WELCOME_CHIPS.slice(0, 4) }] };
  }

  const data = { ...flow.data };
  const go = (from: Step): FlowResult => {
    const step = nextStep(from, data, flow.defaultMessage);
    return { flow: { ...flow, step, data }, replies: [prompt(step, data)] };
  };

  switch (flow.step) {
    case 'name': {
      const e = validateName(text);
      if (e) return err(flow, `${e}. Please type your full name.`);
      data.name = text;
      return go('name');
    }
    case 'email': {
      const e = validateEmail(text);
      if (e) return err(flow, `${e}. For example: name@example.com`);
      data.email = text.toLowerCase();
      return go('email');
    }
    case 'phone': {
      const e = validatePhone(text);
      if (e) return err(flow, `${e}. For example: +91 98765 43210`);
      data.phone = text;
      return go('phone');
    }
    case 'userType': {
      const match = USER_TYPES.find((t) => t.toLowerCase() === text.toLowerCase());
      if (!match) return err(flow, 'Please choose one of the options.', USER_TYPES);
      data.userType = match;
      return go('userType');
    }
    case 'interest': {
      const e = validateInterest(text);
      if (e) return err(flow, `${e}.`, CHAT_INTEREST_CHIPS);
      data.interest = text;
      return go('interest');
    }
    case 'message': {
      if (text.toLowerCase() === SKIP.toLowerCase()) {
        data.message = flow.defaultMessage || 'Please contact me about this enquiry.';
        return go('message');
      }
      const e = validateMessage(text);
      if (e) return err(flow, `${e}. Add a few words, or tap Skip.`, [SKIP]);
      data.message = text;
      return go('message');
    }
    case 'confirm': {
      if (/^(submit|yes|confirm|send)/i.test(text)) {
        return { flow, replies: [], submit: { ...(data as EnquiryInput), source: 'chatbot' } };
      }
      if (/^(start over|edit|restart|no)/i.test(text)) {
        const s = startLead({ userType: flow.defaultMessage ? data.userType : undefined, message: flow.defaultMessage });
        return { flow: s.flow, replies: [{ text: 'Okay, let us start again.' }, ...s.replies] };
      }
      return err(flow, 'Tap "Submit enquiry" to send, "Start over" to re-enter, or "Cancel".', CONFIRM_CHIPS);
    }
  }
}
