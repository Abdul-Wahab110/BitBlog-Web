import { Database } from '../config/database';

export interface ContactMessage {
  message_id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ';
  created_at: string;
}

export class ContactModel {
  public static async createMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ContactMessage> {
    const store = Database.getStore();
    if (!store.messages) store.messages = [];

    const now = new Date().toISOString();
    const maxId = store.messages.reduce((max, m) => Math.max(max, m.message_id), 0);
    const newId = maxId + 1;

    const msg: ContactMessage = {
      message_id: newId,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      status: 'UNREAD',
      created_at: now,
    };

    store.messages.push(msg);
    Database.saveStore();
    return msg;
  }

  public static async findAll(): Promise<ContactMessage[]> {
    const store = Database.getStore();
    const list = [...(store.messages || [])];
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  public static async findById(id: number): Promise<ContactMessage | null> {
    const store = Database.getStore();
    const msg = (store.messages || []).find(m => m.message_id === id);
    if (!msg) return null;
    return { ...msg };
  }

  public static async updateStatus(id: number, status: 'UNREAD' | 'READ'): Promise<ContactMessage | null> {
    const store = Database.getStore();
    const msg = (store.messages || []).find(m => m.message_id === id);
    if (!msg) return null;

    msg.status = status;
    Database.saveStore();
    return { ...msg };
  }

  public static async deleteMessage(id: number): Promise<boolean> {
    const store = Database.getStore();
    store.messages = (store.messages || []).filter(m => m.message_id !== id);
    Database.saveStore();
    return true;
  }
}

