-- Drop existing messages table if it exists
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  formatted_content jsonb,
  sender text NOT NULL CHECK (sender IN ('user', 'ai')),
  conversation_id uuid,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Enable read access for all authenticated users"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);