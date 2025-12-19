-- Time Travel Tycoon Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS time_travel_tycoon;
USE time_travel_tycoon;

-- Users table for authentication
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Game sessions table for save/load functionality
CREATE TABLE game_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_name VARCHAR(100) DEFAULT 'Main Game',
    game_state JSON NOT NULL,
    credits INT DEFAULT 5000,
    energy INT DEFAULT 100,
    max_energy INT DEFAULT 100,
    stability INT DEFAULT 75,
    max_stability INT DEFAULT 100,
    coins_per_second INT DEFAULT 0,
    current_era VARCHAR(20) DEFAULT 'dashboard',
    total_credits_earned INT DEFAULT 0,
    time_played_seconds INT DEFAULT 0,
    total_mini_games_played INT DEFAULT 0,
    paradox_level INT DEFAULT 0,
    score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_score (score DESC),
    INDEX idx_updated_at (updated_at DESC)
);

-- Mini-game scores table
CREATE TABLE mini_game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    timeline ENUM('past', 'present', 'future') NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    rewards JSON,
    duration_seconds INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    INDEX idx_user_timeline (user_id, timeline),
    INDEX idx_game_score (game_id, score DESC),
    INDEX idx_completed_at (completed_at DESC)
);

-- Resources tracking per era
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    timeline ENUM('past', 'present', 'future') NOT NULL,
    influence INT DEFAULT 0,
    artifacts INT DEFAULT 0,
    coal INT DEFAULT 0,
    metal INT DEFAULT 0,
    mechanical_output INT DEFAULT 0,
    technology INT DEFAULT 0,
    money INT DEFAULT 0,
    energy_grid INT DEFAULT 0,
    efficiency INT DEFAULT 0,
    innovations INT DEFAULT 0,
    hyper_energy INT DEFAULT 0,
    fusion_output INT DEFAULT 0,
    ai_productivity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_timeline (session_id, timeline),
    INDEX idx_timeline (timeline)
);

-- Timeline stability tracking
CREATE TABLE timeline_stability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    timeline ENUM('past', 'present', 'future') NOT NULL,
    stability INT DEFAULT 75,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_timeline_stability (session_id, timeline),
    INDEX idx_stability (stability DESC)
);

-- Random events history
CREATE TABLE random_events_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    event_data JSON NOT NULL,
    choice_made VARCHAR(100),
    resolution JSON,
    impact JSON,
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_event (session_id, event_id),
    INDEX idx_triggered_at (triggered_at DESC)
);

-- User achievements and progress
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id VARCHAR(50) NOT NULL,
    achievement_data JSON NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id)
);

-- Leaderboard entries
CREATE TABLE leaderboards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    leaderboard_type ENUM('score', 'credits', 'mini_games', 'time_played') NOT NULL,
    value INT NOT NULL,
    rank_position INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    INDEX idx_type_value (leaderboard_type, value DESC),
    INDEX idx_recorded_at (recorded_at DESC)
);

-- Multiplayer sessions (for future real-time features)
CREATE TABLE multiplayer_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_code VARCHAR(10) UNIQUE NOT NULL,
    host_user_id INT NOT NULL,
    max_players INT DEFAULT 4,
    current_players INT DEFAULT 1,
    session_status ENUM('waiting', 'active', 'ended') DEFAULT 'waiting',
    game_mode VARCHAR(50) DEFAULT 'cooperative',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session_code (session_code),
    INDEX idx_status (session_status)
);

-- Player participation in multiplayer
CREATE TABLE multiplayer_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_ready BOOLEAN DEFAULT FALSE,
    is_host BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (session_id) REFERENCES multiplayer_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_session_user (session_id, user_id),
    INDEX idx_session_id (session_id)
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, display_name) VALUES 
('admin', 'admin@timetravel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lez5Y5H8M6G7K4K5K', 'Admin User'),
('demo', 'demo@timetravel.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Lez5Y5H8M6G7K4K5K', 'Demo Player');

-- Create views for common queries
CREATE VIEW top_scores AS
SELECT 
    u.display_name,
    u.username,
    gs.score,
    gs.total_credits_earned,
    gs.total_mini_games_played,
    gs.updated_at as last_played
FROM game_sessions gs
JOIN users u ON gs.user_id = u.id
WHERE gs.is_active = TRUE
ORDER BY gs.score DESC
LIMIT 100;

CREATE VIEW mini_game_leaderboard AS
SELECT 
    timeline,
    game_id,
    u.display_name,
    mgs.score,
    mgs.completed_at
FROM mini_game_scores mgs
JOIN users u ON mgs.user_id = u.id
ORDER BY mgs.score DESC, mgs.completed_at ASC
LIMIT 50;

-- Create stored procedures for common operations
DELIMITER //
CREATE PROCEDURE GetUserGameSession(IN user_id_param INT, IN session_name_param VARCHAR(100))
BEGIN
    SELECT * FROM game_sessions 
    WHERE user_id = user_id_param AND session_name = session_name_param AND is_active = TRUE;
END //

CREATE PROCEDURE UpdateUserScore(IN user_id_param INT, IN session_id_param INT, IN new_score INT)
BEGIN
    UPDATE game_sessions 
    SET score = GREATEST(score, new_score), updated_at = CURRENT_TIMESTAMP 
    WHERE id = session_id_param AND user_id = user_id_param;
END //

CREATE PROCEDURE GetLeaderboard(IN leaderboard_type_param VARCHAR(50), IN limit_param INT)
BEGIN
    CASE leaderboard_type_param
        WHEN 'score' THEN
            SELECT u.display_name, gs.score, gs.updated_at as last_played
            FROM game_sessions gs
            JOIN users u ON gs.user_id = u.id
            WHERE gs.is_active = TRUE
            ORDER BY gs.score DESC
            LIMIT limit_param;
        WHEN 'mini_games' THEN
            SELECT u.display_name, gs.total_mini_games_played, gs.updated_at as last_played
            FROM game_sessions gs
            JOIN users u ON gs.user_id = u.id
            WHERE gs.is_active = TRUE
            ORDER BY gs.total_mini_games_played DESC
            LIMIT limit_param;
        ELSE
            SELECT 'Invalid leaderboard type' as message;
    END CASE;
END //
DELIMITER ;
