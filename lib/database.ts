import { supabase } from './supabaseClient';
import { UserProfile, SavedContact } from './types';

export class DatabaseService {
  
  // User profile operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('DatabaseService.updateUserProfile called with:', { userId, updates });
      
      // Remove any undefined values to avoid issues
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      console.log('Cleaned updates:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', userId)
        .select()
        .single();

      console.log('Supabase update response:', { data, error });

      if (error) {
        console.error('Error updating user profile:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      // console.log('Update successful, returning data:', data);
      return data;
    } catch (error) {
      // console.error('Error updating user profile:', error);
      return null;
    }
  }

  static async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(profile)
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  }

  // Saved contacts operations
  static async getSavedContacts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('saved_contacts')
        .select(`
          *,
          saved_contact:saved_contact_id (
            id,
            full_name,
            email,
            professional_bio,
            skills_expertise,
            required_skills,
            user_type,
            profile_image,
            plan_type,
            phone,
            linkedin,
            instagram,
            website,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved contacts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching saved contacts:', error);
      return [];
    }
  }

  static async getSavedContactsCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('saved_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching saved contacts count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error fetching saved contacts count:', error);
      return 0;
    }
  }

  static async addSavedContact(userId: string, contactId: string): Promise<any | null> {
    try {
      // Check if contact already exists
      const { data: existing } = await supabase
        .from('saved_contacts')
        .select('id')
        .eq('user_id', userId)
        .eq('saved_contact_id', contactId)
        .single();

      if (existing) {
        console.log('Contact already saved');
        return { error: 'Contact already saved' };
      }

      const { data, error } = await supabase
        .from('saved_contacts')
        .insert({
          user_id: userId,
          saved_contact_id: contactId
        })
        .select(`
          *,
          saved_contact:saved_contact_id (
            id,
            full_name,
            email,
            professional_bio,
            skills_expertise,
            required_skills,
            user_type,
            profile_image,
            plan_type,
            phone,
            linkedin,
            instagram,
            website,
            created_at,
            updated_at
          )
        `)
        .single();

      if (error) {
        console.error('Error adding saved contact:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error adding saved contact:', error);
      return null;
    }
  }

  static async removeSavedContact(userId: string, contactId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_contacts')
        .delete()
        .eq('user_id', userId)
        .eq('saved_contact_id', contactId);

      if (error) {
        console.error('Error removing saved contact:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error removing saved contact:', error);
      return false;
    }
  }

  // General user search and matching
  static async searchUsers(userType?: 'job_seeker' | 'hiring', skills?: string[], excludeUserId?: string): Promise<UserProfile[]> {
    try {
      let query = supabase
        .from('users')
        .select('*');

      if (userType) {
        query = query.eq('user_type', userType);
      }

      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }

      // For now, we'll do a simple search. For skills matching, you might want to implement
      // more sophisticated matching logic using PostgreSQL's text search capabilities
      if (skills && skills.length > 0) {
        const skillsText = skills.join('|');
        query = query.or(`skills_expertise.ilike.%${skillsText}%,required_skills.ilike.%${skillsText}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

}