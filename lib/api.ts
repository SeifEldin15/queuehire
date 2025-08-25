import { supabase } from "./supabaseClient";
import axios from "axios";

// Generic API utility for real-time updates
export class ApiService {
  
  // Update user profile with optimistic UI updates
  static async updateUserProfile(
    userId: string, 
    updates: Record<string, any>,
    options?: {
      optimistic?: boolean;
      showToast?: boolean;
    }
  ) {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  }

  // Debounced update function
  static createDebouncer() {
    const timers: Record<string, NodeJS.Timeout> = {};
    
    return (key: string, fn: () => Promise<void>, delay: number = 1000) => {
      if (timers[key]) {
        clearTimeout(timers[key]);
      }
      
      timers[key] = setTimeout(async () => {
        await fn();
        delete timers[key];
      }, delay);
    };
  }

  // Auto-save hook for form fields
  static autoSave = {
    debouncer: ApiService.createDebouncer(),
    
    field: (
      key: string, 
      value: any, 
      updateFn: (updates: Record<string, any>) => Promise<void>,
      delay: number = 1000
    ) => {
      ApiService.autoSave.debouncer(key, async () => {
        await updateFn({ [key]: value });
      }, delay);
    }
  };
}

export default ApiService;
