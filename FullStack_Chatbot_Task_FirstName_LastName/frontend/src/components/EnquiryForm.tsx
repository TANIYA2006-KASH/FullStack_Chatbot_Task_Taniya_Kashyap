import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ApiError, createEnquiry } from '../lib/api';
import { validateEnquiry, validateEmail, validateInterest, validateMessage, validateName, validatePhone, validateUserType } from '../lib/validators';
import type { FormErrors } from '../lib/validators';
import { INTEREST_OPTIONS } from '../data/content';
import { USER_TYPES } from '../types';
import type { EnquiryInput, UserType } from '../types';
import { useToast } from '../context/ToastContext';

const EMPTY: EnquiryInput = { name: '', email: '', phone: '', userType: 'Customer', interest: '', message: '' };
type Field = keyof FormErrors;

const FIELD_VALIDATORS: Record<string, (v: string) => string | null> = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  userType: validateUserType,
  interest: validateInterest,
  message: validateMessage,
};

export default function EnquiryForm({ prefill }: { prefill?: { interest: string; nonce: number } }) {
  const { notify } = useToast();
  const [values, setValues] = useState<EnquiryInput>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!prefill) return;
    const isCourse = /certification|workshop|photogrammetry|operator program/i.test(prefill.interest);
    setValues((v) => ({ ...v, interest: prefill.interest, userType: isCourse ? 'Student' : v.userType }));
    setErrors((e) => ({ ...e, interest: undefined }));
    setStatus('idle');
  }, [prefill]);

  const set = <K extends keyof EnquiryInput>(key: K, value: EnquiryInput[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key as Field]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const blur = (key: Field) => {
    const msg = FIELD_VALIDATORS[key]?.(String(values[key] ?? '')) ?? undefined;
    setErrors((e) => ({ ...e, [key]: msg }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (honeypot) {
      setStatus('success'); // bots fill hidden fields; pretend it worked and drop the request
      return;
    }
    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      await createEnquiry({ ...values, source: 'form' });
      setStatus('success');
      setValues(EMPTY);
      notify('success', 'Enquiry sent. We will contact you soon.');
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError) {
        if (err.fields) setErrors(err.fields as FormErrors);
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      notify('error', 'Could not send your enquiry.');
    }
  };

  if (status === 'success') {
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={44} />
        <h3>Enquiry received</h3>
        <p>Thank you. Our team will review it and contact you, usually within one working day.</p>
        <button className="btn btn-outline" onClick={() => setStatus('idle')}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const fieldProps = (key: Field) => ({
    id: `f-${key}`,
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `e-${key}` : undefined,
    onBlur: () => blur(key),
  });
  const err = (key: Field) => (errors[key] ? <span className="field-error" id={`e-${key}`} role="alert">{errors[key]}</span> : null);

  return (
    <form className="form" onSubmit={submit} noValidate>
      {formError && (
        <div className="form-alert" role="alert">
          {formError}
        </div>
      )}

      <div className="grid-2">
        <div className="field">
          <label htmlFor="f-name">Full name</label>
          <input {...fieldProps('name')} value={values.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" maxLength={100} />
          {err('name')}
        </div>
        <div className="field">
          <label htmlFor="f-email">Email</label>
          <input {...fieldProps('email')} type="email" value={values.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" maxLength={150} />
          {err('email')}
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="f-phone">Phone</label>
          <input {...fieldProps('phone')} type="tel" inputMode="tel" placeholder="+91 98765 43210" value={values.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="tel" maxLength={16} />
          {err('phone')}
        </div>
        <div className="field">
          <label htmlFor="f-interest">Service or course</label>
          <select {...fieldProps('interest')} value={values.interest} onChange={(e) => set('interest', e.target.value)}>
            <option value="">Select one…</option>
            {INTEREST_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          {err('interest')}
        </div>
      </div>

      <fieldset className="field">
        <legend>I am a</legend>
        <div className="segmented" role="radiogroup">
          {USER_TYPES.map((t: UserType) => (
            <label key={t} className={values.userType === t ? 'active' : ''}>
              <input type="radio" name="userType" value={t} checked={values.userType === t} onChange={() => set('userType', t)} />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="f-message">Message</label>
        <textarea {...fieldProps('message')} rows={5} value={values.message} onChange={(e) => set('message', e.target.value)} maxLength={2000} placeholder="Share your location, preferred dates or any questions." />
        <div className="field-foot">
          {err('message') ?? <span />}
          <span className="counter">{values.message.length}/2000</span>
        </div>
      </div>

      {/* Honeypot: invisible to people, tempting to bots */}
      <div className="hp" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <button className="btn btn-primary btn-lg" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? (<><Loader2 size={18} className="spin" /> Sending…</>) : 'Send enquiry'}
      </button>
    </form>
  );
}
