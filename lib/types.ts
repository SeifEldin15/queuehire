export interface UserProfile {
  id: string;
  email: string;
  professional_bio?: string;
  skills_expertise?: string;
  required_skills?: string;
  plan_type: 'Free' | 'Essential' | 'Power' | 'Pro';
  user_type: 'job_seeker' | 'hiring';
  phone?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  full_name?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface SavedContact {
  id: string;
  user_id: string;
  saved_contact_id: string;
  created_at: string;
}

export interface PendingProfile {
  fullName: string;
  role: 'job_seeker' | 'hiring';
  skills?: string;
  skills_needed?: string;
  bio?: string;
  profile_image?: string;
}

export interface TempProfile {
  id: string;
  full_name?: string;
  user_type: 'job_seeker' | 'hiring';
  skills_expertise?: string;
  required_skills?: string;
  professional_bio?: string;
  profile_image?: string;
  phone?: string;
  linkedin?: string;
  instagram?: string;
  website?: string;
  created_at: string;
  expires_at: string;
}