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
    PostgrestVersion: "14.5"
  }
  public: {
      Tables: {
        profiles: {
          Row: {
            city: string | null
            country: string | null
            created_at: string
            full_name: string | null
            id: string
            language: string | null
            phone: string | null
            referral_code: string | null
            region: string | null
            signup_role: string | null
            updated_at: string
          }
          Insert: {
            city?: string | null
            country?: string | null
            created_at?: string
            full_name?: string | null
            id: string
            language?: string | null
            phone?: string | null
            referral_code?: string | null
            region?: string | null
            signup_role?: string | null
            updated_at?: string
          }
          Update: {
            city?: string | null
            country?: string | null
            created_at?: string
            full_name?: string | null
            id?: string
            language?: string | null
            phone?: string | null
            referral_code?: string | null
            region?: string | null
            signup_role?: string | null
            updated_at?: string
          }
          Relationships: []
        }
        categories: {
          Row: { id: string; name: string; slug: string; description: string | null; created_at: string }
          Insert: { id?: string; name: string; slug: string; description?: string | null; created_at?: string }
          Update: { id?: string; name?: string; slug?: string; description?: string | null; created_at?: string }
          Relationships: []
        }
        products: {
          Row: { id: string; seller_id: string; category_id: string | null; title: string; description: string | null; price: number; currency: string; stock_quantity: number; status: string; created_at: string; updated_at: string }
          Insert: { id?: string; seller_id: string; category_id?: string | null; title: string; description?: string | null; price: number; currency?: string; stock_quantity?: number; status?: string; created_at?: string; updated_at?: string }
          Update: { id?: string; seller_id?: string; category_id?: string | null; title?: string; description?: string | null; price?: number; currency?: string; stock_quantity?: number; status?: string; created_at?: string; updated_at?: string }
          Relationships: [
            { foreignKeyName: "products_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
            { foreignKeyName: "products_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }
          ]
        }
        product_images: {
          Row: { id: string; product_id: string; image_url: string; display_order: number; created_at: string }
          Insert: { id?: string; product_id: string; image_url: string; display_order?: number; created_at?: string }
          Update: { id?: string; product_id?: string; image_url?: string; display_order?: number; created_at?: string }
          Relationships: [ { foreignKeyName: "product_images_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] } ]
        }
        orders: {
          Row: { id: string; buyer_id: string; total_amount: number; status: string; shipping_address: string | null; created_at: string; updated_at: string }
          Insert: { id?: string; buyer_id: string; total_amount: number; status?: string; shipping_address?: string | null; created_at?: string; updated_at?: string }
          Update: { id?: string; buyer_id?: string; total_amount?: number; status?: string; shipping_address?: string | null; created_at?: string; updated_at?: string }
          Relationships: [ { foreignKeyName: "orders_buyer_id_fkey"; columns: ["buyer_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] } ]
        }
        order_items: {
          Row: { id: string; order_id: string; product_id: string; seller_id: string; quantity: number; unit_price: number; subtotal: number; created_at: string }
          Insert: { id?: string; order_id: string; product_id: string; seller_id: string; quantity: number; unit_price: number; subtotal: number; created_at?: string }
          Update: { id?: string; order_id?: string; product_id?: string; seller_id?: string; quantity?: number; unit_price?: number; subtotal?: number; created_at?: string }
          Relationships: [
            { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
            { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] },
            { foreignKeyName: "order_items_seller_id_fkey"; columns: ["seller_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
          ]
        }
        wallets: {
          Row: { id: string; profile_id: string; balance: number; currency: string; created_at: string; updated_at: string }
          Insert: { id?: string; profile_id: string; balance?: number; currency?: string; created_at?: string; updated_at?: string }
          Update: { id?: string; profile_id?: string; balance?: number; currency?: string; created_at?: string; updated_at?: string }
          Relationships: [ { foreignKeyName: "wallets_profile_id_fkey"; columns: ["profile_id"]; isOneToOne: true; referencedRelation: "profiles"; referencedColumns: ["id"] } ]
        }
        wallet_transactions: {
          Row: { id: string; wallet_id: string; amount: number; type: string; reference: string | null; description: string | null; status: string; created_at: string }
          Insert: { id?: string; wallet_id: string; amount: number; type: string; reference?: string | null; description?: string | null; status?: string; created_at?: string }
          Update: { id?: string; wallet_id?: string; amount?: number; type?: string; reference?: string | null; description?: string | null; status?: string; created_at?: string }
          Relationships: [ { foreignKeyName: "wallet_transactions_wallet_id_fkey"; columns: ["wallet_id"]; isOneToOne: false; referencedRelation: "wallets"; referencedColumns: ["id"] } ]
        }
        deliveries: {
          Row: { id: string; order_id: string; logistics_partner_id: string | null; status: string; tracking_number: string | null; estimated_delivery: string | null; created_at: string; updated_at: string }
          Insert: { id?: string; order_id: string; logistics_partner_id?: string | null; status?: string; tracking_number?: string | null; estimated_delivery?: string | null; created_at?: string; updated_at?: string }
          Update: { id?: string; order_id?: string; logistics_partner_id?: string | null; status?: string; tracking_number?: string | null; estimated_delivery?: string | null; created_at?: string; updated_at?: string }
          Relationships: [
            { foreignKeyName: "deliveries_order_id_fkey"; columns: ["order_id"]; isOneToOne: true; referencedRelation: "orders"; referencedColumns: ["id"] },
            { foreignKeyName: "deliveries_logistics_partner_id_fkey"; columns: ["logistics_partner_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
          ]
        }
        chats: {
          Row: { id: string; participant_one: string; participant_two: string; product_id: string | null; created_at: string; updated_at: string }
          Insert: { id?: string; participant_one: string; participant_two: string; product_id?: string | null; created_at?: string; updated_at?: string }
          Update: { id?: string; participant_one?: string; participant_two?: string; product_id?: string | null; created_at?: string; updated_at?: string }
          Relationships: [
            { foreignKeyName: "chats_participant_one_fkey"; columns: ["participant_one"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
            { foreignKeyName: "chats_participant_two_fkey"; columns: ["participant_two"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] },
            { foreignKeyName: "chats_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }
          ]
        }
        messages: {
          Row: { id: string; chat_id: string; sender_id: string; content: string; is_read: boolean; created_at: string }
          Insert: { id?: string; chat_id: string; sender_id: string; content: string; is_read?: boolean; created_at?: string }
          Update: { id?: string; chat_id?: string; sender_id?: string; content?: string; is_read?: boolean; created_at?: string }
          Relationships: [
            { foreignKeyName: "messages_chat_id_fkey"; columns: ["chat_id"]; isOneToOne: false; referencedRelation: "chats"; referencedColumns: ["id"] },
            { foreignKeyName: "messages_sender_id_fkey"; columns: ["sender_id"]; isOneToOne: false; referencedRelation: "profiles"; referencedColumns: ["id"] }
          ]
        }
      }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
