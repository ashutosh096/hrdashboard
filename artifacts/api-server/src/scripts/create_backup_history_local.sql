DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'backup_trigger') THEN 
    CREATE TYPE backup_trigger AS ENUM ('MANUAL', 'CRON'); 
  END IF; 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'backup_status') THEN 
    CREATE TYPE backup_status AS ENUM ('SUCCESS', 'FAILED'); 
  END IF; 
END $$; 

CREATE TABLE IF NOT EXISTS backup_history ( 
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), 
  filename varchar(255) NOT NULL, 
  file_path text NOT NULL, 
  file_size_bytes bigint NOT NULL DEFAULT 0, 
  trigger_type backup_trigger NOT NULL, 
  status backup_status NOT NULL, 
  verification_result jsonb DEFAULT '[]'::jsonb, 
  error_message text, 
  created_at timestamptz NOT NULL DEFAULT now() 
);
