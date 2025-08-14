import { User, Profile } from './userAndProfileInterface';

export interface EmailOptions {
   to: string;
   subject: string;
   html: string;
   from?: string;
}

export interface EmailConfig {
   host: string;
   port: number;
   secure: boolean;
   user: string;
   pass: string;
   from: string;
   frontendUrl: string;
}

export interface EmailTemplate {
   subject: string;
   html: string;
   text?: string;
}

export interface EmailAttachment {
   filename: string;
   content: Buffer | string;
   contentType?: string;
   disposition?: 'attachment' | 'inline';
}

export interface BulkEmailOptions {
   recipients: string[];
   template: EmailTemplate;
   attachments?: EmailAttachment[];
}

export type BookingDetails = {
   id: string;
   propertyName: string;
   checkIn: string;
   checkOut: string;
   totalAmount: number;
   paymentStatus: string;
};

export type UserWithProfile = User & {
   profile: Profile | null;
};
