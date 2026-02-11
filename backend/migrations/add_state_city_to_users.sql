-- Add state and city columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_state_city ON users(state, city);
