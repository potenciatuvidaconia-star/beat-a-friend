export type GroupMode = 'basic' | 'pro'
export type MemberStatus = 'active' | 'pending_payment' | 'warned' | 'banned'
export type PaymentStatus = 'pending' | 'confirmed'
export type MatchStage = 'group' | 'round_of_32' | 'round_of_16' | 'quarter' | 'semi' | 'third' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          avatar_url?: string | null
          is_admin?: boolean
        }
        Update: {
          display_name?: string
          avatar_url?: string | null
        }
      }
      groups: {
        Row: {
          id: string
          name: string
          code: string
          mode: GroupMode
          owner_id: string
          yappy_number: string
          created_at: string
        }
        Insert: {
          name: string
          code: string
          mode: GroupMode
          owner_id: string
          yappy_number: string
        }
        Update: {
          name?: string
        }
      }
      group_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          status: MemberStatus
          payment_status: PaymentStatus
          warning_deadline: string | null
          apodo: string | null
          points: number
          joined_at: string
        }
        Insert: {
          group_id: string
          user_id: string
          status?: MemberStatus
          payment_status?: PaymentStatus
        }
        Update: {
          status?: MemberStatus
          payment_status?: PaymentStatus
          warning_deadline?: string | null
          apodo?: string | null
          points?: number
        }
      }
      matches: {
        Row: {
          id: string
          api_id: number
          home_team: string
          away_team: string
          home_flag: string
          away_flag: string
          stage: MatchStage
          match_date: string
          status: MatchStatus
          home_score: number | null
          away_score: number | null
          created_at: string
        }
        Insert: {
          api_id: number
          home_team: string
          away_team: string
          home_flag: string
          away_flag: string
          stage: MatchStage
          match_date: string
          status?: MatchStatus
          home_score?: number | null
          away_score?: number | null
        }
        Update: {
          status?: MatchStatus
          home_score?: number | null
          away_score?: number | null
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          group_id: string
          match_id: string
          // basic mode: '1' | 'X' | '2'
          // pro mode: home_pred + away_pred
          prediction: string | null
          home_pred: number | null
          away_pred: number | null
          points_earned: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          group_id: string
          match_id: string
          prediction?: string | null
          home_pred?: number | null
          away_pred?: number | null
        }
        Update: {
          prediction?: string | null
          home_pred?: number | null
          away_pred?: number | null
          points_earned?: number | null
        }
      }
    }
  }
}
