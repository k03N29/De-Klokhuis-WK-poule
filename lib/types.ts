export interface User {
  id: string
  name: string
  total_points: number
  beers_drunk: number
  adts_drunk: number
  avatar_url?: string | null
}

export interface Country {
  id: number
  name: string
  flag_emoji: string
  owner_id: string | null
}

export interface Match {
  id: number
  team1: string
  team2: string
  score1: number | null
  score2: number | null
  is_nl_match: boolean
  played_at: string | null
}

export interface ScheduledMatch {
  id: number
  team1: string
  team2: string
  match_date: string | null
  is_nl_match: boolean
  score1: number | null
  score2: number | null
  status: 'upcoming' | 'live' | 'finished'
  round_name: string | null
  predictions_locked: boolean
}

export interface ScheduledPrediction {
  id: number
  user_id: string
  match_id: number
  predicted_score1: number
  predicted_score2: number
  points_awarded: number
  adt_uitgedeeld: boolean
}

export interface Prediction {
  id: number
  user_id: string
  match_id: number
  predicted_score1: number
  predicted_score2: number
  points_awarded: number
}

export interface GlobalState {
  id: number
  wout_status: 'idle' | 'subbed_in' | 'scored'
  draft_completed: boolean
  ad_wedstrijd_active: boolean
  ad_wedstrijd_winner_id: string | null
  adt_uitdeel_active: boolean
  adt_uitdeel_by_user_id: string | null
  nl_tegenpunt_alert: boolean
}

export interface PointEvent {
  id: number
  user_id: string
  points: number
  reason: string
  created_at: string
}

export interface NlScorerPrediction {
  id: number
  user_id: string
  match_id: number
  scorer1_name: string
  scorer1_position: 'aanvaller' | 'middenvelder' | 'verdediger'
  scorer2_name: string
  scorer2_position: 'aanvaller' | 'middenvelder' | 'verdediger'
  points_awarded: number
}

export interface QuizQuestion {
  id: number
  question_date: string
  match_reference: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  correct_option: 'A' | 'B' | 'C' | null
}

export interface QuizAnswer {
  id: number
  user_id: string
  question_id: number
  chosen_option: 'A' | 'B' | 'C'
  points_awarded: number
}

export interface NlGoal {
  id: number
  match_id: number
  scorer_name: string
  scorer_position: 'aanvaller' | 'middenvelder' | 'verdediger'
  created_at: string
}
