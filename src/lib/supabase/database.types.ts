/**
 * Hand-written to match supabase/migrations/0001_init.sql exactly. Once the
 * migration has run against the live project, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/supabase/database.types.ts
 * and reconcile any drift — the generated file is the source of truth after
 * that point, this hand-written version is only the bootstrap.
 *
 * Row shapes are `type` aliases, not `interface`s: wrapping an `interface`
 * in `Partial<...>` (used for the Insert/Update variants below) produces a
 * mapped type that TypeScript's structural check does NOT recognize as
 * satisfying postgrest-js's `Record<string, GenericTable>` constraint —
 * every `.select()` silently resolves to `never` with no build error until
 * you actually access a property. `type` aliases don't have this problem.
 * Confirmed empirically against @supabase/postgrest-js in this project;
 * don't change these back to `interface`.
 */

// Free-form, not an exhaustive union: `plans.id` is any text a row exists
// for — adding a plan is an insert, never a code change. Code that needs
// to special-case a specific plan imports the known-id constants from
// src/lib/plans/types.ts instead of switching over every possible value.
export type PlanId = string;
export type BillingInterval = "month" | "year";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid";
export type WorkspaceRole = "owner" | "member";
export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";
export type UsageOwnerType = "user" | "workspace";
export type DocumentStatus = "uploaded" | "processing" | "analyzing" | "completed" | "failed";
export type CitationStyle = "apa" | "vancouver" | "ieee" | "unknown";
export type SourceType = "web" | "academic" | "internal";
export type MatchType = "exact" | "near_exact" | "semantic" | "citation";
export type OriginalityReportStatus = "completed" | "failed";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  signup_source_tool: string | null;
  created_at: string;
  updated_at: string;
};

