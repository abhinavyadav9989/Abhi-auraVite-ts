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
  auth: {
    Tables: {
      audit_log_entries: {
        Row: {
          created_at: string | null
          id: string
          instance_id: string | null
          ip_address: string
          payload: Json | null
        }
        Insert: {
          created_at?: string | null
          id: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          instance_id?: string | null
          ip_address?: string
          payload?: Json | null
        }
        Relationships: []
      }
      flow_state: {
        Row: {
          auth_code: string
          auth_code_issued_at: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at: string | null
          id: string
          provider_access_token: string | null
          provider_refresh_token: string | null
          provider_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth_code: string
          auth_code_issued_at?: string | null
          authentication_method: string
          code_challenge: string
          code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth_code?: string
          auth_code_issued_at?: string | null
          authentication_method?: string
          code_challenge?: string
          code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
          created_at?: string | null
          id?: string
          provider_access_token?: string | null
          provider_refresh_token?: string | null
          provider_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      identities: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          identity_data: Json
          last_sign_in_at: string | null
          provider: string
          provider_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data: Json
          last_sign_in_at?: string | null
          provider: string
          provider_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          identity_data?: Json
          last_sign_in_at?: string | null
          provider?: string
          provider_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      instances: {
        Row: {
          created_at: string | null
          id: string
          raw_base_config: string | null
          updated_at: string | null
          uuid: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raw_base_config?: string | null
          updated_at?: string | null
          uuid?: string | null
        }
        Relationships: []
      }
      mfa_amr_claims: {
        Row: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          authentication_method: string
          created_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Update: {
          authentication_method?: string
          created_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mfa_amr_claims_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_challenges: {
        Row: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code: string | null
          verified_at: string | null
          web_authn_session_data: Json | null
        }
        Insert: {
          created_at: string
          factor_id: string
          id: string
          ip_address: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Update: {
          created_at?: string
          factor_id?: string
          id?: string
          ip_address?: unknown
          otp_code?: string | null
          verified_at?: string | null
          web_authn_session_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
            columns: ["factor_id"]
            isOneToOne: false
            referencedRelation: "mfa_factors"
            referencedColumns: ["id"]
          },
        ]
      }
      mfa_factors: {
        Row: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name: string | null
          id: string
          last_challenged_at: string | null
          phone: string | null
          secret: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid: string | null
          web_authn_credential: Json | null
        }
        Insert: {
          created_at: string
          factor_type: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status: Database["auth"]["Enums"]["factor_status"]
          updated_at: string
          user_id: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Update: {
          created_at?: string
          factor_type?: Database["auth"]["Enums"]["factor_type"]
          friendly_name?: string | null
          id?: string
          last_challenged_at?: string | null
          phone?: string | null
          secret?: string | null
          status?: Database["auth"]["Enums"]["factor_status"]
          updated_at?: string
          user_id?: string
          web_authn_aaguid?: string | null
          web_authn_credential?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mfa_factors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      one_time_tokens: {
        Row: {
          created_at: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          relates_to: string
          token_hash: string
          token_type: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relates_to?: string
          token_hash?: string
          token_type?: Database["auth"]["Enums"]["one_time_token_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_time_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      refresh_tokens: {
        Row: {
          created_at: string | null
          id: number
          instance_id: string | null
          parent: string | null
          revoked: boolean | null
          session_id: string | null
          token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          instance_id?: string | null
          parent?: string | null
          revoked?: boolean | null
          session_id?: string | null
          token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refresh_tokens_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_providers: {
        Row: {
          attribute_mapping: Json | null
          created_at: string | null
          entity_id: string
          id: string
          metadata_url: string | null
          metadata_xml: string
          name_id_format: string | null
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id: string
          id: string
          metadata_url?: string | null
          metadata_xml: string
          name_id_format?: string | null
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          attribute_mapping?: Json | null
          created_at?: string | null
          entity_id?: string
          id?: string
          metadata_url?: string | null
          metadata_xml?: string
          name_id_format?: string | null
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_providers_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      saml_relay_states: {
        Row: {
          created_at: string | null
          flow_state_id: string | null
          for_email: string | null
          id: string
          redirect_to: string | null
          request_id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id: string
          redirect_to?: string | null
          request_id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          flow_state_id?: string | null
          for_email?: string | null
          id?: string
          redirect_to?: string | null
          request_id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saml_relay_states_flow_state_id_fkey"
            columns: ["flow_state_id"]
            isOneToOne: false
            referencedRelation: "flow_state"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      schema_migrations: {
        Row: {
          version: string
        }
        Insert: {
          version: string
        }
        Update: {
          version?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          aal: Database["auth"]["Enums"]["aal_level"] | null
          created_at: string | null
          factor_id: string | null
          id: string
          ip: unknown | null
          not_after: string | null
          refreshed_at: string | null
          tag: string | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          aal?: Database["auth"]["Enums"]["aal_level"] | null
          created_at?: string | null
          factor_id?: string | null
          id?: string
          ip?: unknown | null
          not_after?: string | null
          refreshed_at?: string | null
          tag?: string | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id: string
          sso_provider_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          sso_provider_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sso_domains_sso_provider_id_fkey"
            columns: ["sso_provider_id"]
            isOneToOne: false
            referencedRelation: "sso_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sso_providers: {
        Row: {
          created_at: string | null
          disabled: boolean | null
          id: string
          resource_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          disabled?: boolean | null
          id: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          disabled?: boolean | null
          id?: string
          resource_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string
          instance_id: string | null
          invited_at: string | null
          is_anonymous: boolean
          is_sso_user: boolean
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string
          instance_id?: string | null
          invited_at?: string | null
          is_anonymous?: boolean
          is_sso_user?: boolean
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      email: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      jwt: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      aal_level: "aal1" | "aal2" | "aal3"
      code_challenge_method: "s256" | "plain"
      factor_status: "unverified" | "verified"
      factor_type: "totp" | "webauthn" | "phone"
      one_time_token_type:
        | "confirmation_token"
        | "reauthentication_token"
        | "recovery_token"
        | "email_change_token_new"
        | "email_change_token_current"
        | "phone_change_token"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string | null
          dealer_id: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          dealer_id: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          dealer_id?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
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
      attribute_fields: {
        Row: {
          attribute_set_id: string
          category: string | null
          conditional_required: boolean | null
          created_at: string | null
          default_value: Json | null
          field_group: string | null
          help_text: string | null
          id: string
          is_required: boolean | null
          label: string
          name: string
          options: Json | null
          order_position: number
          placeholder: string | null
          precision: number | null
          tooltip: string | null
          type: string
          unit: string | null
          updated_at: string | null
          validation: Json | null
        }
        Insert: {
          attribute_set_id: string
          category?: string | null
          conditional_required?: boolean | null
          created_at?: string | null
          default_value?: Json | null
          field_group?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label: string
          name: string
          options?: Json | null
          order_position: number
          placeholder?: string | null
          precision?: number | null
          tooltip?: string | null
          type: string
          unit?: string | null
          updated_at?: string | null
          validation?: Json | null
        }
        Update: {
          attribute_set_id?: string
          category?: string | null
          conditional_required?: boolean | null
          created_at?: string | null
          default_value?: Json | null
          field_group?: string | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          label?: string
          name?: string
          options?: Json | null
          order_position?: number
          placeholder?: string | null
          precision?: number | null
          tooltip?: string | null
          type?: string
          unit?: string | null
          updated_at?: string | null
          validation?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attribute_fields_attribute_set_id_fkey"
            columns: ["attribute_set_id"]
            isOneToOne: false
            referencedRelation: "attribute_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      attribute_sets: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
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
      branch_hierarchy: {
        Row: {
          address: string | null
          branch_id: string
          branch_type: string
          city: string | null
          created_at: string | null
          depth: number | null
          employee_count: number | null
          id: string
          is_active: boolean | null
          level: string
          manager_id: string | null
          monthly_target: number | null
          name: string
          parent_id: string | null
          path: string | null
          phone: string | null
          region: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          branch_id: string
          branch_type: string
          city?: string | null
          created_at?: string | null
          depth?: number | null
          employee_count?: number | null
          id?: string
          is_active?: boolean | null
          level: string
          manager_id?: string | null
          monthly_target?: number | null
          name: string
          parent_id?: string | null
          path?: string | null
          phone?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          branch_id?: string
          branch_type?: string
          city?: string | null
          created_at?: string | null
          depth?: number | null
          employee_count?: number | null
          id?: string
          is_active?: boolean | null
          level?: string
          manager_id?: string | null
          monthly_target?: number | null
          name?: string
          parent_id?: string | null
          path?: string | null
          phone?: string | null
          region?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_hierarchy_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: true
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_hierarchy_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: true
            referencedRelation: "branches_with_dealer_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_hierarchy_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "branch_hierarchy"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_themes: {
        Row: {
          accent_color: string
          banner_url: string | null
          border_radius: string | null
          branch_id: string
          button_style: string | null
          created_at: string | null
          custom_css: string | null
          font_family: string | null
          id: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          updated_at: string | null
        }
        Insert: {
          accent_color: string
          banner_url?: string | null
          border_radius?: string | null
          branch_id: string
          button_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          primary_color: string
          secondary_color: string
          updated_at?: string | null
        }
        Update: {
          accent_color?: string
          banner_url?: string | null
          border_radius?: string | null
          branch_id?: string
          button_style?: string | null
          created_at?: string | null
          custom_css?: string | null
          font_family?: string | null
          id?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_themes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: true
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_themes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: true
            referencedRelation: "branches_with_dealer_info"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          branch_type: string | null
          city: string | null
          contact_number: string | null
          created_at: string | null
          dealer_id: string | null
          hierarchy_level: number | null
          id: string
          is_default: boolean | null
          manager_id: string | null
          name: string
          parent_branch_id: string | null
          state: string | null
          updated_at: string | null
          vehicle_count: number | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          branch_type?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          hierarchy_level?: number | null
          id?: string
          is_default?: boolean | null
          manager_id?: string | null
          name: string
          parent_branch_id?: string | null
          state?: string | null
          updated_at?: string | null
          vehicle_count?: number | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          branch_type?: string | null
          city?: string | null
          contact_number?: string | null
          created_at?: string | null
          dealer_id?: string | null
          hierarchy_level?: number | null
          id?: string
          is_default?: boolean | null
          manager_id?: string | null
          name?: string
          parent_branch_id?: string | null
          state?: string | null
          updated_at?: string | null
          vehicle_count?: number | null
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
          {
            foreignKeyName: "branches_parent_branch_id_fkey"
            columns: ["parent_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_parent_branch_id_fkey"
            columns: ["parent_branch_id"]
            isOneToOne: false
            referencedRelation: "branches_with_dealer_info"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_operation_details: {
        Row: {
          bulk_operation_id: string
          error_message: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          processed_at: string | null
          record_id: string
          record_type: string
          status: string
        }
        Insert: {
          bulk_operation_id: string
          error_message?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          processed_at?: string | null
          record_id: string
          record_type: string
          status: string
        }
        Update: {
          bulk_operation_id?: string
          error_message?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          processed_at?: string | null
          record_id?: string
          record_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_operation_details_bulk_operation_id_fkey"
            columns: ["bulk_operation_id"]
            isOneToOne: false
            referencedRelation: "bulk_operations_log"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_operations_log: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          dealer_id: string
          error_message: string | null
          failed_records: number | null
          id: string
          operation_type: string
          parameters: Json | null
          requires_approval: boolean | null
          started_at: string | null
          status: string | null
          successful_records: number | null
          total_records: number
          user_id: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          dealer_id: string
          error_message?: string | null
          failed_records?: number | null
          id?: string
          operation_type: string
          parameters?: Json | null
          requires_approval?: boolean | null
          started_at?: string | null
          status?: string | null
          successful_records?: number | null
          total_records: number
          user_id: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          dealer_id?: string
          error_message?: string | null
          failed_records?: number | null
          id?: string
          operation_type?: string
          parameters?: Json | null
          requires_approval?: boolean | null
          started_at?: string | null
          status?: string | null
          successful_records?: number | null
          total_records?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_operations_log_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
        ]
      }
      dealer_activation_audit: {
        Row: {
          action_details: Json | null
          action_type: string
          changed_at: string | null
          changed_by: string | null
          dealer_id: string
          id: string
          ip_address: unknown | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          changed_at?: string | null
          changed_by?: string | null
          dealer_id: string
          id?: string
          ip_address?: unknown | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          changed_at?: string | null
          changed_by?: string | null
          dealer_id?: string
          id?: string
          ip_address?: unknown | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_activation_audit_dealer_id_fkey"
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
      dealer_unlocked_features: {
        Row: {
          dealer_id: string
          feature_id: string
          id: string
          is_active: boolean | null
          unlocked_at: string | null
          unlocked_by_step: number | null
        }
        Insert: {
          dealer_id: string
          feature_id: string
          id?: string
          is_active?: boolean | null
          unlocked_at?: string | null
          unlocked_by_step?: number | null
        }
        Update: {
          dealer_id?: string
          feature_id?: string
          id?: string
          is_active?: boolean | null
          unlocked_at?: string | null
          unlocked_by_step?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dealer_unlocked_features_dealer_id_fkey"
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
          activation_audit_log: Json | null
          activation_completed: boolean | null
          activation_date: string | null
          address: string | null
          advanced_specs_enabled: boolean | null
          auto_approval_limit: number | null
          auto_create_inspection_jobs: boolean | null
          automation_level: string | null
          bank_details: Json | null
          bank_details_added: boolean | null
          banner_url: string | null
          branch_specific_colors: boolean | null
          branches_added: boolean | null
          brand_coverage: Json | null
          bulk_volume_expected: string | null
          business_hours: Json | null
          business_mode: Json | null
          business_name: string | null
          business_type: string | null
          certifications: string[] | null
          checklist_required: boolean | null
          checklist_templates: string[] | null
          city: string | null
          client_type: string | null
          conditional_fields_enabled: boolean | null
          consent_receipt: Json | null
          consistent_theme: boolean | null
          contact_number: string | null
          created_at: string
          created_by: string | null
          current_branches: number | null
          current_onboarding_step: number | null
          custom_branding: boolean | null
          dashboard_type: string | null
          data_sources: string[] | null
          description: string | null
          draft_data: Json | null
          email: string
          email_verified: boolean | null
          expected_growth: string | null
          gstin: string | null
          has_sub_branches: boolean | null
          id: string
          intake_checks: boolean | null
          is_featured: boolean | null
          is_premium: boolean | null
          is_verified: boolean | null
          key_metrics: string[] | null
          kyb_completed: boolean | null
          kyb_data: Json | null
          kyc_completed: boolean | null
          last_activation_update: string | null
          logo_url: string | null
          multi_stage_approvals: boolean | null
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
          pdi_required: boolean | null
          phone: string | null
          phone_verified: boolean | null
          photo_verification: boolean | null
          pincode: string | null
          plan_selection: Json | null
          preferred_carriers: string[] | null
          price_bands_enabled: boolean | null
          rating: number | null
          report_frequency: string | null
          specializations: string[] | null
          state: string | null
          status: string | null
          submitted_at: string | null
          tagline: string | null
          total_reviews: number | null
          total_sales: number | null
          total_vehicles: number | null
          updated_at: string
          use_external_carriers: boolean | null
          use_internal_drivers: boolean | null
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
          activation_audit_log?: Json | null
          activation_completed?: boolean | null
          activation_date?: string | null
          address?: string | null
          advanced_specs_enabled?: boolean | null
          auto_approval_limit?: number | null
          auto_create_inspection_jobs?: boolean | null
          automation_level?: string | null
          bank_details?: Json | null
          bank_details_added?: boolean | null
          banner_url?: string | null
          branch_specific_colors?: boolean | null
          branches_added?: boolean | null
          brand_coverage?: Json | null
          bulk_volume_expected?: string | null
          business_hours?: Json | null
          business_mode?: Json | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          checklist_required?: boolean | null
          checklist_templates?: string[] | null
          city?: string | null
          client_type?: string | null
          conditional_fields_enabled?: boolean | null
          consent_receipt?: Json | null
          consistent_theme?: boolean | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          current_branches?: number | null
          current_onboarding_step?: number | null
          custom_branding?: boolean | null
          dashboard_type?: string | null
          data_sources?: string[] | null
          description?: string | null
          draft_data?: Json | null
          email: string
          email_verified?: boolean | null
          expected_growth?: string | null
          gstin?: string | null
          has_sub_branches?: boolean | null
          id?: string
          intake_checks?: boolean | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          key_metrics?: string[] | null
          kyb_completed?: boolean | null
          kyb_data?: Json | null
          kyc_completed?: boolean | null
          last_activation_update?: string | null
          logo_url?: string | null
          multi_stage_approvals?: boolean | null
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
          pdi_required?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          photo_verification?: boolean | null
          pincode?: string | null
          plan_selection?: Json | null
          preferred_carriers?: string[] | null
          price_bands_enabled?: boolean | null
          rating?: number | null
          report_frequency?: string | null
          specializations?: string[] | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          tagline?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          total_vehicles?: number | null
          updated_at?: string
          use_external_carriers?: boolean | null
          use_internal_drivers?: boolean | null
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
          activation_audit_log?: Json | null
          activation_completed?: boolean | null
          activation_date?: string | null
          address?: string | null
          advanced_specs_enabled?: boolean | null
          auto_approval_limit?: number | null
          auto_create_inspection_jobs?: boolean | null
          automation_level?: string | null
          bank_details?: Json | null
          bank_details_added?: boolean | null
          banner_url?: string | null
          branch_specific_colors?: boolean | null
          branches_added?: boolean | null
          brand_coverage?: Json | null
          bulk_volume_expected?: string | null
          business_hours?: Json | null
          business_mode?: Json | null
          business_name?: string | null
          business_type?: string | null
          certifications?: string[] | null
          checklist_required?: boolean | null
          checklist_templates?: string[] | null
          city?: string | null
          client_type?: string | null
          conditional_fields_enabled?: boolean | null
          consent_receipt?: Json | null
          consistent_theme?: boolean | null
          contact_number?: string | null
          created_at?: string
          created_by?: string | null
          current_branches?: number | null
          current_onboarding_step?: number | null
          custom_branding?: boolean | null
          dashboard_type?: string | null
          data_sources?: string[] | null
          description?: string | null
          draft_data?: Json | null
          email?: string
          email_verified?: boolean | null
          expected_growth?: string | null
          gstin?: string | null
          has_sub_branches?: boolean | null
          id?: string
          intake_checks?: boolean | null
          is_featured?: boolean | null
          is_premium?: boolean | null
          is_verified?: boolean | null
          key_metrics?: string[] | null
          kyb_completed?: boolean | null
          kyb_data?: Json | null
          kyc_completed?: boolean | null
          last_activation_update?: string | null
          logo_url?: string | null
          multi_stage_approvals?: boolean | null
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
          pdi_required?: boolean | null
          phone?: string | null
          phone_verified?: boolean | null
          photo_verification?: boolean | null
          pincode?: string | null
          plan_selection?: Json | null
          preferred_carriers?: string[] | null
          price_bands_enabled?: boolean | null
          rating?: number | null
          report_frequency?: string | null
          specializations?: string[] | null
          state?: string | null
          status?: string | null
          submitted_at?: string | null
          tagline?: string | null
          total_reviews?: number | null
          total_sales?: number | null
          total_vehicles?: number | null
          updated_at?: string
          use_external_carriers?: boolean | null
          use_internal_drivers?: boolean | null
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
      document_ocr_data: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          document_id: string
          field_name: string
          field_value: string | null
          id: string
          is_validated: boolean | null
          ocr_result_id: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          document_id: string
          field_name: string
          field_value?: string | null
          id?: string
          is_validated?: boolean | null
          ocr_result_id?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          document_id?: string
          field_name?: string
          field_value?: string | null
          id?: string
          is_validated?: boolean | null
          ocr_result_id?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_ocr_data_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vehicle_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_ocr_data_ocr_result_id_fkey"
            columns: ["ocr_result_id"]
            isOneToOne: false
            referencedRelation: "ocr_processing_results"
            referencedColumns: ["id"]
          },
        ]
      }
      field_dependencies: {
        Row: {
          action_message: string | null
          action_severity: string | null
          action_target_class: string | null
          action_target_options: Json | null
          action_target_value: Json | null
          action_type: string
          attribute_set_id: string
          condition_operator: string
          condition_value: Json | null
          condition_values: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          source_field_id: string
          target_field_id: string
          updated_at: string | null
        }
        Insert: {
          action_message?: string | null
          action_severity?: string | null
          action_target_class?: string | null
          action_target_options?: Json | null
          action_target_value?: Json | null
          action_type: string
          attribute_set_id: string
          condition_operator: string
          condition_value?: Json | null
          condition_values?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          source_field_id: string
          target_field_id: string
          updated_at?: string | null
        }
        Update: {
          action_message?: string | null
          action_severity?: string | null
          action_target_class?: string | null
          action_target_options?: Json | null
          action_target_value?: Json | null
          action_type?: string
          attribute_set_id?: string
          condition_operator?: string
          condition_value?: Json | null
          condition_values?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          source_field_id?: string
          target_field_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "field_dependencies_attribute_set_id_fkey"
            columns: ["attribute_set_id"]
            isOneToOne: false
            referencedRelation: "attribute_sets"
            referencedColumns: ["id"]
          },
        ]
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
      market_trends: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          data_points: number | null
          id: string
          last_updated: string | null
          make: string
          model: string
          percentage_change: number | null
          region: string | null
          time_period: string | null
          trend: string | null
          year: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          data_points?: number | null
          id?: string
          last_updated?: string | null
          make: string
          model: string
          percentage_change?: number | null
          region?: string | null
          time_period?: string | null
          trend?: string | null
          year?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          data_points?: number | null
          id?: string
          last_updated?: string | null
          make?: string
          model?: string
          percentage_change?: number | null
          region?: string | null
          time_period?: string | null
          trend?: string | null
          year?: number | null
        }
        Relationships: []
      }
      ocr_processing_results: {
        Row: {
          confidence: number | null
          dealer_id: string
          document_id: string
          document_type: string
          errors: string[] | null
          extracted_data: Json | null
          id: string
          processed_at: string | null
          processed_by: string | null
          processing_time: number | null
          raw_text: string | null
          success: boolean
          vehicle_id: string
          warnings: string[] | null
        }
        Insert: {
          confidence?: number | null
          dealer_id: string
          document_id: string
          document_type: string
          errors?: string[] | null
          extracted_data?: Json | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_time?: number | null
          raw_text?: string | null
          success?: boolean
          vehicle_id: string
          warnings?: string[] | null
        }
        Update: {
          confidence?: number | null
          dealer_id?: string
          document_id?: string
          document_type?: string
          errors?: string[] | null
          extracted_data?: Json | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          processing_time?: number | null
          raw_text?: string | null
          success?: boolean
          vehicle_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ocr_processing_results_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_processing_results_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vehicle_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocr_processing_results_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_catalog_cache: {
        Row: {
          cached_at: string | null
          confidence: number | null
          expires_at: string | null
          id: string
          search_params: Json
          search_results: Json | null
          total_count: number | null
        }
        Insert: {
          cached_at?: string | null
          confidence?: number | null
          expires_at?: string | null
          id?: string
          search_params: Json
          search_results?: Json | null
          total_count?: number | null
        }
        Update: {
          cached_at?: string | null
          confidence?: number | null
          expires_at?: string | null
          id?: string
          search_params?: Json
          search_results?: Json | null
          total_count?: number | null
        }
        Relationships: []
      }
      oem_catalog_vehicles: {
        Row: {
          category: string[] | null
          colors: Json | null
          created_at: string | null
          dimensions: Json | null
          engine_capacity: number | null
          features: string[] | null
          fuel_type: string
          id: string
          is_active: boolean | null
          last_updated: string | null
          make: string
          model: string
          power: number | null
          price_range: Json | null
          seating_capacity: number | null
          torque: number | null
          transmission: string
          variant: string
          year: number
        }
        Insert: {
          category?: string[] | null
          colors?: Json | null
          created_at?: string | null
          dimensions?: Json | null
          engine_capacity?: number | null
          features?: string[] | null
          fuel_type: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          make: string
          model: string
          power?: number | null
          price_range?: Json | null
          seating_capacity?: number | null
          torque?: number | null
          transmission: string
          variant: string
          year: number
        }
        Update: {
          category?: string[] | null
          colors?: Json | null
          created_at?: string | null
          dimensions?: Json | null
          engine_capacity?: number | null
          features?: string[] | null
          fuel_type?: string
          id?: string
          is_active?: boolean | null
          last_updated?: string | null
          make?: string
          model?: string
          power?: number | null
          price_range?: Json | null
          seating_capacity?: number | null
          torque?: number | null
          transmission?: string
          variant?: string
          year?: number
        }
        Relationships: []
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
      pricing_history: {
        Row: {
          change_reason: string | null
          change_type: string | null
          changed_at: string | null
          changed_by: string | null
          dealer_id: string
          id: string
          new_price: number | null
          old_price: number | null
          vehicle_id: string
        }
        Insert: {
          change_reason?: string | null
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          dealer_id: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          vehicle_id: string
        }
        Update: {
          change_reason?: string | null
          change_type?: string | null
          changed_at?: string | null
          changed_by?: string | null
          dealer_id?: string
          id?: string
          new_price?: number | null
          old_price?: number | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_history_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
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
          branch_id: string | null
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
          branch_id?: string | null
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
          branch_id?: string | null
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
            foreignKeyName: "team_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_with_dealer_info"
            referencedColumns: ["id"]
          },
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
      vehicle_attribute_sets: {
        Row: {
          attribute_set_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          updated_at: string | null
          values: Json | null
          vehicle_id: string
        }
        Insert: {
          attribute_set_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          values?: Json | null
          vehicle_id: string
        }
        Update: {
          attribute_set_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
          values?: Json | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_attribute_sets_attribute_set_id_fkey"
            columns: ["attribute_set_id"]
            isOneToOne: false
            referencedRelation: "attribute_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_attribute_sets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_condition: {
        Row: {
          brake_pad_percentage: number | null
          created_at: string | null
          id: string
          inspection_date: string | null
          inspection_report_url: string | null
          inspector_id: string | null
          interior_condition: string | null
          mechanical_condition: string | null
          notes: string | null
          odb_codes: string[] | null
          overall_rating: number | null
          paint_condition: string | null
          paint_meter_readings: Json | null
          tyre_condition: string | null
          tyre_tread_mm: number | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          brake_pad_percentage?: number | null
          created_at?: string | null
          id?: string
          inspection_date?: string | null
          inspection_report_url?: string | null
          inspector_id?: string | null
          interior_condition?: string | null
          mechanical_condition?: string | null
          notes?: string | null
          odb_codes?: string[] | null
          overall_rating?: number | null
          paint_condition?: string | null
          paint_meter_readings?: Json | null
          tyre_condition?: string | null
          tyre_tread_mm?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          brake_pad_percentage?: number | null
          created_at?: string | null
          id?: string
          inspection_date?: string | null
          inspection_report_url?: string | null
          inspector_id?: string | null
          interior_condition?: string | null
          mechanical_condition?: string | null
          notes?: string | null
          odb_codes?: string[] | null
          overall_rating?: number | null
          paint_condition?: string | null
          paint_meter_readings?: Json | null
          tyre_condition?: string | null
          tyre_tread_mm?: number | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_condition_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_documents: {
        Row: {
          created_at: string | null
          document_type: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          is_verified: boolean | null
          ocr_data: Json | null
          updated_at: string | null
          uploaded_at: string | null
          vehicle_id: string | null
          verification_date: string | null
          verification_notes: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_verified?: boolean | null
          ocr_data?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
          verification_date?: string | null
          verification_notes?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_verified?: boolean | null
          ocr_data?: Json | null
          updated_at?: string | null
          uploaded_at?: string | null
          vehicle_id?: string | null
          verification_date?: string | null
          verification_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
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
      vehicle_price_analytics: {
        Row: {
          confidence: number | null
          created_at: string | null
          dealer_id: string
          display_price: number | null
          exposure_mode: string | null
          factors: string[] | null
          id: string
          market_trend: string | null
          max_price: number | null
          message: string | null
          min_price: number | null
          price_type: string | null
          suggested_price: number | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          dealer_id: string
          display_price?: number | null
          exposure_mode?: string | null
          factors?: string[] | null
          id?: string
          market_trend?: string | null
          max_price?: number | null
          message?: string | null
          min_price?: number | null
          price_type?: string | null
          suggested_price?: number | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          dealer_id?: string
          display_price?: number | null
          exposure_mode?: string | null
          factors?: string[] | null
          id?: string
          market_trend?: string | null
          max_price?: number | null
          message?: string | null
          min_price?: number | null
          price_type?: string | null
          suggested_price?: number | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_price_analytics_dealer_id_fkey"
            columns: ["dealer_id"]
            isOneToOne: false
            referencedRelation: "dealers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_price_analytics_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          accident_history: boolean | null
          ai_confidence: string | null
          ai_metadata: Json | null
          ai_reasoning: string | null
          asking_price: number | null
          auto_filled_fields: Json | null
          base_cost: number | null
          body_type: string | null
          branch_id: string | null
          buyer_requirements: Json | null
          color: string | null
          condition_notes: string | null
          condition_rating: number | null
          consignment_terms: Json | null
          created_at: string
          created_by: string | null
          custom_attributes: Json | null
          dealer_id: string
          dealer_margin_target: number | null
          dealer_net: number | null
          dealer_price: number | null
          description: string | null
          documents: string[] | null
          emi_available: boolean | null
          engine_size: string | null
          exchange_available: boolean | null
          exposure_mode: string | null
          features: string[] | null
          financing_options: Json | null
          fuel_type: string | null
          hero_image_url: string | null
          id: string
          identification_method: string | null
          images: string[] | null
          inspection_report_url: string | null
          insurance_status: string | null
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
          paint_ok: boolean | null
          price: number | null
          publish_at: string | null
          publish_schedule: string | null
          puc_valid_until: string | null
          rc_available: boolean | null
          registration_number: string | null
          rto_location: string | null
          seating_capacity: number | null
          seller_notes: string | null
          service_history: Json | null
          service_history_available: boolean | null
          service_records_uploaded: boolean | null
          shown_price: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          stock_type: string | null
          suggested_categories: string[] | null
          tags: string[] | null
          test_drive_available: boolean | null
          transmission: string | null
          tyres_ok: boolean | null
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
          accident_history?: boolean | null
          ai_confidence?: string | null
          ai_metadata?: Json | null
          ai_reasoning?: string | null
          asking_price?: number | null
          auto_filled_fields?: Json | null
          base_cost?: number | null
          body_type?: string | null
          branch_id?: string | null
          buyer_requirements?: Json | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          consignment_terms?: Json | null
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json | null
          dealer_id: string
          dealer_margin_target?: number | null
          dealer_net?: number | null
          dealer_price?: number | null
          description?: string | null
          documents?: string[] | null
          emi_available?: boolean | null
          engine_size?: string | null
          exchange_available?: boolean | null
          exposure_mode?: string | null
          features?: string[] | null
          financing_options?: Json | null
          fuel_type?: string | null
          hero_image_url?: string | null
          id?: string
          identification_method?: string | null
          images?: string[] | null
          inspection_report_url?: string | null
          insurance_status?: string | null
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
          paint_ok?: boolean | null
          price?: number | null
          publish_at?: string | null
          publish_schedule?: string | null
          puc_valid_until?: string | null
          rc_available?: boolean | null
          registration_number?: string | null
          rto_location?: string | null
          seating_capacity?: number | null
          seller_notes?: string | null
          service_history?: Json | null
          service_history_available?: boolean | null
          service_records_uploaded?: boolean | null
          shown_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_type?: string | null
          suggested_categories?: string[] | null
          tags?: string[] | null
          test_drive_available?: boolean | null
          transmission?: string | null
          tyres_ok?: boolean | null
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
          accident_history?: boolean | null
          ai_confidence?: string | null
          ai_metadata?: Json | null
          ai_reasoning?: string | null
          asking_price?: number | null
          auto_filled_fields?: Json | null
          base_cost?: number | null
          body_type?: string | null
          branch_id?: string | null
          buyer_requirements?: Json | null
          color?: string | null
          condition_notes?: string | null
          condition_rating?: number | null
          consignment_terms?: Json | null
          created_at?: string
          created_by?: string | null
          custom_attributes?: Json | null
          dealer_id?: string
          dealer_margin_target?: number | null
          dealer_net?: number | null
          dealer_price?: number | null
          description?: string | null
          documents?: string[] | null
          emi_available?: boolean | null
          engine_size?: string | null
          exchange_available?: boolean | null
          exposure_mode?: string | null
          features?: string[] | null
          financing_options?: Json | null
          fuel_type?: string | null
          hero_image_url?: string | null
          id?: string
          identification_method?: string | null
          images?: string[] | null
          inspection_report_url?: string | null
          insurance_status?: string | null
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
          paint_ok?: boolean | null
          price?: number | null
          publish_at?: string | null
          publish_schedule?: string | null
          puc_valid_until?: string | null
          rc_available?: boolean | null
          registration_number?: string | null
          rto_location?: string | null
          seating_capacity?: number | null
          seller_notes?: string | null
          service_history?: Json | null
          service_history_available?: boolean | null
          service_records_uploaded?: boolean | null
          shown_price?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_type?: string | null
          suggested_categories?: string[] | null
          tags?: string[] | null
          test_drive_available?: boolean | null
          transmission?: string | null
          tyres_ok?: boolean | null
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
            foreignKeyName: "vehicles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches_with_dealer_info"
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
      vin_mapping_rules: {
        Row: {
          brand: string
          created_at: string | null
          field_mappings: Json | null
          id: string
          is_active: boolean | null
          model: string | null
          priority: number | null
          updated_at: string | null
          vin_pattern: string
          year_range: Json | null
        }
        Insert: {
          brand: string
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          priority?: number | null
          updated_at?: string | null
          vin_pattern: string
          year_range?: Json | null
        }
        Update: {
          brand?: string
          created_at?: string | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          model?: string | null
          priority?: number | null
          updated_at?: string | null
          vin_pattern?: string
          year_range?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      branches_with_dealer_info: {
        Row: {
          address: string | null
          city: string | null
          contact_number: string | null
          created_at: string | null
          dealer_email: string | null
          dealer_id: string | null
          dealer_name: string | null
          id: string | null
          is_default: boolean | null
          manager_id: string | null
          name: string | null
          state: string | null
          updated_at: string | null
          working_hours: Json | null
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
      can_view_vehicle_price: {
        Args: {
          vehicle_dealer_id: string
          vehicle_exposure_mode: string
          viewer_dealer_id: string
          viewer_kyc_status: boolean
        }
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
      check_storage_bucket_exists: {
        Args: { bucket_name: string }
        Returns: boolean
      }
      check_storage_bucket_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      complete_onboarding: {
        Args: { p_dealer_id: string }
        Returns: undefined
      }
      create_vehicle_documents_bucket: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_vehicle_documents_delete_policy: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_vehicle_documents_upload_policy: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_vehicle_documents_view_policy: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dealer_has_feature_unlocked: {
        Args: { dealer_uuid: string; feature_name: string }
        Returns: boolean
      }
      debug_current_user_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          branches_count: number
          dealer_id: string
          dealer_name: string
          has_branches_access: boolean
          team_member_id: string
          team_member_role: string
          team_member_status: string
          user_email: string
        }[]
      }
      ensure_team_member_exists: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_vehicle_document_path: {
        Args: { document_type: string; file_name: string; vehicle_id: string }
        Returns: string
      }
      get_branch_hierarchy_path: {
        Args: { branch_uuid: string }
        Returns: string
      }
      get_current_user_team_member: {
        Args: Record<PropertyKey, never>
        Returns: {
          dealer_id: string
          dealer_name: string
          email: string
          role: string
          status: string
          team_member_id: string
        }[]
      }
      get_dealer_activation_status: {
        Args: { dealer_uuid: string }
        Returns: Json
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
      get_storage_bucket_url: {
        Args: { bucket_name?: string }
        Returns: string
      }
      get_vehicle_display_price: {
        Args: { vehicle_id: string; viewer_dealer_id: string }
        Returns: {
          can_view_price: boolean
          display_price: number
          exposure_mode: string
          price_type: string
        }[]
      }
      get_vehicle_documents_storage_config: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_vehicle_price_analytics: {
        Args: { vehicle_uuid: string }
        Returns: Json
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
      initialize_vehicle_documents_storage: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_bulk_operation: {
        Args: {
          dealer_uuid: string
          operation_params?: Json
          operation_type: string
          total_count: number
          user_uuid: string
        }
        Returns: string
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
      setup_current_user_team_member: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      unlock_dealer_feature: {
        Args: {
          dealer_uuid: string
          feature_name: string
          unlocked_by_step?: number
        }
        Returns: undefined
      }
      update_bulk_operation_status: {
        Args: {
          error_msg?: string
          failed_count?: number
          new_status: string
          operation_uuid: string
          successful_count?: number
        }
        Returns: undefined
      }
      update_dealer_activation_settings: {
        Args: {
          changed_by_uuid?: string
          dealer_uuid: string
          settings_data: Json
        }
        Returns: undefined
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
      validate_vehicle_document_upload: {
        Args: { file_name: string; file_size: number; file_type: string }
        Returns: Json
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
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string | null
        }
        Relationships: []
      }
      buckets_analytics: {
        Row: {
          created_at: string
          format: string
          id: string
          type: Database["storage"]["Enums"]["buckettype"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          format?: string
          id: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          format?: string
          id?: string
          type?: Database["storage"]["Enums"]["buckettype"]
          updated_at?: string
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string }
        Returns: undefined
      }
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string }
        Returns: undefined
      }
      delete_prefix: {
        Args: { _bucket_id: string; _name: string }
        Returns: boolean
      }
      extension: {
        Args: { name: string }
        Returns: string
      }
      filename: {
        Args: { name: string }
        Returns: string
      }
      foldername: {
        Args: { name: string }
        Returns: string[]
      }
      get_level: {
        Args: { name: string }
        Returns: number
      }
      get_prefix: {
        Args: { name: string }
        Returns: string
      }
      get_prefixes: {
        Args: { name: string }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          bucket_id: string
          size: number
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
          prefix_param: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          delimiter_param: string
          max_keys?: number
          next_token?: string
          prefix_param: string
          start_after?: string
        }
        Returns: {
          id: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_legacy_v1: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v1_optimised: {
        Args: {
          bucketname: string
          levels?: number
          limits?: number
          offsets?: number
          prefix: string
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          created_at: string
          id: string
          last_accessed_at: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
      search_v2: {
        Args: {
          bucket_name: string
          levels?: number
          limits?: number
          prefix: string
          start_after?: string
        }
        Returns: {
          created_at: string
          id: string
          key: string
          metadata: Json
          name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      buckettype: "STANDARD" | "ANALYTICS"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  vault: {
    Tables: {
      secrets: {
        Row: {
          created_at: string
          description: string
          id: string
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      decrypted_secrets: {
        Row: {
          created_at: string | null
          decrypted_secret: string | null
          description: string | null
          id: string | null
          key_id: string | null
          name: string | null
          nonce: string | null
          secret: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          decrypted_secret?: never
          description?: string | null
          id?: string | null
          key_id?: string | null
          name?: string | null
          nonce?: string | null
          secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _crypto_aead_det_decrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_encrypt: {
        Args: {
          additional: string
          context?: string
          key_id: number
          message: string
          nonce?: string
        }
        Returns: string
      }
      _crypto_aead_det_noncegen: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      create_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret: string
        }
        Returns: string
      }
      update_secret: {
        Args: {
          new_description?: string
          new_key_id?: string
          new_name?: string
          new_secret?: string
          secret_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  auth: {
    Enums: {
      aal_level: ["aal1", "aal2", "aal3"],
      code_challenge_method: ["s256", "plain"],
      factor_status: ["unverified", "verified"],
      factor_type: ["totp", "webauthn", "phone"],
      one_time_token_type: [
        "confirmation_token",
        "reauthentication_token",
        "recovery_token",
        "email_change_token_new",
        "email_change_token_current",
        "phone_change_token",
      ],
    },
  },
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
  storage: {
    Enums: {
      buckettype: ["STANDARD", "ANALYTICS"],
    },
  },
  vault: {
    Enums: {},
  },
} as const
