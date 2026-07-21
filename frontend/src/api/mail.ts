import { axiosClient } from './axiosClient';
import type { Alias, DomainWithRecords, Mail } from './types';

// --- mails ---

export async function fetchMails(mailbox?: 'inbox' | 'sent') {
  const { data } = await axiosClient.get<{ mails: Mail[]; unread: number }>('/mails/', {
    params: mailbox ? { mailbox } : undefined,
  });
  return data;
}

export async function fetchMail(id: number) {
  const { data } = await axiosClient.get<{ mail: Mail }>(`/mails/${id}`);
  return data.mail;
}

export async function markUnread(id: number) {
  await axiosClient.post(`/mails/${id}/unread`);
}

export type SendPayload = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendMail(payload: SendPayload) {
  const { data } = await axiosClient.post<{ mail: Mail }>('/mails/send', payload);
  return data.mail;
}

// --- domains ---

export async function fetchDomains() {
  const { data } = await axiosClient.get<{ domains: DomainWithRecords[] }>('/domains/');
  return data.domains ?? [];
}

export async function addDomain(name: string) {
  const { data } = await axiosClient.post<DomainWithRecords>('/domains/', { name });
  return data;
}

export async function verifyDomain(id: number) {
  const { data } = await axiosClient.post<DomainWithRecords>(`/domains/${id}/verify`);
  return data;
}

export async function deleteDomain(id: number) {
  await axiosClient.delete(`/domains/${id}`);
}

// --- aliases ---

export async function fetchAliases(domainId: number) {
  const { data } = await axiosClient.get<{ aliases: Alias[] }>(`/domains/${domainId}/aliases`);
  return data.aliases ?? [];
}

export async function addAlias(domainId: number, name: string) {
  const { data } = await axiosClient.post<{ alias: Alias }>(`/domains/${domainId}/aliases`, { name });
  return data.alias;
}

export async function deleteAlias(domainId: number, aliasId: number) {
  await axiosClient.delete(`/domains/${domainId}/aliases/${aliasId}`);
}
