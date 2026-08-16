-- LTI 1.3 platform registry
CREATE TABLE IF NOT EXISTS lti_platforms (
    id              SERIAL PRIMARY KEY,
    issuer          TEXT NOT NULL,
    client_id       TEXT NOT NULL,
    auth_endpoint   TEXT NOT NULL,
    jwks_endpoint   TEXT NOT NULL,
    token_endpoint  TEXT NOT NULL,
    deployment_id   TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (issuer, client_id)
);

-- Temporary state/nonce store (10-min TTL enforced in application)
CREATE TABLE IF NOT EXISTS lti_states (
    state       TEXT PRIMARY KEY,
    nonce       TEXT NOT NULL,
    platform_id INTEGER NOT NULL REFERENCES lti_platforms(id) ON DELETE CASCADE,
    target_uri  TEXT NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL
);

-- Auto-clean expired states
CREATE INDEX IF NOT EXISTS idx_lti_states_expires ON lti_states (expires_at);
