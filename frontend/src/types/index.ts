// Team types
export interface Team {
    id: number;
    team_code: string;
    name: string;
    short_name: string;
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    matches_played: number;
    matches_won: number;
    matches_lost: number;
    matches_tied: number;
    net_run_rate: number;
    points: number;
    players?: PlayerSummary[];
  }
  
  export interface TeamStats {
    team: Team;
    overall: {
      matches: number;
      wins: number;
      losses: number;
      no_results: number;
      win_percentage: number;
      points: number;
      net_run_rate: number;
    };
    batting: {
      total_runs: number;
      batting_average: number;
      run_rate: number;
    };
    bowling: {
      wickets_taken: number;
      bowling_average: number;
      economy_rate: number;
    };
    venues: {
      venue: string;
      matches: number;
      wins: number;
      win_percentage: number;
    }[];
    toss: {
      toss_wins: number;
      toss_win_percentage: number;
      wins_after_winning_toss: number;
      win_after_toss_percentage: number;
    };
    top_performers: {
      batsmen: {
        id: number;
        name: string;
        runs: number;
        average: number;
        strike_rate: number;
      }[];
      bowlers: {
        id: number;
        name: string;
        wickets: number;
        average: number;
        economy_rate: number;
      }[];
    };
  }
  
  export interface HeadToHead {
    team1: Team;
    team2: Team;
    head_to_head: {
      total_matches: number;
      team1_wins: number;
      team2_wins: number;
      no_results: number;
    };
    batting_records: {
      team1_highest: number;
      team1_lowest: number;
      team2_highest: number;
      team2_lowest: number;
    };
    recent_matches: MatchSummary[];
  }
  
  // Player types
  export interface PlayerSummary {
    id: number;
    name: string;
    role: string;
    image_url: string;
  }
  
  export interface Player {
    id: number;
    player_code: string;
    name: string;
    country: string;
    date_of_birth: string | null;
    batting_style: string;
    bowling_style: string;
    role: string;
    image_url: string;
    teams: {
      id: number;
      name: string;
      short_name: string;
    }[];
    stats: {
      matches: number;
      batting: {
        runs: number;
        balls_faced: number;
        highest_score: number;
        fifties: number;
        hundreds: number;
        fours: number;
        sixes: number;
        average: number;
        strike_rate: number;
      };
      bowling: {
        wickets: number;
        balls_bowled: number;
        runs_conceded: number;
        best_bowling_figures: string;
        economy_rate: number;
        average: number;
        strike_rate: number;
      };
    };
    recent_performances?: {
      batting: {
        match_id: number;
        date: string;
        against: number;
        runs: number;
        balls_faced: number;
        fours: number;
        sixes: number;
        strike_rate: number;
        dismissal_type: string;
      }[];
      bowling: {
        match_id: number;
        date: string;
        against: number;
        overs: number;
        maidens: number;
        runs: number;
        wickets: number;
        economy_rate: number;
        dot_balls: number;
      }[];
    };
  }
  
  export interface PlayerStats {
    player: Player;
    venue_stats: {
      batting: {
        venue: string;
        innings: number;
        runs: number;
        average: number;
        strike_rate: number;
        fours: number;
        sixes: number;
      }[];
      bowling: {
        venue: string;
        innings: number;
        overs: number;
        maidens: number;
        runs: number;
        wickets: number;
        economy: number;
        average: number;
        dot_balls: number;
      }[];
    };
    team_stats: {
      team: {
        id: number;
        name: string;
        short_name: string;
      };
      batting: {
        innings: number;
        runs: number;
        balls_faced: number;
        average: number;
        strike_rate: number;
      };
      bowling: {
        innings: number;
        overs: number;
        runs: number;
        wickets: number;
        economy: number;
        average: number;
      };
    }[];
    career_progression: {
      matches: number;
      runs: number;
      wickets: number;
      batting_average: number;
      bowling_average: number;
    };
  }
  
  // Match types
  export interface MatchSummary {
    id: number;
    match_code: string;
    date: string | null;
    venue: string;
    city: string;
    home_team: {
      id: number;
      name: string;
      short_name: string;
    } | null;
    away_team: {
      id: number;
      name: string;
      short_name: string;
    } | null;
    match_status: string;
    result: {
      winner: number;
      win_margin: number;
      win_type: string;
    } | null;
  }
  
  export interface Match {
    id: number;
    match_code: string;
    season: string;
    date: string | null;
    venue: string;
    city: string;
    home_team: {
      id: number;
      name: string;
      short_name: string;
      logo_url: string;
    } | null;
    away_team: {
      id: number;
      name: string;
      short_name: string;
      logo_url: string;
    } | null;
    toss: {
      winner: number;
      decision: string;
    } | null;
    match_status: string;
    result: {
      winner: number;
      win_margin: number;
      win_type: string;
    } | null;
    scores: {
      first_innings: {
        score: number;
        wickets: number;
        overs: number;
      } | null;
      second_innings: {
        score: number;
        wickets: number;
        overs: number;
      } | null;
    };
    commentary?: Commentary[];
    innings?: Innings[];
  }
  
  export interface Commentary {
    id: number;
    innings_number: number;
    over_number: number;
    ball_number: number;
    commentary_text: string;
    runs_scored: number;
    is_wicket: boolean;
    is_boundary: boolean;
    batsman_id: number;
    bowler_id: number;
    created_at: string | null;
  }
  
  export interface Innings {
    innings_number: number;
    batting_team: {
      id: number;
      name: string;
    };
    bowling_team: {
      id: number;
      name: string;
    };
    total_runs: number;
    total_wickets: number;
    total_overs: number;
    extras: number;
    batting_performances: {
      player: {
        id: number;
        name: string;
      } | null;
      runs: number;
      balls_faced: number;
      fours: number;
      sixes: number;
      strike_rate: number;
      dismissal_type: string | null;
      batting_position: number;
    }[];
    bowling_performances: {
      player: {
        id: number;
        name: string;
      } | null;
      overs: number;
      maidens: number;
      runs: number;
      wickets: number;
      economy_rate: number;
      dot_balls: number;
    }[];
  }
  
  export interface WinProbability {
    home_team_probability: number;
    away_team_probability: number;
    message: string;
  }
  
  // Prediction types
  export interface MatchPrediction {
    match: {
      id: number;
      date: string | null;
      venue: string;
      city: string;
    };
    teams: {
      home: {
        id: number;
        name: string;
        short_name: string;
        win_probability: number;
      };
      away: {
        id: number;
        name: string;
        short_name: string;
        win_probability: number;
      };
    };
    factors: {
      head_to_head: {
        total_matches: number;
        home_wins: number;
        away_wins: number;
      };
      recent_form: {
        home: {
          matches: number;
          wins: number;
        };
        away: {
          matches: number;
          wins: number;
        };
      };
      venue_advantage: {
        home: {
          matches: number;
          wins: number;
        };
        away: {
          matches: number;
          wins: number;
        };
        toss_win_match_win_percentage: number;
      };
    };
    key_players: {
      home: {
        bat: {
          id: number;
          name: string;
          runs: number;
          average: number;
          strike_rate: number;
        } | null;
        bowl: {
          id: number;
          name: string;
          wickets: number;
          economy: number;
          average: number;
        } | null;
      };
      away: {
        bat: {
          id: number;
          name: string;
          runs: number;
          average: number;
          strike_rate: number;
        } | null;
        bowl: {
          id: number;
          name: string;
          wickets: number;
          economy: number;
          average: number;
        } | null;
      };
    };
  }
  
  export interface PlayoffPrediction {
    playoff_cutoff: number;
    teams: {
      team: {
        id: number;
        name: string;
        short_name: string;
      };
      current_points: number;
      max_possible_points: number;
      remaining_matches: number;
      playoff_chance: number;
      status: 'Qualified' | 'Eliminated' | 'In Contention';
    }[];
  }
  
  export interface SeasonSimulation {
    simulations: number;
    teams: {
      team: {
        id: number;
        name: string;
        short_name: string;
      };
      playoff_percentage: number;
      championship_percentage: number;
    }[];
  }
  
  export interface PlayerPrediction {
    player: {
      id: number;
      name: string;
      role: string;
    };
    match: {
      id: number;
      venue: string;
      date: string | null;
      opposition: string;
    } | null;
    prediction: {
      batting: {
        runs: number;
        balls_faced: number;
        strike_rate: number;
        boundary_percentage: number;
      };
      bowling: {
        wickets: number;
        economy_rate: number;
        dot_ball_percentage: number;
      };
    };
    confidence: {
      batting: number;
      bowling: number;
    };
  }