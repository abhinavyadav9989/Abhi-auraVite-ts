export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
  
export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      app_configs: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          created_at: string | null
          details: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          session_id: string | null
          table_name: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          created_at?: string | null
          details?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          session_id?: string | null
          table_name?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder_name: string | null
          account_number: string | null
          account_type: string | null
          balance: number | null
          bank_name: string | null
          branch_name: string | null
          cheque_image_url: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          dealer_id: string | null
          id: string
          ifsc_code: string | null
          is_primary: boolean | null
          is_verified: boolean | null
          last_transaction_date: string | null
          micr_code: string | null
          notes: string | null
          status: string | null
          updated_at: string | null
          upi_id: string | null
          verification_date: string | null
          verification_method: string | null
        }
        Insert: {
          account_holder_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name?: string | null
          branch_name?: string | null
          cheque_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          dealer_id?: string | null
          id?: string
          ifsc_code?: string | null
          is_primary?: boolean | null
          is_verified?: boolean | null
          last_transaction_date?: string | null
          micr_code?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          upi_id?: string | null
          verification_date?: string | null
          verification_method?: string | null
        }
        Update: {
          account_holder_name?: string | null
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name?: string | null
          branch_name?: string | null
          cheque_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          dealer_id?: string | null
          id?: string
          ifsc_code?: string | null
          is_primary?: boolean | null
          is_verified?: boolean | null
          last_transaction_date?: string | null
          micr_code?: string | null
          notes?: string | null
          status?: string | null
          updated_at?: string | null
          upi_id?: string | null
          verification_date?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_details: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string | null
          cancelled_cheque_url: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          ifsc_code: string
          is_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name?: string | null
          cancelled_cheque_url?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          ifsc_code: string
          is_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string | null
          cancelled_cheque_url?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          ifsc_code?: string
          is_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_details_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: true
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          contact_number: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          is_default: boolean | null
          manager_id: string | null
          name: string
          state: string | null
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          is_default?: boolean | null
          manager_id?: string | null
          name: string
          state?: string | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          is_default?: boolean | null
          manager_id?: string | null
          name?: string
          state?: string | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_documents: {
        Row: {
          created_at: string | null
          dealer_id: string | null
          document_type: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dealer_id?: string | null
          document_type: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dealer_id?: string | null
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_documents_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_hours: {
        Row: {
          close_time: string | null
          created_at: string | null
          day_of_week: number
          dealer_id: string | null
          id: string
          is_open: boolean | null
          open_time: string | null
        }
        Insert: {
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          dealer_id?: string | null
          id?: string
          is_open?: boolean | null
          open_time?: string | null
        }
        Update: {
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          dealer_id?: string | null
          id?: string
          is_open?: boolean | null
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_hours_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_inquiries: {
        Row: {
          created_at: string | null
          dealer_id: string | null
          id: string
          inquirer_email: string | null
          inquirer_name: string | null
          inquirer_phone: string | null
          message: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          inquirer_email?: string | null
          inquirer_name?: string | null
          inquirer_phone?: string | null
          message?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          inquirer_email?: string | null
          inquirer_name?: string | null
          inquirer_phone?: string | null
          message?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_inquiries_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_preferences: {
        Row: {
          auto_publish: boolean | null
          created_at: string | null
          dealer_id: string | null
          id: string
          notification_email: boolean | null
          notification_sms: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_publish?: boolean | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          notification_email?: boolean | null
          notification_sms?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_publish?: boolean | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          notification_email?: boolean | null
          notification_sms?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_preferences_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          dealer_id: string | null
          id: string
          rating: number | null
          reviewer_name: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          rating?: number | null
          reviewer_name?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          rating?: number | null
          reviewer_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_reviews_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealers: {
        Row: {
          access_level: Database["public"]["Enums"]["access_level"] | null
          address: string | null
          bank_details: Json | null
          bank_details_added: boolean | null
          banner_url: string | null
          branches_added: boolean | null
          business_hours: Json | null
          business_mode: Json | null
          business_name: string | null
          business_type: string | null
          certifications: string[] | null
          city: string | null
          client_type: string | null
          consent_receipt: Json | null
          contact_number: string | null
          created_at: string
          created_by: string | null
          current_onboarding_step: number | null
          description: string | null
          draft_data: Json | null
          email: string
          email_verified: boolean | null
          gstin: string | null
          id: string
          is_featured: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          kyb_completed: boolean | null
          kyb_data: Json | null
          kyc_completed: boolean | null
          logo_url: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_data: Json | null
          onboarding_progress: Json | null
          onboarding_started_at: string | null
          owner_name: string | null
          owner_user_id: string | null
          pan_number: string | null
          payment_methods: Json | null
          phone: string | null
          phone_verified: boolean | null
          pincode: string | null
          plan_selection: Json | null
          rating: number | null
          specializations: string[] | null
          state: string | null
          status: string | null
          submitted_at: string | null
          subscription_plan: string | null
          tagline: string | null
          total_reviews: number | null
          total_sales: number | null
          total_vehicles: number | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"] | null
          verification_notes: string | null
          verification_status: string | null
          verification_status_new: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          address?: string | null
          bank_details?: Json | null
          bank_details_added?: boolean | null
          banner_url?: string | null
          branches_added?: boolean | null
          business_hours?: Json | null
          business_mode?: Json | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          city?: string | null
          client_type?: string | null
          consent_receipt?: Json | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          current_onboarding_step?: number | null
          description?: string | null
          draft_data?: Json | null
          email: string
          email_verified?: boolean | null
          gstin?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          kyb_completed?: boolean | null
          kyb_data?: Json | null
          kyc_completed?: boolean | null
          logo_url?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_progress?: Json | null
          onboarding_started_at?: string | null
          owner_name?: string | null
          owner_user_id?: string | null
          pan_number?: string | null
          payment_methods?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          pincode?: string | null
          plan_selection?: Json | null
          rating?: number | null
          specializations?: string[] | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          subscription_plan?: string | null
          tagline?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          total_vehicles?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_status_new?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["access_level"] | null
          address?: string | null
          bank_details?: Json | null
          bank_details_added?: boolean | null
          banner_url?: string | null
          branches_added?: boolean | null
          business_hours?: Json | null
          business_mode?: Json | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          city?: string | null
          client_type?: string | null
          consent_receipt?: Json | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          current_onboarding_step?: number | null
          description?: string | null
          draft_data?: Json | null
          email?: string
          email_verified?: boolean | null
          gstin?: string | null
          id?: string
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          kyb_completed?: boolean | null
          kyb_data?: Json | null
          kyc_completed?: boolean | null
          logo_url?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_data?: Json | null
          onboarding_progress?: Json | null
          onboarding_started_at?: string | null
          owner_name?: string | null
          owner_user_id?: string | null
          pan_number?: string | null
          payment_methods?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          pincode?: string | null
          plan_selection?: Json | null
          rating?: number | null
          specializations?: string[] | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          subscription_plan?: string | null
          tagline?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          total_vehicles?: number | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
          verification_notes?: string | null
          verification_status?: string | null
          verification_status_new?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      logistics_orders: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          id: string
          pickup_address: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          pickup_address?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          pickup_address?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_orders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_audit_log: {
        Row: {
          action: string
          created_at: string | null
          dealer_id: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          step: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          step?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          step?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_audit_log_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      rto_applications: {
        Row: {
          created_at: string | null
          id: string
          owner_name: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          vehicle_number: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          owner_name?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          owner_name?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rto_applications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      shortlists: {
        Row: {
          created_at: string | null
          dealer_id: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          notes: string | null
          priority: number | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
          vehicle_ids: string[]
        }
        Insert: {
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          notes?: string | null
          priority?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_ids?: string[]
        }
        Update: {
          created_at?: string | null
          dealer_id?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          notes?: string | null
          priority?: number | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "shortlists_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shortlists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          aadhar_number: string | null
          created_at: string | null
          dealer_id: string | null
          email: string | null
          full_name: string | null
          id: string
          mobile_number: string | null
          permissions: Json | null
          role: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          aadhar_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          aadhar_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          mobile_number?: string | null
          permissions?: Json | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          amount_paid: number | null
          buyer_id: string
          buyer_rated: boolean | null
          created_at: string
          currency: string | null
          current_offer: number | null
          final_price: number | null
          id: string
          initial_offer: number | null
          last_action_by: string | null
          logistics_id: string | null
          messages: Json | null
          metadata: Json | null
          notes: string | null
          payment_method: string | null
          rto_id: string | null
          seller_id: string
          seller_rated: boolean | null
          status: Database["public"]["Enums"]["txn_status"]
          timeline: Json | null
          transaction_date: string | null
          transaction_type: string | null
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          amount: number
          amount_paid?: number | null
          buyer_id: string
          buyer_rated?: boolean | null
          created_at?: string
          currency?: string | null
          current_offer?: number | null
          final_price?: number | null
          id?: string
          initial_offer?: number | null
          last_action_by?: string | null
          logistics_id?: string | null
          messages?: Json | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          rto_id?: string | null
          seller_id: string
          seller_rated?: boolean | null
          status?: Database["public"]["Enums"]["txn_status"]
          timeline?: Json | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          amount?: number
          amount_paid?: number | null
          buyer_id?: string
          buyer_rated?: boolean | null
          created_at?: string
          currency?: string | null
          current_offer?: number | null
          final_price?: number | null
          id?: string
          initial_offer?: number | null
          last_action_by?: string | null
          logistics_id?: string | null
          messages?: Json | null
          metadata?: Json | null
          notes?: string | null
          payment_method?: string | null
          rto_id?: string | null
          seller_id?: string
          seller_rated?: boolean | null
          status?: Database["public"]["Enums"]["txn_status"]
          timeline?: Json | null
          transaction_date?: string | null
          transaction_type?: string | null
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          session_data: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_data?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          session_data?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicle_assets: {
        Row: {
          created_at: string
          file_name: string | null
          file_type: string
          file_url: string
          id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_type: string
          file_url: string
          id?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_type?: string
          file_url?: string
          id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_inspections: {
        Row: {
          created_at: string | null
          id: string
          inspection_date: string | null
          inspector_id: string | null
          notes: string | null
          report_url: string | null
          status: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          inspection_date?: string | null
          inspector_id?: string | null
          notes?: string | null
          report_url?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          inspection_date?: string | null
          inspector_id?: string | null
          notes?: string | null
          report_url?: string | null
          status?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_inspections_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          ai_confidence: string | null
          ai_metadata: Json | null
          ai_reasoning: string | null
          asking_price: number | null
          body_type: string | null
          branch_id: string | null
          buyer_requirements: Json | null
          color: string | null
          condition_rating: number | null
          created_at: string
          created_by: string | null
          custom_attributes: Json | null
          dealer_id: string
          description: string | null
          documents: string[] | null
          emi_available: boolean | null
          engine_size: string | null
          exchange_available: boolean | null
          features: string[] | null
          financing_options: Json | null
          fuel_type: string | null
          hero_image_url: string | null
          id: string
          images: string[] | null
          inspection_report_url: string | null
          insurance_valid_until: string | null
          inventory_type: string | null
          is_featured: boolean | null
          is_negotiable: boolean | null
          is_urgent: boolean | null
          kilometers: number | null
          landed_cost_components: Json | null
          listing_fee_type: string | null
          listing_fee_value: number | null
          location_city: string | null
          location_state: string | null
          make: string
          market_data: Json | null
          market_price_max: number | null
          market_price_min: number | null
          mileage: number | null
          model: string
          ownership: string | null
          price: number | null
          publish_at: string | null
          publish_schedule: string | null
          registration_number: string | null
          rto_location: string | null
          seating_capacity: number | null
          seller_notes: string | null
          service_history: Json | null
          status: Database["public"]["Enums"]["vehicle_status"]
          suggested_categories: string[] | null
          tags: string[] | null
          test_drive_available: boolean | null
          transmission: string | null
          updated_at: string
          variant: string | null
          vehicle_category: string[] | null
          vehicle_type: string | null
          videos: string[] | null
          viewing_schedule: Json | null
          warranty_info: Json | null
          year: number
        }
        Insert: {
          ai_confidence?: string | null
          ai_metadata?: Json | null
          ai_reasoning?: string | null
          asking_price?: number | null
          body_type?: string | null
          branch_id?: string | null
          buyer_requirements?: Json | null
          color?: string | null
          condition_rating?: number | null
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json | null
          dealer_id: string
          description?: string | null
          documents?: string[] | null
          emi_available?: boolean | null
          engine_size?: string | null
          exchange_available?: boolean | null
          features?: string[] | null
          financing_options?: Json | null
          fuel_type?: string | null
          hero_image_url?: string | null
          id?: string
          images?: string[] | null
          inspection_report_url?: string | null
          insurance_valid_until?: string | null
          inventory_type?: string | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          kilometers?: number | null
          landed_cost_components?: Json | null
          listing_fee_type?: string | null
          listing_fee_value?: number | null
          location_city?: string | null
          location_state?: string | null
          make: string
          market_data?: Json | null
          market_price_max?: number | null
          market_price_min?: number | null
          mileage?: number | null
          model: string
          ownership?: string | null
          price?: number | null
          publish_at?: string | null
          publish_schedule?: string | null
          registration_number?: string | null
          rto_location?: string | null
          seating_capacity?: number | null
          seller_notes?: string | null
          service_history?: Json | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          suggested_categories?: string[] | null
          tags?: string[] | null
          test_drive_available?: boolean | null
          transmission?: string | null
          updated_at?: string
          variant?: string | null
          vehicle_category?: string[] | null
          vehicle_type?: string | null
          videos?: string[] | null
          viewing_schedule?: Json | null
          warranty_info?: Json | null
          year: number
        }
        Update: {
          ai_confidence?: string | null
          ai_metadata?: Json | null
          ai_reasoning?: string | null
          asking_price?: number | null
          body_type?: string | null
          branch_id?: string | null
          buyer_requirements?: Json | null
          color?: string | null
          condition_rating?: number | null
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json | null
          dealer_id?: string
          description?: string | null
          documents?: string[] | null
          emi_available?: boolean | null
          engine_size?: string | null
          exchange_available?: boolean | null
          features?: string[] | null
          financing_options?: Json | null
          fuel_type?: string | null
          hero_image_url?: string | null
          id?: string
          images?: string[] | null
          inspection_report_url?: string | null
          insurance_valid_until?: string | null
          inventory_type?: string | null
          is_featured?: boolean | null
          is_negotiable?: boolean | null
          is_urgent?: boolean | null
          kilometers?: number | null
          landed_cost_components?: Json | null
          listing_fee_type?: string | null
          listing_fee_value?: number | null
          location_city?: string | null
          location_state?: string | null
          make?: string
          market_data?: Json | null
          market_price_max?: number | null
          market_price_min?: number | null
          mileage?: number | null
          model?: string
          ownership?: string | null
          price?: number | null
          publish_at?: string | null
          publish_schedule?: string | null
          registration_number?: string | null
          rto_location?: string | null
          seating_capacity?: number | null
          seller_notes?: string | null
          service_history?: Json | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          suggested_categories?: string[] | null
          tags?: string[] | null
          test_drive_available?: boolean | null
          transmission?: string | null
          updated_at?: string
          variant?: string | null
          vehicle_category?: string[] | null
          vehicle_type?: string | null
          videos?: string[] | null
          viewing_schedule?: Json | null
          warranty_info?: Json | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_dealer_public: {
        Args: { _dealer_id: string }
        Returns: boolean
      }
      can_view_dealer_transaction: {
        Args: { _dealer_id: string }
        Returns: boolean
      }
      check_dealer_email_exists: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      check_email_simple: {
        Args: { email_to_check: string }
        Returns: boolean
      }
      complete_onboarding: {
        Args: { p_dealer_id: string }
        Returns: undefined
      }
      get_pending_kyb_dealers: {
        Args: Record<PropertyKey, never>
        Returns: {
          business_name: string
          created_at: string
          email: string
          id: string
          verification_status: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      log_onboarding_action: {
        Args: {
          p_action: string
          p_dealer_id: string
          p_new_values?: Json
          p_old_values?: Json
          p_step?: string
        }
        Returns: undefined
      }
      reject_dealer: {
        Args: { p_dealer_id: string; p_reason: string; p_rejected_by: string }
        Returns: undefined
      }
      save_bank_details_to_table: {
        Args: {
          p_account_holder_name: string
          p_account_number: string
          p_bank_name: string
          p_cancelled_cheque_url?: string
          p_dealer_id: string
          p_ifsc_code: string
        }
        Returns: string
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      update_dealer_verification: {
        Args: {
          dealer_id: string
          new_status: string
          notes?: string
          verified_by_email?: string
        }
        Returns: boolean
      }
      update_onboarding_progress: {
        Args: {
          p_current_step?: number
          p_data: Json
          p_dealer_id: string
          p_step: string
        }
        Returns: undefined
      }
      verify_dealer: {
        Args: { p_dealer_id: string; p_verified_by: string }
        Returns: undefined
      }
    }
    Enums: {
      access_level: "L0" | "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7"
      document_status: "pending" | "approved" | "rejected"
      inquiry_status: "new" | "in_progress" | "resolved" | "closed"
      inspection_status: "pending" | "scheduled" | "completed" | "failed"
      logistics_status:
        | "pending"
        | "assigned"
        | "in_transit"
        | "delivered"
        | "cancelled"
      payment_method: "upi" | "card" | "netbanking" | "cash" | "other"
      payment_status: "pending" | "success" | "failed" | "refunded"
      rto_status:
        | "pending"
        | "submitted"
        | "approved"
        | "rejected"
        | "cancelled"
      txn_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "failed"
        | "offer_made"
        | "offer_accepted"
        | "offer_rejected"
        | "counter_offer"
        | "negotiating"
        | "payment_pending"
        | "payment_completed"
        | "escrow_pending"
        | "escrow_released"
        | "logistics_pending"
        | "logistics_completed"
        | "rto_pending"
        | "rto_completed"
        | "disputed"
        | "archived"
        | "accepted"
      user_type:
        | "group_dealer"
        | "individual_org"
        | "franchise"
        | "wholesale_trader"
        | "consignment_seller"
        | "fleet_corporate"
        | "nbfc_bank"
        | "govt_psu"
        | "rental_leasing"
        | "agri_construction"
        | "2w_3w_network"
        | "dsa_broker"
        | "chauffeur_driver"
        | "self_user"
        | "partner"
      vehicle_status: "active" | "inactive" | "sold" | "draft" | "live"
      vehicle_type_enum: "personal" | "commercial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      access_level: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"],
      document_status: ["pending", "approved", "rejected"],
      inquiry_status: ["new", "in_progress", "resolved", "closed"],
      inspection_status: ["pending", "scheduled", "completed", "failed"],
      logistics_status: [
        "pending",
        "assigned",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      payment_method: ["upi", "card", "netbanking", "cash", "other"],
      payment_status: ["pending", "success", "failed", "refunded"],
      rto_status: ["pending", "submitted", "approved", "rejected", "cancelled"],
      txn_status: [
        "pending",
        "completed",
        "cancelled",
        "failed",
        "offer_made",
        "offer_accepted",
        "offer_rejected",
        "counter_offer",
        "negotiating",
        "payment_pending",
        "payment_completed",
        "escrow_pending",
        "escrow_released",
        "logistics_pending",
        "logistics_completed",
        "rto_pending",
        "rto_completed",
        "disputed",
        "archived",
        "accepted",
      ],
      user_type: [
        "group_dealer",
        "individual_org",
        "franchise",
        "wholesale_trader",
        "consignment_seller",
        "fleet_corporate",
        "nbfc_bank",
        "govt_psu",
        "rental_leasing",
        "agri_construction",
        "2w_3w_network",
        "dsa_broker",
        "chauffeur_driver",
        "self_user",
        "partner",
      ],
      vehicle_status: ["active", "inactive", "sold", "draft", "live"],
      vehicle_type_enum: ["personal", "commercial"],
    },
  },
} as const
