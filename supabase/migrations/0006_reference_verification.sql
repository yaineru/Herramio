-- Adds real (not fabricated) reference verification via Crossref — a
-- genuinely free, keyless, no-account-required API (confirmed via its own
-- docs: "no signup or registration is required"). This is the one piece
-- of the originality-analysis roadmap in ORIGINALITY.md that didn't need
-- to wait for any external credential, so it's implemented now instead of
-- left as an interface stub.
--
-- 'verified' means Crossref returned a high-confidence bibliographic match
-- for the detected reference text — never a claim that the citation is
-- used correctly in context, only that the reference itself corresponds
-- to a real, indexed work. 'not_found' NEVER means "fake" or "invented" —
-- Crossref's index isn't exhaustive (books, non-English work, and
-- non-DOI'd sources are all real but commonly absent) and the UI must
-- keep saying so.

alter table public.document_references
  add column if not exists verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'verified', 'not_found')),
  add column if not exists matched_doi text,
  add column if not exists matched_title text,
  add column if not exists matched_url text;

comment on column public.document_references.verification_status is
  'unverified = not checked yet; verified = Crossref found a matching indexed work; not_found = no confident match — NOT evidence the reference is fake, Crossref''s index is not exhaustive.';
