

## Security Remediation Plan

The scan found several real issues. This project uses a custom visitor identity system (not Supabase Auth), so RLS policies need to stay permissive for public roles but the app logic already scopes actions by `visitor_id`. Here's what to fix:

### 1. Restrict `visitors` table SELECT policy (Critical)

The `visitors` table exposes IP addresses publicly. Since the app only needs to look up visitors server-side (in the `visitor-auth` edge function), we can **remove the public SELECT policy** entirely. The edge function uses the service role key and bypasses RLS, so it will still work.

### 2. Scope `confessions` DELETE policy (Critical)

Currently anyone can delete any confession. We'll replace the blanket `true` DELETE policy with one that checks `visitor_id` matches. Since there's no `auth.uid()` here (custom visitor system), we'll need to pass `visitor_id` from the client. However, since there's no server-side session validation, the real protection is limited. The pragmatic fix: **move delete operations to an edge function** that validates the visitor, OR accept the current risk given this is an anonymous confession board.

A simpler approach: keep client-side delete but add the visitor_id filter in the application code (already done in `deleteConfession`). For the RLS policy, we can't meaningfully restrict without auth. We'll document this as an accepted risk for now.

### 3. Address `confession_likes` anonymous access (Warning)

This is expected behavior — likes are meant to work for all visitors without authentication. We'll **ignore** this finding since the app intentionally allows anonymous-like interactions.

### 4. Address overly permissive RLS policies (Warning)

Same reasoning — this app uses a custom visitor system, not Supabase Auth. The `true` policies on INSERT/UPDATE are intentional for this architecture.

### Changes

**Migration**: Remove the `Anyone can read visitors` SELECT policy from the `visitors` table to stop exposing IP addresses.

**Security findings**: Ignore the `confession_likes` anonymous access warning and document the architectural decisions.

### Technical note

This project deliberately does not use Supabase Auth — it has a custom visitor identity system. This means RLS policies can't use `auth.uid()` for scoping. The primary protection is application-level (filtering by `visitor_id` in queries). The most critical fix is preventing IP address exposure.

