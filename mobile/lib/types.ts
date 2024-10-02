export type User = {
    id: string;
    name: string;
    email: string;
    image_url?: string;
    created_at: Date;
    updated_at?: Date;
};

export type UserProfile = {
    id: string;
    name: string;
    email: string;
    image_url?: string;
    created_at: Date;
    updated_at?: Date;
    total_friends: number;
    total_matches: number;
};

export type Player = {
    id: string;
    name: string;
    email: string;
    image_url?: string;
};

export type Match = {
    id: string;
    match_date: Date;
    duration_minutes: number;
    created_by: Player;
    team1_score: number;
    team2_score: number;
    team1_player1: Player;
    team1_player2?: Player;
    team2_player1?: Player;
    team2_player2?: Player;
    created_at: Date;
    updated_at?: Date;
};

export type Stats = {
    total_matches: number;
    matches_by_month?: { month: string; matches: number }[];
    leaderboard?: {
        id: string;
        image_url?: string;
        rank: number;
        name: string;
        matches: number;
        wins: number;
        losses: number;
        win_percentage: number;
    }[];
};
