import { z } from 'zod';

// A robust Zod schema for validating any JSON value.
const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
).describe("Represents any valid JSON value, including objects, arrays, and primitives.");

// --- ENUM Schemas ---
export const aalLevelEnum = z.enum(["aal1", "aal2", "aal3"]);
export const codeChallengeMethodEnum = z.enum(["s256", "plain"]);
export const factorStatusEnum = z.enum(["unverified", "verified"]);
export const factorTypeEnum = z.enum(["totp", "webauthn", "phone"]);
export const oneTimeTokenTypeEnum = z.enum(["confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token"]);


// --- TABLE Schemas ---

// Schema for the 'audit_log_entries' table
export const auditLogEntriesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the audit log entry (Primary Key)."),
    instance_id: z.string().uuid().nullable().describe("The instance ID associated with the event."),
    ip_address: z.string().ip().describe("The IP address from which the action was performed."),
    payload: jsonSchema.nullable().describe("JSON object containing details of the audited event."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the audit event occurred."),
});

// Schema for the 'flow_state' table
export const flowStateSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the flow state (Primary Key)."),
    user_id: z.string().uuid().nullable().describe("The user ID associated with this flow."),
    auth_code: z.string().describe("The authorization code generated during an OAuth 2.0 flow."),
    code_challenge_method: codeChallengeMethodEnum.describe("The method used for the PKCE code challenge."),
    code_challenge: z.string().describe("The PKCE code challenge."),
    provider_type: z.string().describe("The type of provider (e.g., 'email', 'google', 'saml')."),
    provider_access_token: z.string().nullable().describe("The access token from the external provider."),
    provider_refresh_token: z.string().nullable().describe("The refresh token from the external provider."),
    authentication_method: z.string().describe("The authentication method used in this flow."),
    auth_code_issued_at: z.string().datetime().nullable().describe("Timestamp when the auth code was issued."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the flow state was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the flow state was last updated."),
});

// Schema for the 'identities' table
export const identitiesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the identity (Primary Key)."),
    user_id: z.string().uuid().describe("Foreign key linking to the 'users' table."),
    identity_data: jsonSchema.describe("JSON object containing provider-specific identity data."),
    provider: z.string().describe("The name of the identity provider (e.g., 'email', 'google')."),
    provider_id: z.string().describe("The user's unique ID within the provider's system."),
    email: z.string().email().nullable().describe("The email associated with this identity, if available."),
    last_sign_in_at: z.string().datetime().nullable().describe("The timestamp of the last sign-in with this identity."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the identity was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the identity was last updated."),
});

// Schema for the 'instances' table
export const instancesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the auth instance (Primary Key)."),
    uuid: z.string().uuid().nullable().describe("The UUID of the instance."),
    raw_base_config: z.string().nullable().describe("The base configuration for the instance in raw format."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the instance was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the instance was last updated."),
});

// Schema for the 'mfa_amr_claims' table
export const mfaAmrClaimsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the AMR claim (Primary Key)."),
    session_id: z.string().uuid().describe("Foreign key linking to the 'sessions' table."),
    authentication_method: z.string().describe("The Authentication Method Reference (AMR) for this claim."),
    created_at: z.string().datetime().describe("The timestamp when the claim was created."),
    updated_at: z.string().datetime().describe("The timestamp when the claim was last updated."),
});

// Schema for the 'mfa_challenges' table
export const mfaChallengesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the MFA challenge (Primary Key)."),
    factor_id: z.string().uuid().describe("Foreign key linking to the 'mfa_factors' table."),
    created_at: z.string().datetime().describe("The timestamp when the challenge was created."),
    verified_at: z.string().datetime().nullable().describe("The timestamp when the challenge was successfully verified."),
    ip_address: z.any().describe("The IP address from which the challenge was initiated."),
    otp_code: z.string().nullable().describe("The one-time password code for OTP-based challenges."),
    web_authn_session_data: jsonSchema.nullable().describe("Session data for WebAuthn challenges."),
});

