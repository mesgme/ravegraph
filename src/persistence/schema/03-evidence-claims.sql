-- Evidence Ledger core schema (Issue #3)

CREATE TABLE IF NOT EXISTS evidence_items (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) NOT NULL REFERENCES services(id),
    evidence_type VARCHAR(100) NOT NULL CHECK (evidence_type IN ('SBOM', 'VULNERABILITY_SCAN', 'MONITORING', 'TESTING', 'DEPLOYMENT', 'PROVENANCE', 'CONFIGURATION', 'OTHER')),
    source VARCHAR(500) NOT NULL,
    body JSONB NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    ttl_hours INTEGER,
    collected_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_items_service ON evidence_items (service_id);
CREATE INDEX IF NOT EXISTS idx_evidence_items_type ON evidence_items (evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidence_items_tags ON evidence_items USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_evidence_items_collected ON evidence_items (collected_at);
CREATE INDEX IF NOT EXISTS idx_evidence_items_expires ON evidence_items (expires_at);

CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) NOT NULL REFERENCES services(id),
    title VARCHAR(500) NOT NULL,
    section VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN' CHECK (status IN ('PASS', 'PARTIAL', 'FAIL', 'UNKNOWN')),
    confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claims_service ON claims (service_id);
CREATE INDEX IF NOT EXISTS idx_claims_section ON claims (section);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims (status);

CREATE TABLE IF NOT EXISTS claim_evidence (
    claim_id INTEGER NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    evidence_id INTEGER NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
    PRIMARY KEY (claim_id, evidence_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_evidence ON claim_evidence (evidence_id);
