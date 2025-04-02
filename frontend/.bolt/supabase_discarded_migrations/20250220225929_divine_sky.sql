/*
  # Add default prompts management
  
  1. New Tables
    - `default_prompts`
      - `id` (uuid, primary key)
      - `label` (text, prompt name/title)
      - `content` (text, prompt content)
      - `is_default` (boolean, whether this is the default prompt)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
  2. Security
    - Enable RLS on `default_prompts` table
    - Add policies for admin access
    
  3. Initial Data
    - Add some default legal prompts
*/

-- Create default prompts table
CREATE TABLE default_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  content text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE default_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all authenticated users"
  ON default_prompts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for admins only"
  ON default_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add initial prompts
INSERT INTO default_prompts (label, content, is_default, created_at, updated_at)
VALUES
  (
    'مذكرة دفوع شاملة',
    'قم بإنشاء مذكرة دفوع قانونية، مع إضافة النصوص القانونية بأرقام المواد المناسبة من سياق القضية، وقم بإدراج أكبر عدد ممكن من الدفوع ذات الصلة بالقضية.',
    true,
    now(),
    now()
  ),
  (
    'صيغة دعوى قضائية',
    'قم بكتابة صيغة دعوى قانونية تشمل نصوص القانون المصري وأرقام المواد، مع إضافة الطلبات الختامية بشكل منظم.',
    false,
    now(),
    now()
  ),
  (
    'تحليل مستند قانوني',
    'قم بتحليل هذا المستند القانوني وحدد أهم النقاط القانونية، مع ذكر النصوص القانونية وأرقام المواد ذات الصلة.',
    false,
    now(),
    now()
  ),
  (
    'صياغة عقد قانوني',
    'قم بصياغة عقد قانوني متكامل يتضمن الشروط العامة والخاصة، مع ذكر القوانين التي تحكم بنود العقد.',
    false,
    now(),
    now()
  );

-- Create function to ensure only one default prompt
CREATE OR REPLACE FUNCTION ensure_single_default_prompt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE default_prompts
    SET is_default = false
    WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER ensure_single_default_prompt_trigger
  BEFORE INSERT OR UPDATE ON default_prompts
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_prompt();

-- Create indexes
CREATE INDEX idx_default_prompts_is_default ON default_prompts(is_default);
CREATE INDEX idx_default_prompts_created_at ON default_prompts(created_at);