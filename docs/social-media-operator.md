# Social Media Operator

The Social Media Operator is part of the existing merQato TanStack Start application at `/admin/social-media`. It is not a second application and does not embed Postiz in an iframe.

## Architecture

- The admin interface uses the dedicated merQato Operator Console shell. Public marketing navigation and the public footer are not rendered for `/admin/*` routes.
- Admin unlock verifies `ADMIN_PASSKEY` on the server. The browser stores only a signed, expiring session token; it does not store the raw passkey. `ADMIN_SESSION_SECRET` signs sessions and `ADMIN_SESSION_TTL_MINUTES` controls expiration.
- Agent Brain settings are saved by Operator Admin in the existing `merqato:agent_config` browser configuration. The Social Media Operator reads that same configuration. Ollama and OpenRouter health checks and generation requests run through authenticated TanStack server functions, never directly from the Social Media Operator browser UI.
- Postiz owns OAuth integrations, uploaded media, drafts, schedules, publishing, and delivery state. The Postiz API key is read only by the server.
- Existing Supabase Social Media Operator tables are service-role-only audit and approval infrastructure. Postiz remains authoritative when Supabase service-role access is not configured locally.

## Required environment variables

```dotenv
ADMIN_PASSKEY=
ADMIN_SESSION_SECRET=
ADMIN_SESSION_TTL_MINUTES=120
POSTIZ_API_URL=http://localhost:4007
POSTIZ_API_KEY=
```

`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are required only for the existing Supabase-backed catalog and audit features. Never expose the service-role key in a `VITE_` variable.

For production, `POSTIZ_API_URL` must be reachable from the deployed application server. `localhost` is valid only when the application server and Postiz share the same machine or network namespace.

## Configure Ollama

1. Open `/admin/operators` and unlock Operator Console.
2. Select **Local Ollama (device)** in Agent Brain.
3. Enter the server-reachable base URL, normally `http://localhost:11434` for local development.
4. Select the installed model. `qwen2.5-coder:7b` remains supported; a general instruction model may produce more natural hospitality copy.
5. Choose **Sync models from device**, then **Save & connect**. A green state is shown only after `/api/tags` confirms the selected model exists.

The generation timeout is saved with the same configuration. Generation uses Ollama `/api/chat` with non-streaming structured JSON so the server can validate the complete response consistently.

## Test AI generation

Open `/admin/social-media`, select the connected channels, complete the AI Content Creator brief, and choose **Generate content**. The request validates the admin session, confirms the model is still available, sends the structured merQato social-media system prompt, and returns validated platform content. Failed health checks, timeouts, empty responses, and malformed JSON are shown in the workspace and can be retried.

AI actions never publish. Generated main, Facebook, and Instagram versions must be inserted into or edited in the visible composer before review.

## Test Postiz

Open **Postiz Connection** in the workspace and choose **Test connection**. A successful test requires all of the following real responses:

- `/api/public/v1/is-connected` accepts the configured API key;
- `/api/public/v1/integrations` responds;
- the returned integrations include reachable Facebook and Instagram connections.

The displayed timestamp is created only after the successful responses. Failure replaces any stale green state and shows the attempted endpoint, HTTP status when available, message, likely cause, and retry action.

## Approval and scheduling

Drafts may be saved without approval. Publishing and scheduling require the checkbox confirming that the operator reviewed copy, media, accounts, date, and time. Instagram publishing is blocked until Postiz has returned a valid uploaded media reference.

Scheduling is entered in `Asia/Manila` and converted to an ISO timestamp with the explicit `+08:00` offset before being sent to Postiz. Past times are rejected. The resolved Manila date and time are displayed before approval.

## Known limitations and production warning

- Session version history is intentionally limited to the current browser session.
- OpenRouter keys remain part of the legacy Agent Brain browser configuration. For production OpenRouter use, move the key to a server-side secret store before enabling external administrators.
- Development passkey authentication is not a replacement for organization identity, MFA, roles, or production session revocation. Replace it with production authentication before deployment.
- Postiz status is polled when the workspace loads or refreshes; webhook reconciliation infrastructure exists in Supabase but is not required for local operation.
