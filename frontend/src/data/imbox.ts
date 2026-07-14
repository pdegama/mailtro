import {
  Archive,
  BookOpen,
  Clock3,
  FileImage,
  LucideIcon,
  MailCheck,
  Pin,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
} from 'lucide-react';

export type AppView = 'imbox' | 'feed' | 'paper-trail' | 'reply-later' | 'set-aside' | 'files' | 'screener';

export type MailItem = {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  date: string;
  avatarColor: string;
  route: string;
  source: 'person' | 'business' | 'system' | 'receipt' | 'community';
  unread?: boolean;
  attachment?: boolean;
  badge?: string;
  badgeColor?: string;
  signal?: 'dot' | 'triangle' | 'square';
};

export type CommandTile = {
  label: string;
  view: AppView;
  shortcut: string;
  icon: LucideIcon;
};

export type LabelItem = {
  label: string;
  icon: LucideIcon;
};

export type ScreenerItem = {
  id: string;
  sender: string;
  initials: string;
  email: string;
  preview: string;
  avatarColor: string;
};

export const newForYou: MailItem[] = [
  {
    id: 'parser-contract',
    sender: 'Nadia Rahman',
    initials: 'NR',
    subject: 'Inbound parser contract is ready for review',
    preview: 'I mapped the MIME fields, attachment lifecycle, and webhook payload shape for the Go service.',
    date: '11:42',
    avatarColor: 'from-[#ffb86c] to-[#ff6b55]',
    route: 'Trusted',
    source: 'person',
    unread: true,
    signal: 'dot',
  },
  {
    id: 'dns-alert',
    sender: 'Domain Monitor',
    initials: 'DM',
    subject: 'DKIM rotation needs approval',
    preview: 'Two sending domains are still using the old selector. Rotate before the next campaign window.',
    date: '10:18',
    avatarColor: 'from-[#b5ee68] to-[#51e6c2]',
    route: 'Review',
    source: 'business',
    attachment: true,
    signal: 'dot',
  },
  {
    id: 'support-route',
    sender: 'Acme Support',
    initials: 'AS',
    subject: 'Route replies from billing into Ledger',
    preview: 'Can we auto-tag Stripe receipts and keep customer replies in the same thread timeline?',
    date: '09:54',
    avatarColor: 'from-[#ff9f7a] to-[#ff5e7a]',
    route: 'Promo',
    source: 'business',
    badge: 'new',
    signal: 'dot',
  },
  {
    id: 'design-sync',
    sender: 'Mira Chen',
    initials: 'MC',
    subject: 'Compose surface polish notes',
    preview: 'The new full-screen composer feels focused. I left notes on route metadata and attachment states.',
    date: 'Yesterday',
    avatarColor: 'from-[#f5c451] to-[#ff9f43]',
    route: 'Quote',
    source: 'business',
    signal: 'dot',
  },
  {
    id: 'community-pr',
    sender: 'Open Mail Collective',
    initials: 'OMC',
    subject: 'Proposal: shared labels for self-hosted teams',
    preview: 'A lightweight convention for personal mail, support queues, and transactional receipts.',
    date: 'Mon',
    avatarColor: 'from-[#f5c451] to-[#b5ee68]',
    route: 'School',
    source: 'community',
    signal: 'dot',
  },
  {
    id: 'demo-invite',
    sender: 'DevTools Weekly',
    initials: 'DW',
    subject: 'Invitation: OSS inbox infrastructure panel',
    preview: 'A short roundtable on SMTP, inbound webhooks, and building reliable mail workers in Go.',
    date: 'Fri',
    avatarColor: 'from-[#f7a1d6] to-[#8557ff]',
    route: 'Invite',
    source: 'person',
    badge: 'new',
    signal: 'dot',
  },
];

export const previouslySeen: MailItem[] = [
  {
    id: 'cloud-receipt',
    sender: 'Fly.io',
    initials: 'FLY',
    subject: 'Usage receipt for mail-worker-staging',
    preview: 'Your staging deployment usage, bandwidth, and attached invoice are ready for records.',
    date: 'Thu',
    avatarColor: 'from-[#a7b4c6] to-[#718096]',
    route: 'Receipt',
    source: 'receipt',
    badge: 'tax',
  },
  {
    id: 'release-note',
    sender: 'Maintainer Notes',
    initials: 'MN',
    subject: 'Release checklist for Mailtro alpha',
    preview: 'Confirm env docs, seed data, queue retries, and the frontend route map before tagging.',
    date: 'Wed',
    avatarColor: 'from-[#4ade80] to-[#0fbd83]',
    route: 'School',
    source: 'community',
    badge: 'class',
  },
];

