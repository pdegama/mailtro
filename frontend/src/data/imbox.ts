export type MailItem = {
  id: string;
  sender: string;
  initials: string;
  subject: string;
  preview: string;
  body?: string;
  email?: string;
  date: string;
  avatarColor: string;
  unread?: boolean;
  attachment?: boolean;
};

/** Single inbox list — all mail in one place. */
export const emails: MailItem[] = [
  {
    id: 'parser-contract',
    sender: 'Nadia Rahman',
    initials: 'NR',
    email: 'nadia@orbit.dev',
    subject: 'Inbound parser contract is ready for review',
    preview: 'I mapped the MIME fields, attachment lifecycle, and webhook payload shape for the Go service.',
    body: 'Hey —\n\nI mapped the MIME fields, attachment lifecycle, and webhook payload shape for the Go service.\n\nOpen questions:\n1. Do we keep raw MIME on disk for 30 days or only parsed JSON?\n2. Should failed classification requeue with exponential backoff?\n\nI left comments on the PR. Ready when you are.\n\n— Nadia',
    date: '11:42',
    avatarColor: 'from-[#ffb86c] to-[#ff6b55]',
    unread: true,
  },
  {
    id: 'dns-alert',
    sender: 'Domain Monitor',
    initials: 'DM',
    email: 'alerts@domain-monitor.io',
    subject: 'DKIM rotation needs approval',
    preview: 'Two sending domains are still using the old selector. Rotate before the next campaign window.',
    body: 'Two sending domains are still using the old DKIM selector.\n\n• mail.mailtro.app — selector: old-2024\n• notify.mailtro.app — selector: old-2024\n\nRotate before the next campaign window to avoid deliverability dips.',
    date: '10:18',
    avatarColor: 'from-[#b5ee68] to-[#51e6c2]',
    attachment: true,
  },
  {
    id: 'support-route',
    sender: 'Acme Support',
    initials: 'AS',
    email: 'support@acme.example',
    subject: 'Route replies from billing into Ledger',
    preview: 'Can we auto-tag Stripe receipts and keep customer replies in the same thread timeline?',
    body: 'Hi team,\n\nCan we auto-tag Stripe receipts and keep customer replies in the same thread timeline?\n\nRight now billing replies land in Focus Mail and receipts go to Ledger separately — messy for support.\n\nThanks,\nAcme Support',
    date: '09:54',
    avatarColor: 'from-[#ff9f7a] to-[#ff5e7a]',
    unread: true,
  },
  {
    id: 'design-sync',
    sender: 'Mira Chen',
    initials: 'MC',
    email: 'mira@studio.example',
    subject: 'Compose surface polish notes',
    preview: 'The new full-screen composer feels focused. I left notes on route metadata and attachment states.',
    body: 'The bottom drawer composer feels focused — much better than a floating modal.\n\nNotes:\n• Keep To / Subject sticky while body scrolls\n• Attachment chips should sit above the toolbar\n• Reply should prefill Re: + original sender\n\nHappy to pair on this tomorrow.',
    date: 'Yesterday',
    avatarColor: 'from-[#f5c451] to-[#ff9f43]',
  },
  {
    id: 'community-pr',
    sender: 'Open Mail Collective',
    initials: 'OMC',
    email: 'hello@openmail.community',
    subject: 'Proposal: shared labels for self-hosted teams',
    preview: 'A lightweight convention for personal mail, support queues, and transactional receipts.',
    body: 'Proposal for a lightweight label convention:\n\n• personal — people you know\n• support — customer threads\n• receipts — transactional mail\n\nWould love feedback from teams running self-hosted inboxes.',
    date: 'Mon',
    avatarColor: 'from-[#f5c451] to-[#b5ee68]',
  },
  {
    id: 'demo-invite',
    sender: 'DevTools Weekly',
    initials: 'DW',
    email: 'editors@devtoolsweekly.com',
    subject: 'Invitation: OSS inbox infrastructure panel',
    preview: 'A short roundtable on SMTP, inbound webhooks, and building reliable mail workers in Go.',
    body: "You're invited to a short roundtable on SMTP, inbound webhooks, and building reliable mail workers in Go.\n\nDate: next Thursday, 11:00 PT\nFormat: 45 min panel + Q&A\n\nReply if you'd like a seat.",
    date: 'Fri',
    avatarColor: 'from-[#f7a1d6] to-[#8557ff]',
    unread: true,
  },
  {
    id: 'cloud-receipt',
    sender: 'Fly.io',
    initials: 'FLY',
    email: 'billing@fly.io',
    subject: 'Usage receipt for mail-worker-staging',
    preview: 'Your staging deployment usage, bandwidth, and attached invoice are ready for records.',
    body: 'Your staging deployment usage, bandwidth, and attached invoice are ready for records.\n\nWorkspace: mail-worker-staging\nPeriod: last 30 days\n\nDownload the PDF from the billing portal anytime.',
    date: 'Thu',
    avatarColor: 'from-[#a7b4c6] to-[#718096]',
    attachment: true,
  },
  {
    id: 'release-note',
    sender: 'Maintainer Notes',
    initials: 'MN',
    email: 'notes@mailtro.app',
    subject: 'Release checklist for Mailtro alpha',
    preview: 'Confirm env docs, seed data, queue retries, and the frontend route map before tagging.',
    body: 'Before we tag alpha:\n\n• Confirm env docs\n• Seed data for demo accounts\n• Queue retry policy review\n• Frontend route map freeze\n\nPing me when green.',
    date: 'Wed',
    avatarColor: 'from-[#4ade80] to-[#0fbd83]',
  },
  {
    id: 'product-weekly',
    sender: 'Linear',
    initials: 'LN',
    email: 'hello@linear.app',
    subject: 'Product updates: cleaner cycles and faster triage',
    preview: 'A short rollup of new features, fixes, and workflow improvements from the product team.',
    body: 'A short rollup of new features, fixes, and workflow improvements from the product team.\n\nThanks for building with us.',
    date: 'Tue',
    avatarColor: 'from-[#8557ff] to-[#4d8dff]',
  },
  {
    id: 'github-security',
    sender: 'GitHub',
    initials: 'GH',
    email: 'noreply@github.com',
    subject: 'Security alert: dependency review',
    preview: 'A dependency in the frontend workspace has an advisory available.',
    body: 'Dependency review detected a package advisory in one branch. Review the lockfile and update the vulnerable package before release.',
    date: 'Mon',
    avatarColor: 'from-[#718096] to-[#121826]',
  },
];
