PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token_hash
  ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS magic_links (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  requested_ip TEXT,
  requested_user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash
  ON magic_links(token_hash);

CREATE INDEX IF NOT EXISTS idx_magic_links_email_created_at
  ON magic_links(email, created_at);

CREATE TABLE IF NOT EXISTS recordings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  local_date TEXT NOT NULL,
  practice_mode TEXT NOT NULL CHECK (practice_mode IN ('daily_challenge', 'free_practice')),
  media_type TEXT NOT NULL CHECK (media_type IN ('audio', 'video')),
  prompt_pack_id TEXT NOT NULL,
  prompt_pack_version INTEGER NOT NULL CHECK (prompt_pack_version > 0),
  prompt_id TEXT NOT NULL,
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
  timer_target_ms INTEGER NOT NULL CHECK (timer_target_ms = 60000),
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL CHECK (file_size_bytes >= 0),
  is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
  is_daily_share INTEGER NOT NULL DEFAULT 0 CHECK (is_daily_share IN (0, 1)),
  camera_facing TEXT CHECK (camera_facing IN ('user', 'environment')),
  video_width INTEGER CHECK (video_width IS NULL OR video_width > 0),
  video_height INTEGER CHECK (video_height IS NULL OR video_height > 0),
  sync_status TEXT NOT NULL CHECK (
    sync_status IN (
      'local_only',
      'pending_upload',
      'uploading',
      'awaiting_finalize',
      'synced',
      'upload_failed',
      'pending_delete',
      'deleting_cloud',
      'delete_failed'
    )
  ),
  cloud_object_key TEXT,
  cloud_uploaded_at TEXT,
  sync_error_code TEXT,
  sync_error_message TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recordings_user_created_at
  ON recordings(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_recordings_sync_status_updated_at
  ON recordings(sync_status, updated_at);

CREATE TABLE IF NOT EXISTS quota_usage (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope IN ('app_total', 'user')),
  subject_user_id TEXT,
  storage_bytes INTEGER NOT NULL DEFAULT 0 CHECK (storage_bytes >= 0),
  warning_threshold_bytes INTEGER NOT NULL CHECK (warning_threshold_bytes >= 0),
  hard_limit_bytes INTEGER NOT NULL CHECK (hard_limit_bytes >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (scope = 'app_total' AND subject_user_id IS NULL) OR
    (scope = 'user' AND subject_user_id IS NOT NULL)
  ),
  UNIQUE (scope, subject_user_id),
  FOREIGN KEY (subject_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quota_usage_scope
  ON quota_usage(scope);
