-- PostgreSQL schema for DroneTV AI Support & Lead Assistant
CREATE TABLE IF NOT EXISTS enquiries (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  phone       VARCHAR(20)   NOT NULL,
  user_type   VARCHAR(20)   NOT NULL CHECK (user_type IN ('Student', 'Customer', 'Other')),
  interest    VARCHAR(150)  NOT NULL,
  message     TEXT          NOT NULL,
  status      VARCHAR(20)   NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'In Progress', 'Closed')),
  source      VARCHAR(20)   NOT NULL DEFAULT 'form' CHECK (source IN ('form', 'chatbot')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status     ON enquiries (status);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_type  ON enquiries (user_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at DESC);
