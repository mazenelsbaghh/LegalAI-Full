/*
  # Add Training Feedback Support

  1. Changes
    - Add training feedback columns to messages table
    - Add indexes for better performance
    - Add RLS policies for feedback access

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Add training feedback columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS is_training boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS feedback_correct boolean,
ADD COLUMN IF NOT EXISTS feedback_correction text;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_is_training ON messages(is_training);
CREATE INDEX IF NOT EXISTS idx_messages_feedback_correct ON messages(feedback_correct) WHERE is_training = true;

-- Enable RLS on messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Enable insert for own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for own messages"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable delete for own messages"
  ON messages
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to handle message feedback
CREATE OR REPLACE FUNCTION handle_message_feedback(
  message_id uuid,
  is_correct boolean,
  correction text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE messages
  SET 
    is_training = true,
    feedback_correct = is_correct,
    feedback_correction = correction
  WHERE id = message_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;