export const feedItems: MailItem[] = [
  {
    id: 'product-weekly',
    sender: 'Linear',
    initials: 'LN',
    subject: 'Product updates: cleaner cycles and faster triage',
    preview: 'A short rollup of new features, fixes, and workflow improvements from the product team.',
    date: 'Today',
    avatarColor: 'from-[#8557ff] to-[#4d8dff]',
    route: 'Product',
    source: 'system',
  },
  {
    id: 'digest',
    sender: 'Open Source Weekly',
    initials: 'OS',
    subject: 'Mail servers, workers, and a Go reliability checklist',
    preview: 'A practical digest for people building infrastructure-heavy products.',
    date: 'Yesterday',
    avatarColor: 'from-[#51e6c2] to-[#4d8dff]',
    route: 'Digest',
    source: 'community',
  },
];

export const paperTrailItems: MailItem[] = [
  {
    id: 'invoice-zoho',
    sender: 'Middle House Bali',
    initials: 'MH',
    subject: 'Invoice - INV-000008 from Middle House Bali',
    preview: 'Thank you for your business. Your invoice details and payment record are attached.',
    date: 'Mar 31',
    avatarColor: 'from-[#ffb86c] to-[#ff6b55]',
    route: 'Invoice',
    source: 'receipt',
    attachment: true,
    signal: 'square',
  },
  {
    id: 'github-security',
    sender: 'GitHub',
    initials: 'GH',
    subject: 'Security alert: dependency review',
    preview: 'A dependency in the frontend workspace has an advisory available.',
    date: 'Mon',
    avatarColor: 'from-[#718096] to-[#121826]',
    route: 'Security',
    source: 'system',
    signal: 'triangle',
  },
];

export const commandTiles: CommandTile[] = [
  { label: 'Focus Mail', view: 'imbox', shortcut: '1', icon: Star },
  { label: 'Automation Feed', view: 'feed', shortcut: '2', icon: BookOpen },
  { label: 'Ledger', view: 'paper-trail', shortcut: '3', icon: Archive },
  { label: 'Reply Queue', view: 'reply-later', shortcut: '4', icon: Clock3 },
  { label: 'Hold Queue', view: 'set-aside', shortcut: '5', icon: Pin },
  { label: 'Files', view: 'files', shortcut: '6', icon: FileImage },
];

export const labels: LabelItem[] = [
  { label: 'All routes', icon: Tag },
  { label: 'Engineering', icon: Tag },
  { label: 'School', icon: Tag },
  { label: 'Receipts', icon: Tag },
  { label: 'Travel', icon: Tag },
];

export const otherStuff: LabelItem[] = [
  { label: 'Blocked sources', icon: ShieldCheck },
  { label: 'Resolved', icon: MailCheck },
  { label: 'Trash', icon: Trash2 },
];

export const screenerItems: ScreenerItem[] = [
  {
    id: 'bluegreen',
    sender: 'Bluegreen Vacations',
    initials: 'BV',
    email: 'discovery@bluegreenvacations.com',
    preview: 'Timeshare Investment Opportunity - You can learn more about our getaway packages.',
    avatarColor: 'from-[#f5c451] to-[#ff9f43]',
  },
  {
    id: 'luxe',
    sender: 'Luxe Salon Texas',
    initials: 'LST',
    email: 'updates@luxesalontexas.com',
    preview: 'We are reaching out to give you an update. We are offering color kits and salon care.',
    avatarColor: 'from-[#ff9f7a] to-[#ff5e7a]',
  },
  {
    id: 'todd',
    sender: 'Todd Markham',
    initials: 'TM',
    email: 'todd@trustedinsure.com',
    preview: 'Re: Life Insurance Quote - Hello Mrs. Young, I hope all is well with you.',
    avatarColor: 'from-[#4d8dff] to-[#51e6c2]',
  },
];
