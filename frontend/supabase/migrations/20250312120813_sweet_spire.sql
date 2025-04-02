/*
  # Create messages table for SQLite

  1. New Tables
    - messages: Store chat messages between users and AI
    
  2. Features
    - Foreign key constraints
    - Indexes for performance
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  feedback TEXT, -- JSON string for feedback data
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable foreign key support
PRAGMA foreign_keys = ON;