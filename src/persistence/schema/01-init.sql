-- Work Dashboard Schema
-- This schema supports the Work Dashboard API (Issue #25)

-- Readiness Trends (from Issue #9 - Readiness Scoring Engine)
CREATE TABLE IF NOT EXISTS readiness_scores (
    id SERIAL PRIMARY KEY,
    service_id VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    section_scores JSONB,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_readiness_scores_service ON readiness_scores(service_id);
CREATE INDEX idx_readiness_scores_recorded ON readiness_scores(recorded_at);

-- Resilience Backlog (from Issue #23 - Control Recommendation Engine)
CREATE TABLE IF NOT EXISTS controls (
    id SERIAL PRIMARY KEY,
    control_type VARCHAR(50) NOT NULL CHECK (control_type IN ('PREVENT', 'DETECT', 'RESPOND', 'LEARN')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    incident_id INTEGER,
    service_id VARCHAR(255),
    priority VARCHAR(20) CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(20) DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_controls_service ON controls(service_id);
CREATE INDEX idx_controls_status ON controls(status);
CREATE INDEX idx_controls_priority ON controls(priority);

-- Incident-derived Work (from Issue #24 - GitHub Issue Creation Agent)
CREATE TABLE IF NOT EXISTS work_items (
    id SERIAL PRIMARY KEY,
    external_id VARCHAR(255),
    external_system VARCHAR(50) CHECK (external_system IN ('GITHUB', 'JIRA', 'LINEAR')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    work_type VARCHAR(50) CHECK (work_type IN ('REMEDIATION', 'INVESTIGATION', 'DOCUMENTATION', 'MODEL_UPDATE')),
    control_id INTEGER REFERENCES controls(id),
    incident_id INTEGER,
    service_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED')),
    assigned_to VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_items_service ON work_items(service_id);
CREATE INDEX idx_work_items_status ON work_items(status);
CREATE INDEX idx_work_items_control ON work_items(control_id);

-- Incidents (referenced by controls and work items)
CREATE TABLE IF NOT EXISTS incidents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('SEV1', 'SEV2', 'SEV3', 'SEV4')),
    service_id VARCHAR(255),
    started_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    impact TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incidents_service ON incidents(service_id);
CREATE INDEX idx_incidents_started ON incidents(started_at);

-- Services (minimal for now, will be expanded)
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
