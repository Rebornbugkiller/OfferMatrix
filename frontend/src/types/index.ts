export interface Application {
  id: number;
  company_name: string;
  job_title: string;
  current_status: 'IN_PROCESS' | 'OFFER' | 'REJECTED';
  created_at: string;
  updated_at: string;
  interviews?: Interview[];
}

export interface Interview {
  id: number;
  application_id: number;
  round_name: string;
  start_time: string;
  end_time: string;
  status: 'SCHEDULED' | 'FINISHED' | 'CANCELLED';
  meeting_link?: string;
  review_content?: string;
  created_at: string;
  updated_at: string;
  application?: Application;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateApplicationRequest {
  company_name: string;
  job_title?: string;
  current_status?: string;
}

export interface UpdateApplicationRequest {
  company_name?: string;
  job_title?: string;
  current_status?: 'IN_PROCESS' | 'OFFER' | 'REJECTED';
}

export interface CreateInterviewRequest {
  application_id: number;
  round_name: string;
  start_time: string;
  end_time: string;
  status?: string;
  meeting_link?: string;
  review_content?: string;
}

export interface UpdateInterviewRequest {
  round_name?: string;
  start_time?: string;
  end_time?: string;
  status?: 'SCHEDULED' | 'FINISHED' | 'CANCELLED';
  meeting_link?: string;
  review_content?: string;
}

// AI 解析面试结果
export interface ParsedInterview {
  company_name: string | null;
  round_name: string | null;
  start_time: string | null;
  end_time: string | null;
  meeting_link: string | null;
  confidence: number;
}
