-- Use existing database
USE codespace_db;

-- Create users table if not exists (matches your exact structure)
CREATE TABLE IF NOT EXISTS users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  is_admin tinyint(1) DEFAULT '0',
  last_active datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create saved_code table if not exists (matches your exact structure)
CREATE TABLE IF NOT EXISTS saved_code (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  code_content text NOT NULL,
  created_at datetime NOT NULL,
  analysis_result text,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT saved_code_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert Teacher account only if it doesn't exist
INSERT IGNORE INTO users (username, password, is_admin) 
VALUES ('Teacher', 'Password01', 1);

-- Note: Your existing student accounts will remain unchanged