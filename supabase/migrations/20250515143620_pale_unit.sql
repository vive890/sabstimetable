/*
  # Initial Schema Setup

  1. New Tables
    - master_timetable: Stores the master timetable template
    - daily_timetable: Stores the current day's timetable
    - timetable_history: Tracks historical timetable changes
    - staff_suggestions: Stores staff feedback
    - system_settings: Stores system configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Master timetable
CREATE TABLE master_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course text NOT NULL,
  day text NOT NULL,
  period1 text,
  period2 text,
  period3 text,
  period4 text,
  period5 text,
  period6 text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE master_timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON master_timetable
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to update" ON master_timetable
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Daily timetable
CREATE TABLE daily_timetable (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course text NOT NULL,
  day text NOT NULL,
  period1 text,
  period2 text,
  period3 text,
  period4 text,
  period5 text,
  period6 text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE daily_timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON daily_timetable
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to update" ON daily_timetable
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Timetable history
CREATE TABLE timetable_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  course text NOT NULL,
  day text NOT NULL,
  period1 text,
  period2 text,
  period3 text,
  period4 text,
  period5 text,
  period6 text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE timetable_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON timetable_history
  FOR SELECT TO public USING (true);

CREATE POLICY "Allow authenticated users to insert" ON timetable_history
  FOR INSERT TO authenticated WITH CHECK (true);

-- Staff suggestions
CREATE TABLE staff_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE staff_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to insert suggestions" ON staff_suggestions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read" ON staff_suggestions
  FOR SELECT TO authenticated USING (true);

-- System settings
CREATE TABLE system_settings (
  name text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access" ON system_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);