export type PlanRow = {
  id: PlanId;
  name: string;
  description: string;
  monthly_price_cents: number | null;
  annual_price_cents: number | null;
  currency: string;
  ads_enabled: boolean;
  higher_limits: boolean;
  premium_tools: boolean;
  teams_enabled: boolean;
  max_team_members: number | null;
  metadata: Record<string, unknown>;
  provider: string | null;
  provider_product_id: string | null;
  provider_price_id_monthly: string | null;
  provider_price_id_annual: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WorkspaceRow = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type WorkspaceMemberRow = {
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string | null;
  workspace_id: string | null;
  plan_id: PlanId;
  billing_interval: BillingInterval | null;
  status: SubscriptionStatus;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type ToolUsageRow = {
  id: number;
  owner_type: UsageOwnerType;
  owner_id: string;
  tool_id: string;
  usage_date: string;
  count: number;
  updated_at: string;
};

export type FavoriteRow = {
  user_id: string;
  tool_id: string;
  created_at: string;
};

export type WorkspaceInvitationRow = {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invited_by: string;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
};

export type WebhookEventRow = {
  provider: string;
  event_id: string;
  event_type: string;
  received_at: string;
};

export type RateLimitEventRow = {
  id: number;
  bucket: string;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  user_id: string;
  workspace_id: string | null;
  original_filename: string;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  status: DocumentStatus;
  failure_reason: string | null;
  page_count: number | null;
  word_count: number | null;
  language: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentChunkRow = {
  id: number;
  document_id: string;
  sequence: number;
  page_number: number | null;
  text: string;
  normalized_text: string;
  word_count: number;
  created_at: string;
};

export type CitationRow = {
  id: number;
  document_id: string;
  chunk_id: number | null;
  raw_text: string;
  style_guess: CitationStyle | null;
  created_at: string;
};

export type ReferenceVerificationStatus = "unverified" | "verified" | "not_found";

export type DocumentReferenceRow = {
  id: number;
  document_id: string;
  raw_text: string;
  parsed_author: string | null;
  parsed_year: string | null;
  parsed_title: string | null;
  verification_status: ReferenceVerificationStatus;
  matched_doi: string | null;
  matched_title: string | null;
  matched_url: string | null;
  created_at: string;
};

export type DocumentSourceRow = {
  id: number;
  url: string | null;
  title: string | null;
  author: string | null;
  published_date: string | null;
  source_type: SourceType;
  domain: string | null;
  retrieved_at: string;
  metadata: Record<string, unknown>;
};

export type SimilarityMatchRow = {
  id: number;
  document_id: string;
  chunk_id: number;
  matched_document_id: string | null;
  matched_source_id: number | null;
  match_type: MatchType;
  similarity_score: number;
  matched_text: string;
  created_at: string;
};

export type OriginalityReportRow = {
  id: string;
  document_id: string;
  similarity_index: number;
  exact_ratio: number;
  near_exact_ratio: number;
  semantic_ratio: number;
  citation_count: number;
  reference_count: number;
  engine_version: string;
  status: OriginalityReportStatus;
  created_at: string;
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      plans: {
        Row: PlanRow;
        Insert: Partial<PlanRow> & { id: PlanId; name: string };
        Update: Partial<PlanRow>;
        Relationships: [];
      };
      workspaces: {
        Row: WorkspaceRow;
        Insert: Partial<WorkspaceRow> & { name: string; owner_id: string };
        Update: Partial<WorkspaceRow>;
        Relationships: [];
      };
      workspace_members: {
        Row: WorkspaceMemberRow;
        Insert: Partial<WorkspaceMemberRow> & { workspace_id: string; user_id: string };
        Update: Partial<WorkspaceMemberRow>;
        Relationships: [];
      };
      subscriptions: {
        Row: SubscriptionRow;
        Insert: Partial<SubscriptionRow> & { plan_id: PlanId };
        Update: Partial<SubscriptionRow>;
        Relationships: [];
      };
      tool_usage: {
        Row: ToolUsageRow;
        Insert: Partial<ToolUsageRow> & { owner_type: UsageOwnerType; owner_id: string; tool_id: string };
        Update: Partial<ToolUsageRow>;
        Relationships: [];
      };
      favorites: {
        Row: FavoriteRow;
        Insert: { user_id: string; tool_id: string; created_at?: string };
        Update: Partial<FavoriteRow>;
        Relationships: [];
      };
      workspace_invitations: {
        Row: WorkspaceInvitationRow;
        Insert: Partial<WorkspaceInvitationRow> & { workspace_id: string; email: string; invited_by: string };
        Update: Partial<WorkspaceInvitationRow>;
        Relationships: [];
      };
      webhook_events: {
        Row: WebhookEventRow;
        Insert: { provider: string; event_id: string; event_type: string; received_at?: string };
        Update: Partial<WebhookEventRow>;
        Relationships: [];
      };
      rate_limit_events: {
        Row: RateLimitEventRow;
        Insert: { bucket: string; created_at?: string };
        Update: Partial<RateLimitEventRow>;
        Relationships: [];
      };
      documents: {
        Row: DocumentRow;
        Insert: Partial<DocumentRow> & {
          user_id: string;
          original_filename: string;
          mime_type: string;
          file_size_bytes: number;
          storage_path: string;
        };
        Update: Partial<DocumentRow>;
        Relationships: [];
      };
      document_chunks: {
        Row: DocumentChunkRow;
        Insert: Partial<DocumentChunkRow> & {
          document_id: string;
          sequence: number;
          text: string;
          normalized_text: string;
        };
        Update: Partial<DocumentChunkRow>;
        Relationships: [];
      };
      citations: {
        Row: CitationRow;
        Insert: Partial<CitationRow> & { document_id: string; raw_text: string };
        Update: Partial<CitationRow>;
        Relationships: [];
      };
      document_references: {
        Row: DocumentReferenceRow;
        Insert: Partial<DocumentReferenceRow> & { document_id: string; raw_text: string };
        Update: Partial<DocumentReferenceRow>;
        Relationships: [];
      };
      document_sources: {
        Row: DocumentSourceRow;
        Insert: Partial<DocumentSourceRow>;
        Update: Partial<DocumentSourceRow>;
        Relationships: [];
      };
      similarity_matches: {
        Row: SimilarityMatchRow;
        Insert: Partial<SimilarityMatchRow> & {
          document_id: string;
          chunk_id: number;
          match_type: MatchType;
          similarity_score: number;
          matched_text: string;
        };
        Update: Partial<SimilarityMatchRow>;
        Relationships: [];
      };
      originality_reports: {
        Row: OriginalityReportRow;
        Insert: Partial<OriginalityReportRow> & { document_id: string; similarity_index: number; engine_version: string };
        Update: Partial<OriginalityReportRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_tool_usage: {
        Args: { p_owner_type: UsageOwnerType; p_owner_id: string; p_tool_id: string };
        Returns: number;
      };
      is_workspace_member: { Args: { target_workspace_id: string }; Returns: boolean };
      is_workspace_owner: { Args: { target_workspace_id: string }; Returns: boolean };
      check_and_record_rate_limit: {
        Args: { p_bucket: string; p_max_events: number; p_window_seconds: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
