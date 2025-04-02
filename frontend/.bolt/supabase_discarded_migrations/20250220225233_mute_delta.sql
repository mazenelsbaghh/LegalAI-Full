-- Create table for storing default prompts
CREATE TABLE default_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  content text NOT NULL,
  is_default boolean DEFAULT false,
  api_key text,
  lawyer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on default_prompts
ALTER TABLE default_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for default_prompts
CREATE POLICY "Enable read for own prompts"
  ON default_prompts
  FOR SELECT
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Enable insert for own prompts"
  ON default_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Enable update for own prompts"
  ON default_prompts
  FOR UPDATE
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Enable delete for own prompts"
  ON default_prompts
  FOR DELETE
  TO authenticated
  USING (
    lawyer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_default_prompts_lawyer_id ON default_prompts(lawyer_id);
CREATE INDEX idx_default_prompts_is_default ON default_prompts(is_default);

-- Insert initial default prompts
INSERT INTO default_prompts (label, content, is_default, lawyer_id)
VALUES 
  ('مذكرة دفوع شاملة', 'قم بإنشاء مذكرة دفوع قانونية، مع إضافة النصوص القانونية بأرقام المواد المناسبة من سياق القضية، وقم بإدراج أكبر عدد ممكن من الدفوع ذات الصلة بالقضية.', true, NULL),
  ('صيغة دعوى قضائية', 'قم بكتابة صيغة دعوى قانونية تشمل نصوص القانون المصري وأرقام المواد، مع إضافة الطلبات الختامية بشكل منظم.', false, NULL),
  ('تحليل مستند قانوني', 'قم بتحليل هذا المستند القانوني وحدد أهم النقاط القانونية، مع ذكر النصوص القانونية وأرقام المواد ذات الصلة.', false, NULL),
  ('صياغة عقد قانوني', 'قم بصياغة عقد قانوني متكامل يتضمن الشروط العامة والخاصة، مع ذكر القوانين التي تحكم بنود العقد.', false, NULL);