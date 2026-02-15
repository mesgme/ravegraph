-- Sample data for Work Dashboard demonstration

-- Insert sample services
INSERT INTO services (id, name, tier) VALUES
  ('api-service', 'API Service', 'TIER1'),
  ('web-service', 'Web Service', 'TIER2'),
  ('worker-service', 'Worker Service', 'TIER2');

-- Insert sample incidents
INSERT INTO incidents (title, severity, service_id, started_at, resolved_at, impact) VALUES
  ('Database connection pool exhaustion', 'SEV1', 'api-service', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days 22 hours', 'API unavailable for 2 hours'),
  ('Memory leak in worker process', 'SEV2', 'worker-service', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days 4 hours', 'Degraded processing performance'),
  ('Frontend rendering timeout', 'SEV3', 'web-service', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Slow page loads for some users');

-- Insert sample controls (resilience backlog)
INSERT INTO controls (control_type, title, description, incident_id, service_id, priority, status) VALUES
  ('PREVENT', 'Implement connection pool monitoring', 'Add alerts for connection pool saturation before exhaustion', 1, 'api-service', 'HIGH', 'APPROVED'),
  ('DETECT', 'Add memory leak detection to worker', 'Implement heap snapshot analysis in production', 2, 'worker-service', 'HIGH', 'IN_PROGRESS'),
  ('RESPOND', 'Automated worker restart on memory threshold', 'Deploy circuit breaker for memory-based restarts', 2, 'worker-service', 'MEDIUM', 'PROPOSED'),
  ('LEARN', 'Document connection pool tuning runbook', 'Create operational guide for connection pool management', 1, 'api-service', 'MEDIUM', 'COMPLETED'),
  ('PREVENT', 'Implement request timeout guards', 'Add timeout enforcement for all external calls', 3, 'web-service', 'CRITICAL', 'APPROVED'),
  ('DETECT', 'Monitor frontend render timing', 'Add RUM metrics for render performance', 3, 'web-service', 'HIGH', 'PROPOSED');

-- Insert sample work items (incident-derived work)
INSERT INTO work_items (external_id, external_system, title, description, work_type, control_id, incident_id, service_id, status, assigned_to) VALUES
  ('GH-101', 'GITHUB', 'Add connection pool monitoring alerts', 'Implement CloudWatch alerts for RDS connection pool metrics', 'REMEDIATION', 1, 1, 'api-service', 'IN_PROGRESS', 'alice'),
  ('GH-102', 'GITHUB', 'Implement memory profiling for worker', 'Add heap snapshot capture and analysis tooling', 'REMEDIATION', 2, 2, 'worker-service', 'OPEN', 'bob'),
  ('GH-103', 'GITHUB', 'Create connection pool runbook', 'Document troubleshooting steps and tuning guide', 'DOCUMENTATION', 4, 1, 'api-service', 'COMPLETED', 'charlie'),
  ('GH-104', 'GITHUB', 'Add timeout guards to API client', 'Implement timeout enforcement in service HTTP client', 'REMEDIATION', 5, 3, 'web-service', 'OPEN', NULL),
  ('JIRA-201', 'JIRA', 'Investigate memory leak root cause', 'Deep dive analysis of memory allocation patterns', 'INVESTIGATION', 2, 2, 'worker-service', 'IN_PROGRESS', 'bob');

-- Insert sample readiness scores
INSERT INTO readiness_scores (service_id, service_name, score, section_scores, recorded_at) VALUES
  ('api-service', 'API Service', 85.5, '{"deploy": 90, "monitoring": 85, "security": 82, "documentation": 85}', NOW()),
  ('api-service', 'API Service', 82.0, '{"deploy": 88, "monitoring": 80, "security": 80, "documentation": 80}', NOW() - INTERVAL '1 day'),
  ('api-service', 'API Service', 78.5, '{"deploy": 85, "monitoring": 75, "security": 78, "documentation": 76}', NOW() - INTERVAL '2 days'),
  ('web-service', 'Web Service', 72.0, '{"deploy": 75, "monitoring": 70, "security": 68, "documentation": 75}', NOW()),
  ('web-service', 'Web Service', 73.5, '{"deploy": 76, "monitoring": 72, "security": 70, "documentation": 76}', NOW() - INTERVAL '1 day'),
  ('worker-service', 'Worker Service', 68.0, '{"deploy": 70, "monitoring": 65, "security": 70, "documentation": 67}', NOW()),
  ('worker-service', 'Worker Service', 65.0, '{"deploy": 68, "monitoring": 62, "security": 68, "documentation": 62}', NOW() - INTERVAL '1 day');

-- Insert sample evidence items
INSERT INTO evidence_items (service_id, evidence_type, source, body, tags, confidence, ttl_hours, collected_at, expires_at) VALUES
  ('api-service', 'MONITORING', 'prometheus', '{"uptime": "99.95%", "p99_latency_ms": 120, "error_rate": 0.02}', ARRAY['production', 'auto'], 90, 24, NOW(), NOW() + INTERVAL '24 hours'),
  ('api-service', 'SBOM', 'syft', '{"packages": 142, "critical_vulns": 0, "high_vulns": 2}', ARRAY['auto', 'ci'], 95, 168, NOW(), NOW() + INTERVAL '168 hours'),
  ('api-service', 'DEPLOYMENT', 'argocd', '{"version": "v2.3.1", "replicas": 3, "strategy": "rolling"}', ARRAY['production'], 100, NULL, NOW(), NULL),
  ('web-service', 'MONITORING', 'datadog', '{"rum_p95_ms": 850, "js_error_rate": 0.5}', ARRAY['production', 'auto'], 80, 12, NOW(), NOW() + INTERVAL '12 hours'),
  ('worker-service', 'VULNERABILITY_SCAN', 'trivy', '{"critical": 1, "high": 3, "medium": 8}', ARRAY['ci', 'auto'], 85, 72, NOW(), NOW() + INTERVAL '72 hours');

-- Insert sample claims
INSERT INTO claims (service_id, title, section, status, confidence, reason) VALUES
  ('api-service', 'Has production monitoring', 'monitoring', 'PASS', 90, 'Prometheus metrics with alerting configured'),
  ('api-service', 'Software supply chain tracked', 'security', 'PARTIAL', 70, 'SBOM generated but 2 high vulns unaddressed'),
  ('api-service', 'Deployment is reproducible', 'deploy', 'PASS', 100, 'ArgoCD GitOps deployment verified'),
  ('web-service', 'Has production monitoring', 'monitoring', 'PARTIAL', 60, 'Datadog RUM configured but no alerting'),
  ('worker-service', 'No critical vulnerabilities', 'security', 'FAIL', 85, '1 critical vulnerability found in latest scan');

-- Link evidence to claims
INSERT INTO claim_evidence (claim_id, evidence_id) VALUES
  (1, 1),  -- monitoring claim linked to prometheus evidence
  (2, 2),  -- supply chain claim linked to SBOM evidence
  (3, 3),  -- deployment claim linked to argocd evidence
  (4, 4),  -- web monitoring claim linked to datadog evidence
  (5, 5);  -- vulnerability claim linked to trivy evidence