// Schema for the 'mfa_factors' table
export const mfaFactorsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the MFA factor (Primary Key)."),
    user_id: z.string().uuid().describe("Foreign key linking to the 'users' table."),
    friendly_name: z.string().nullable().describe("A user-friendly name for the factor (e.g., 'My Phone')."),
    factor_type: factorTypeEnum.describe("The type of MFA factor."),
    status: factorStatusEnum.describe("The verification status of the factor."),
    secret: z.string().nullable().describe("The secret key for TOTP factors."),
    phone: z.string().nullable().describe("The phone number for phone-based factors."),
    web_authn_aaguid: z.string().uuid().nullable().describe("The AAGUID for WebAuthn authenticators."),
    web_authn_credential: jsonSchema.nullable().describe("The credential data for WebAuthn factors."),
    created_at: z.string().datetime().describe("The timestamp when the factor was created."),
    updated_at: z.string().datetime().describe("The timestamp when the factor was last updated."),
    last_challenged_at: z.string().datetime().nullable().describe("The timestamp when this factor was last used for a challenge."),
});

// Schema for the 'one_time_tokens' table
export const oneTimeTokensSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the token (Primary Key)."),
    user_id: z.string().uuid().describe("The user this token is associated with."),
    token_type: oneTimeTokenTypeEnum.describe("The purpose of the one-time token."),
    token_hash: z.string().describe("The hashed value of the token."),
    relates_to: z.string().describe("The subject the token relates to (e.g., the new email address)."),
    created_at: z.string().datetime().describe("The timestamp when the token was created."),
    updated_at: z.string().datetime().describe("The timestamp when the token was last updated."),
});

// Schema for the 'refresh_tokens' table
export const refreshTokensSchema = z.object({
    id: z.number().int().positive().describe("The unique identifier for the refresh token (Primary Key)."),
    instance_id: z.string().uuid().nullable().describe("The instance ID associated with the token."),
    token: z.string().nullable().describe("The refresh token string (the first 8 characters are stored)."),
    user_id: z.string().uuid().nullable().describe("The user ID associated with the token."),
    revoked: z.boolean().nullable().describe("Indicates if the refresh token has been revoked."),
    parent: z.string().nullable().describe("The parent refresh token, used for rotation detection."),
    session_id: z.string().uuid().nullable().describe("Foreign key linking to the 'sessions' table."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the token was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the token was last updated."),
});

// Schema for the 'saml_providers' table
export const samlProvidersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the SAML provider (Primary Key)."),
    sso_provider_id: z.string().uuid().describe("Foreign key linking to the 'sso_providers' table."),
    entity_id: z.string().describe("The unique Entity ID of the SAML provider."),
    metadata_xml: z.string().describe("The SAML metadata XML content."),
    metadata_url: z.string().url().nullable().describe("The URL to fetch the SAML metadata."),
    attribute_mapping: jsonSchema.nullable().describe("JSON object to map SAML attributes to user metadata."),
    name_id_format: z.string().nullable().describe("The NameID format to be used."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the provider was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the provider was last updated."),
});

// Schema for the 'saml_relay_states' table
export const samlRelayStatesSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the SAML relay state (Primary Key)."),
    sso_provider_id: z.string().uuid().describe("Foreign key linking to the 'sso_providers' table."),
    request_id: z.string().describe("The ID of the original SAML request."),
    for_email: z.string().email().nullable().describe("The email address this relay state is for."),
    redirect_to: z.string().nullable().describe("The URL to redirect to after successful authentication."),
    flow_state_id: z.string().uuid().nullable().describe("Foreign key linking to the 'flow_state' table."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the relay state was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the relay state was last updated."),
});

// Schema for the 'schema_migrations' table
export const schemaMigrationsSchema = z.object({
    version: z.string().describe("The version identifier of the applied schema migration (Primary Key)."),
});

// Schema for the 'sessions' table
export const sessionsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the session (Primary Key)."),
    user_id: z.string().uuid().describe("Foreign key linking to the 'users' table."),
    factor_id: z.string().uuid().nullable().describe("The MFA factor ID used to create this session, if any."),
    aal: aalLevelEnum.nullable().describe("The Authenticator Assurance Level of the session."),
    not_after: z.string().datetime().nullable().describe("The timestamp after which the session is no longer valid."),
    refreshed_at: z.string().datetime().nullable().describe("The timestamp when the session was last refreshed."),
    user_agent: z.string().nullable().describe("The user agent string of the client."),
    ip: z.any().nullable().describe("The IP address of the client."),
    tag: z.string().nullable().describe("A tag for categorizing sessions."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the session was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the session was last updated."),
});

