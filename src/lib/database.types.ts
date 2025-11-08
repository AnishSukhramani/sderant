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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string | null
          post_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string | null
          post_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          likes_count: number | null
          name: string | null
          street_creds_count: number | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          name?: string | null
          street_creds_count?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          likes_count?: number | null
          name?: string | null
          street_creds_count?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      reactions_backup: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          post_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          post_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          post_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      street_creds: {
        Row: {
          created_at: string | null
          id: string
          ip_address: string
          post_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address: string
          post_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "street_creds_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      userinfo: {
        Row: {
          about: string | null
          address_line1: string | null
          address_line2: string | null
          archetype: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          facebook_url: string | null
          gender: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          is_public: boolean | null
          linkedin_url: string | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          state: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          about?: string | null
          address_line1?: string | null
          address_line2?: string | null
          archetype?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          gender?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          state?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          about?: string | null
          address_line1?: string | null
          address_line2?: string | null
          archetype?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          gender?: string | null
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          is_public?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          state?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "userinfo_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          name: string
          password_hash: string
          updated_at: string | null
          username_hash: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          password_hash: string
          updated_at?: string | null
          username_hash: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          password_hash?: string
          updated_at?: string | null
          username_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_userinfo_profile: {
        Args: {
          p_about?: string
          p_address_line1?: string
          p_address_line2?: string
          p_archetype?: string
          p_bio?: string
          p_city?: string
          p_country?: string
          p_email?: string
          p_facebook_url?: string
          p_gender?: string
          p_github_url?: string
          p_instagram_url?: string
          p_is_public?: boolean
          p_linkedin_url?: string
          p_phone?: string
          p_photo_url?: string
          p_postal_code?: string
          p_state?: string
          p_twitter_url?: string
          p_user_id: string
          p_username: string
        }
        Returns: {
          about: string | null
          address_line1: string | null
          address_line2: string | null
          archetype: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          facebook_url: string | null
          gender: string | null
          github_url: string | null
          id: string
          instagram_url: string | null
          is_public: boolean | null
          linkedin_url: string | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          state: string | null
          twitter_url: string | null
          updated_at: string | null
          user_id: string
          username: string
        }
        SetofOptions: {
          from: "*"
          to: "userinfo"
          isOneToOne: true
          isSetofReturn: false
        }
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
  public: {
    Enums: {},
  },
} as const
