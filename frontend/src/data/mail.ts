import {
  Archive,
  Bell,
  Clock3,
  Inbox,
  Layers3,
  MailCheck,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type NavItem = {
  label: string;
  count?: number;
  active?: boolean;
  icon: ComponentType<{ className?: string }>;
};

export type MailThread = {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  tag: string;
  tone: 'work' | 'personal' | 'billing' | 'system';
  unread?: boolean;
  important?: boolean;
};

export const navItems: NavItem[] = [
  { label: 'Imbox', count: 18, active: true, icon: Inbox },
  { label: 'Feed', count: 42, icon: Layers3 },
  { label: 'Paper Trail', count: 9, icon: Archive },
  { label: 'Screened Out', count: 6, icon: ShieldCheck },
  { label: 'Set Aside', count: 4, icon: Clock3 },
  { label: 'Contacts', icon: Users },
];

export const focusCards = [
  { label: 'Unread', value: '18', icon: Bell, color: 'from-rose-500 to-orange-400' },
  { label: 'Needs reply', value: '7', icon: MessageSquareText, color: 'from-cyan-500 to-blue-500' },
  { label: 'Screened today', value: '31', icon: ShieldCheck, color: 'from-emerald-500 to-teal-400' },
];

export const threads: MailThread[] = [
  {
    id: 'm-001',
    sender: 'Nadia from Orbit',
    initials: 'NO',
    subject: 'Launch notes for the Go mail worker',
    preview: 'I added the SMTP retry diagram and a few notes about webhook delivery.',
    body: 'The worker flow is clean now: inbound parse, classify, store, then notify. I left two API questions inline for the Go service before we freeze the contract.',
    time: '9:42 AM',
    tag: 'Engineering',
    tone: 'work',
    unread: true,
    important: true,
  },
  {
    id: 'm-002',
    sender: 'Stripe',
    initials: 'ST',
    subject: 'Your June invoice is ready',
    preview: 'Receipt and tax details are attached for workspace billing.',
    body: 'Your invoice is ready. The receipt includes usage details, tax location, and payment method metadata for your records.',
    time: '8:18 AM',
    tag: 'Paper Trail',
    tone: 'billing',
  },
  {
    id: 'm-003',
    sender: 'Ravi Mehta',
    initials: 'RM',
    subject: 'Quick pass on the onboarding copy',
    preview: 'The new tone is stronger. I marked a few lines that could be shorter.',
    body: 'I like the direct language. The only thing I would trim is the welcome paragraph. It should feel like a product, not a tour.',
    time: 'Yesterday',
    tag: 'People',
    tone: 'personal',
    unread: true,
  },
  {
    id: 'm-004',
    sender: 'GitHub',
    initials: 'GH',
    subject: 'Security alert: dependency review',
    preview: 'A dependency in the frontend workspace has an advisory available.',
    body: 'Dependency review detected a package advisory in one branch. Review the lockfile and update the vulnerable package before release.',
    time: 'Mon',
    tag: 'System',
    tone: 'system',
    important: true,
  },
];

export const quickActions = [
  { label: 'Screen sender', icon: ShieldCheck },
  { label: 'Set aside', icon: Star },
  { label: 'Summarize', icon: Sparkles },
  { label: 'Mark done', icon: MailCheck },
];
