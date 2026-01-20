export type LeadStatus = 
  | 'new' 
  | 'processing' 
  | 'enriched' 
  | 'site_built' 
  | 'outreach_active' 
  | 'responded' 
  | 'converted' 
  | 'failed';

export interface EnrichedData {
  bio?: string;
  headshot_url?: string;
  years_experience?: number;
  specialties?: string[];
  certifications?: string[];
  recent_sales?: {
    address: string;
    price: string;
    date: string;
  }[];
  market_stats?: {
    avg_price: string;
    avg_days_on_market: number;
  };
  brand_colors?: {
    primary: string;
    secondary: string;
  };
}

export interface OutreachLog {
  timestamp: string;
  stage: number;
  action: 'email_sent' | 'reply_received' | 'error';
  details?: string;
  message_id?: string;
}

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  
  agent_name: string;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  brokerage: string | null;
  city: string | null;
  preferred_template?: string | null;
  
  status: LeadStatus;
  error_message: string | null;
  
  enrichment_data: EnrichedData;
  
  website_url: string | null;
  website_deploy_id: string | null;
  
  outreach_stage: number;
  last_contacted_at: string | null;
  next_follow_up_at: string | null;
  email_thread_id: string | null;
  outreach_logs: OutreachLog[];
  
  google_sheet_row_index: number | null;
}

export interface CampaignConfig {
  sheetId: string;
  sheetName: string;
  senderEmail: string;
  senderName: string;
  webflowApiKey: string;
  webflowSiteId: string;
  followUpDays: number[]; // e.g. [3, 7, 10]
}
