export type Mail = {
  id: number;
  user_id: number;
  uid: string;
  mailbox: 'inbox' | 'sent';
  from_address: string;
  from_name: string;
  to_address: string;
  tag: string;
  subject: string;
  snippet: string;
  body_text?: string;
  body_html?: string;
  message_id: string;
  spf_status: string;
  dkim_status: string;
  unread: boolean;
  status: 'received' | 'queued' | 'delivered' | 'tryagain' | 'failed' | '';
  status_error?: string;
  retry_count: number;
  next_retry_at?: string;
  created_at: string;
  updated_at: string;
};

export type Domain = {
  id: number;
  name: string;
  user_id: number;
  verified: boolean;
  verified_at?: string;
  verify_token: string;
  dkim_selector: string;
  dkim_public_key: string;
  created_at: string;
};

export type DNSRecord = {
  type: string;
  host: string;
  value: string;
  purpose: string;
};

export type DomainWithRecords = {
  domain: Domain;
  records: DNSRecord[];
};

export type Alias = {
  id: number;
  domain_id: number;
  name: string;
  user_id: number;
};
