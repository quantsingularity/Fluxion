-- Fluxion database initialization
-- Runs automatically on first start of PostgreSQL container

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fluxion TO fluxion;