// Schema for the 'sso_domains' table
export const ssoDomainsSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the SSO domain mapping (Primary Key)."),
    sso_provider_id: z.string().uuid().describe("Foreign key linking to the 'sso_providers' table."),
    domain: z.string().describe("The domain name that is configured for SSO."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the domain was added."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the domain was last updated."),
});

// Schema for the 'sso_providers' table
export const ssoProvidersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the SSO provider (Primary Key)."),
    resource_id: z.string().nullable().describe("A reference to an external resource, if any."),
    disabled: z.boolean().nullable().describe("Indicates if the SSO provider is currently disabled."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the provider was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the provider was last updated."),
});

// Schema for the 'users' table
export const usersSchema = z.object({
    id: z.string().uuid().describe("The unique identifier for the user (Primary Key)."),
    instance_id: z.string().uuid().nullable().describe("The instance this user belongs to."),
    aud: z.string().nullable().describe("The audience of the JWT."),
    role: z.string().nullable().describe("The role of the user."),
    email: z.string().email().nullable().describe("The user's email address."),
    encrypted_password: z.string().nullable().describe("The user's hashed password."),
    email_confirmed_at: z.string().datetime().nullable().describe("Timestamp when the user's email was confirmed."),
    invited_at: z.string().datetime().nullable().describe("Timestamp when the user was invited."),
    confirmation_token: z.string().nullable().describe("The token sent for email confirmation."),
    confirmation_sent_at: z.string().datetime().nullable().describe("Timestamp when the confirmation token was sent."),
    recovery_token: z.string().nullable().describe("The token sent for password recovery."),
    recovery_sent_at: z.string().datetime().nullable().describe("Timestamp when the recovery token was sent."),
    email_change_token_new: z.string().nullable().describe("Token for confirming a new email address."),
    email_change: z.string().email().nullable().describe("The new email address pending confirmation."),
    email_change_sent_at: z.string().datetime().nullable().describe("Timestamp when the email change token was sent."),
    last_sign_in_at: z.string().datetime().nullable().describe("Timestamp of the user's last sign-in."),
    raw_app_meta_data: jsonSchema.nullable().describe("JSON object for application-specific metadata (read-only for users)."),
    raw_user_meta_data: jsonSchema.nullable().describe("JSON object for user-specific metadata (readable and writable by users)."),
    is_super_admin: z.boolean().nullable().describe("Indicates if the user has super admin privileges."),
    created_at: z.string().datetime().nullable().describe("The timestamp when the user was created."),
    updated_at: z.string().datetime().nullable().describe("The timestamp when the user was last updated."),
    phone: z.string().nullable().describe("The user's phone number."),
    phone_confirmed_at: z.string().datetime().nullable().describe("Timestamp when the user's phone number was confirmed."),
    phone_change: z.string().nullable().describe("A new phone number pending confirmation."),
    phone_change_token: z.string().nullable().describe("The token sent for phone number change confirmation."),
    phone_change_sent_at: z.string().datetime().nullable().describe("Timestamp when the phone change token was sent."),
    confirmed_at: z.string().datetime().nullable().describe("Coalesces email_confirmed_at and phone_confirmed_at."),
    email_change_token_current: z.string().nullable().describe("Token for re-authenticating the current email before changing."),
    email_change_confirm_status: z.number().int().min(0).max(2).nullable().describe("0: not confirmed, 1: confirmed, 2: failed."),
    banned_until: z.string().datetime().nullable().describe("Timestamp until which the user is banned."),
    reauthentication_token: z.string().nullable().describe("A token for re-authentication."),
    reauthentication_sent_at: z.string().datetime().nullable().describe("Timestamp when the re-authentication token was sent."),
    is_sso_user: z.boolean().describe("Indicates if the user signed up via SSO."),
    deleted_at: z.string().datetime().nullable().describe("Timestamp when the user was soft-deleted."),
    is_anonymous: z.boolean().describe("Indicates if the user is anonymous."),
});