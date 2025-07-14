// API definitions (Auto generated)

"use strict"

export interface WalletInfo {
    /**
     * Wallet ID
     */
    id: string;

    /**
     * Wallet name
     */
    name?: string;

    /**
     * Wallet address
     */
    address?: string;
}

export interface WalletCreateBody {
    /**
     * Wallet name (max 80 chars)
     */
    name: string;

    /**
     * Password to protect the wallet
     */
    password: string;

    /**
     * Private key (HEX). If not provided, a random one is generated.
     */
    private_key?: string;
}

export interface WalletCreateBadRequest {
    /**
     * Error Code:
     *  - INVALID_NAME: Invalid wallet name
     *  - TOO_MANY_WALLETS: You have too many wallets
     *  - WEAK_PASSWORD: Password too weak
     *  - INVALID_PRIVATE_KEY: Invalid private key provided
     */
    code: string;
}

export interface WalletEditBody {
    /**
     * Wallet name (max 80 chars)
     */
    name: string;
}

export interface WalletEditBadRequest {
    /**
     * Error Code:
     *  - INVALID_NAME: Invalid wallet name
     */
    code: string;
}

export interface WalletChangePasswordBody {
    /**
     * Current password
     */
    password: string;

    /**
     * New password
     */
    new_password: string;
}

export interface WalletChangePasswordBadRequest {
    /**
     * Error Code:
     *  - WEAK_PASSWORD: Password too weak
     *  - WRONG_PASSWORD: Wrong current password
     */
    code: string;
}

export interface WalletExportBody {
    /**
     * Current password
     */
    password: string;
}

export interface WalletExportBadRequest {
    /**
     * Error Code:
     *  - WRONG_PASSWORD: Wrong current password
     */
    code: string;
}

export interface WalletExportResponse {
    /**
     * Private key (HEX)
     */
    private_key: string;
}

export interface UserAdminListItem {
    /**
     * User ID
     */
    id: string;

    /**
     * User role
     */
    role: string;

    /**
     * Username
     */
    username: string;

    /**
     * Email
     */
    email: string;

    /**
     * Verified
     */
    verified: boolean;

    /**
     * Banned
     */
    banned: boolean;

    /**
     * Creation timestamp (Unix milliseconds)
     */
    created: number;
}

export interface UserAdminList {
    users: UserAdminListItem[];

    /**
     * Page number (starting by 1)
     */
    page: number;

    /**
     * Total number of pages
     */
    totalPages: number;

    /**
     * Total results
     */
    total?: number;
}

export interface UserAdminDetails {
    /**
     * User ID
     */
    id: string;

    /**
     * User role
     */
    role: string;

    /**
     * Username
     */
    username: string;

    /**
     * Email
     */
    email: string;

    /**
     * Verified
     */
    verified: boolean;

    /**
     * Banned
     */
    banned: boolean;

    /**
     * Creation timestamp (Unix milliseconds)
     */
    created: number;

    /**
     * Immune to moderation
     */
    modImmune: boolean;

    /**
     * Has TFA enabled
     */
    tfa: boolean;

    /**
     * User locale
     */
    locale: string;

    sessions: SessionListItem[];
}

export interface AdminSetRoleBody {
    /**
     * Role to set
     */
    role: string;
}

export interface SetRoleBadRequest {
    /**
     * Error Code:
     *  - SELF: You cannot change your own role
     *  - INVALID_ROLE: Invalid or non-existent role
     */
    code: string;
}

export interface UserAdminEmailChange {
    /**
     * New email
     */
    email: string;
}

export interface UserAdminEmailChangeBadRequest {
    /**
     * Error Code:
     *  - EMAIL_INVALID: Invalid email
     *  - EMAIL_IN_USE: Email is in use
     */
    code: string;
}

export interface UserAdminUsernameChange {
    /**
     * New username
     */
    username: string;
}

export interface UserAdminUsernameChangeBadRequest {
    /**
     * Error Code:
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     */
    code: string;
}

export interface UserAdminPasswordChange {
    /**
     * New password
     */
    password: string;
}

export interface UserAdminPasswordChangeBadRequest {
    /**
     * Error Code:
     *  - WEAK_PASSWORD: Password too weak
     */
    code: string;
}

export interface GlobalRolePermission {
    /**
     * Permission identifier
     */
    id: string;

    /**
     * True if the permission is granted
     */
    granted?: boolean;
}

export interface GlobalRole {
    /**
     * Role identifier
     */
    id: string;

    permissions: GlobalRolePermission[];
}

export interface CreateRoleBadRequest {
    /**
     * Error Code:
     *  - INVALID_ID: Invalid identifier (Must not be empty, cannot be admin, max 80 characters, only lowercase letters, numbers and underscores)
     *  - DUPLICATED: Another role was found with the same ID
     */
    code: string;
}

export interface RoleModifyBody {
    permissions: GlobalRolePermission[];
}

export interface UserProfileMin {
    /**
     * User ID
     */
    id?: string;

    /**
     * Username
     */
    username?: string;

    /**
     * Full name
     */
    name?: string;

    /**
     * Image URL
     */
    image?: string;
}

export interface UserProfile {
    /**
     * User ID
     */
    id?: string;

    /**
     * Username
     */
    username?: string;

    /**
     * Join Date (YYYY-MM-DD)
     */
    joinDate?: string;

    /**
     * Full name
     */
    name?: string;

    /**
     * Bio / Description
     */
    bio?: string;

    /**
     * Image URL
     */
    image?: string;

    /**
     * Location
     */
    location?: string;

    /**
     * Website URL
     */
    website?: string;
}

export interface UpdateProfileBody {
    /**
     * Full name
     */
    name?: string;

    /**
     * Bio / Description
     */
    bio?: string;

    /**
     * Location
     */
    location?: string;

    /**
     * Website URL
     */
    website?: string;
}

export interface UpdateProfileBadRequest {
    /**
     * Error Code:
     *  - INVALID_NAME: Invalid full name. Cannot exceed 80 characters
     *  - INVALID_BIO: Invalid bio. Cannot exceed 300 characters.
     *  - INVALID_LOCATION: Invalid location. Cannot exceed 100 characters.
     *  - INVALID_WEBSITE: Invalid website. Must be a valid URL and cannot exceed 100 characters.
     */
    code: string;
}

export interface UploadProfileImageResponse {
    /**
     * Uploaded image URL
     */
    url?: string;
}

export interface ErrorResponse {
    /**
     * Error code 
     */
    code?: string;
}

export interface AuthenticationContext {
    /**
     * Auth status 
     */
    status: "UNAUTHORIZED" | "TFA_REQUIRED" | "USER_NOT_FOUND" | "LOGGED_IN";

    /**
     * User ID
     */
    uid?: string;

    /**
     * User role.
     */
    role?: string;

    permissions?: string[];

    /**
     * Username
     */
    username?: string;

    /**
     * User email
     */
    email?: string;

    /**
     * Is the account protected by two factor authentication?
     */
    tfa?: boolean;

    /**
     * User locale
     */
    locale?: string;

    /**
     * Profile name
     */
    profileName?: string;

    /**
     * Profile image URL
     */
    profileImage?: string;
}

export interface AuthenticationContextError {
    /**
     * Authentication status: UNAUTHORIZED, TFA_REQUIRED (requires two, factor authentication), USER_NOT_FOUND
     */
    code: string;
}

export interface LoginRequest {
    /**
     * Username or email
     */
    username: string;

    /**
     * Password
     */
    password: string;

    /**
     * Captcha (Action = "login")
     */
    captcha?: string;

    /**
     * Send true to keep the session active until closed
     */
    remember?: boolean;
}

export interface LoginErrorBadRequest {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - INVALID_CREDENTIALS: Invalid username or empty password
     */
    code: string;
}

export interface LoginErrorForbidden {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - INVALID_CREDENTIALS: Invalid credentials
     *  - USER_BANNED: User is banned
     */
    code: string;
}

export interface LoginResponse {
    /**
     * User Id
     */
    uid: string;

    /**
     * Session ID
     */
    session_id: string;
}

export interface ThirdPartyLoginService {
    /**
     * Service ID
     */
    id: string;

    /**
     * Service name
     */
    name: string;

    /**
     * App public client ID
     */
    client_id: string;

    /**
     * Login URL
     */
    url: string;

    /**
     * Redirect URL
     */
    redirect_url: string;
}

export interface ThirdPartyLoginBody {
    /**
     * Service ID
     */
    service: string;

    /**
     * OAuth 2.0 code
     */
    code: string;
}

export interface LoginTPErrorBadRequest {
    /**
     * Error Code:
     *  - SERVICE_INVALID: Invalid service ID
     *  - NO_CODE: No code provided
     *  - OAUTH_ERROR: OAuth 2.0 error (probably an invalid code)
     *  - BANNED: User is banned
     */
    code: string;
}

export interface ThirdPartyLoginResponse {
    /**
     * Result. 
     */
    result: "SESSION" | "MUST_REGISTER";

    /**
     * Session ID
     */
    session_id?: string;

    /**
     * Email to register
     */
    email?: string;

    /**
     * Third party user OD to register
     */
    id?: string;

    /**
     * Token to register the user
     */
    token?: string;
}

export interface SignupTPRequest {
    /**
     * Third Party user ID
     */
    id: string;

    /**
     * Username
     */
    username: string;

    /**
     * Password
     */
    password: string;

    /**
     * Token received after authorizing (Oauth 2.0)
     */
    token: string;

    /**
     * User locale
     */
    locale?: string;
}

export interface SignupTPErrorBadRequest {
    /**
     * Error Code:
     *  - ID_INVALID: Invalid ID
     *  - TOKEN_INVALID: Invalid token
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - EMAIL_IN_USE: The email is in use by other account
     *  - WEAK_PASSWORD: Password too short
     */
    code: string;
}

export interface SignupTPResponse {
    /**
     * User ID of the new user
     */
    uid: string;

    /**
     * Session ID
     */
    session_id: string;
}

export interface TFAErrorBadRequest {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     */
    code: string;
}

export interface TFAErrorForbidden {
    /**
     * Error Code:
     *  - INVALID_CODE: Invalid code provided
     */
    code: string;
}

export interface TFALoginRequest {
    /**
     * Captcha (action = "tfa")
     */
    captcha: string;

    /**
     * Two-factor authentication single-use code
     */
    token: string;
}

export interface SignupRequest {
    /**
     * Email
     */
    email: string;

    /**
     * Username
     */
    username: string;

    /**
     * Password
     */
    password: string;

    /**
     * Captcha (action = "signup")
     */
    captcha?: string;

    /**
     * User locale
     */
    locale?: string;
}

export interface SignupErrorBadRequest {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - EMAIL_INVALID: Invalid email
     *  - EMAIL_IN_USE: Email is in use
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - WEAK_PASSWORD: Password too short
     */
    code: string;
}

export interface SignupResponse {
    /**
     * User ID of the new user
     */
    uid: string;

    /**
     * Session ID (Only if email validation is disabled)
     */
    session_id?: string;
}

export interface EmailVerifyRequest {
    /**
     * User ID
     */
    uid: string;

    /**
     * Verification code
     */
    verification: string;
}

export interface EmailVerifyForbidden {
    /**
     * Error code:
     *  - EMAIL_IN_USE: The email is in use and cannot be verified
     */
    code: string;
}

export interface EmailVerifyResponse {
    /**
     * Status:
     *  - VERIFIED: Account was verified
     *  - ALREADY_VERIFIED: Account was already verified
     */
    status: string;
}

export interface ForgotPasswordRequest {
    /**
     * User email
     */
    email: string;

    /**
     * Captcha (action = "forgot_password")
     */
    captcha?: string;
}

export interface ForgotPasswordErrorBadRequest {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - EMAIL_INVALID: Invalid email
     */
    code: string;
}

export interface ForgotPasswordResponse {
    /**
     * Status:
     *  - RESET_PASSWORD_EMAIL_SENT: Email sent
     *  - VERIFY_EMAIL_SENT: Account is not verified yet
     *  - ACCOUNT_VERIFIED: Account was verified, but no email was sent
     */
    status: string;
}

export interface ResetPasswordRequest {
    /**
     * User ID
     */
    uid: string;

    /**
     * Verification code
     */
    verification: string;

    /**
     * New password
     */
    password: string;
}

export interface ResetPasswordErrorBadRequest {
    /**
     * Error Code:
     *  - WEAK_PASSWORD: Password too short
     */
    code: string;
}

export interface UsernameChangeRequest {
    /**
     * New username
     */
    username: string;

    /**
     * Account password
     */
    password: string;

    /**
     * Two factor authentication code, if you have it enabled is required
     */
    tfa_token?: string;
}

export interface UsernameChangeBadRequest {
    /**
     * Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - USERNAME_INVALID: Invalid username
     *  - USERNAME_IN_USE: Username in use
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */
    code: string;
}

export interface EmailChangeRequest {
    /**
     * New email
     */
    email: string;

    /**
     * Account password
     */
    password: string;

    /**
     * Two factor authentication code, if you have it enabled is required
     */
    tfa_token?: string;

    /**
     * Captcha (Action = "change_email")
     */
    captcha?: string;
}

export interface EmailChangeBadRequest {
    /**
     * Error Code:
     *  - CAPTCHA: Invalid captcha
     *  - WRONG_PASSWORD: Wrong password
     *  - EMAIL_INVALID: Invalid email
     *  - EMAIL_IN_USE: Email is in use
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */
    code: string;
}

export interface PasswordChangeRequest {
    /**
     * Old password
     */
    old_password: string;

    /**
     * New password
     */
    new_password: string;
}

export interface PasswordChangeBadRequest {
    /**
     * Error Code:
     *  - WRONG_PASSWORD: Wrong old password
     *  - WEAK_PASSWORD: Password too weak
     */
    code: string;
}

export interface TFAGenResponse {
    /**
     * TFA secret
     */
    secret: string;

    /**
     * URL for QR code
     */
    uri: string;
}

export interface TFASetupRequest {
    /**
     * Account password
     */
    password: string;

    /**
     * TFA secret
     */
    secret: string;

    /**
     * Current TFA token to validate the secret
     */
    token: string;
}

export interface TFASetupBadRequest {
    /**
     * Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - ALREADY: TFA already setup
     *  - INVALID: Invalid tfa secret or validation code
     */
    code: string;
}

export interface TFARemoveRequest {
    /**
     * Current TFA token to validate the request
     */
    token: string;
}

export interface TFARemoveBadRequest {
    /**
     * Error Code:
     *  - NOT_ENABLED: TFA not enabled
     *  - INVALID: Invalid tfa secret or validation code
     */
    code: string;
}

export interface SessionListItem {
    /**
     * Session Token
     */
    session: string;

    /**
     * Session creation timestamp
     */
    created?: number;

    /**
     * Remote address
     */
    remote?: string;

    /**
     * Operating system
     */
    os?: string;

    /**
     * Browser / Platform
     */
    browser?: string;

    /**
     * Is current Session?
     */
    current?: boolean;
}

export interface ChangeLocaleBody {
    /**
     * Locale to use, If wrong, it will use the default locale.
     */
    locale?: string;
}

export interface AccountDeleteBadRequest {
    /**
     * Error Code:
     *  - WRONG_PASSWORD: Wrong password
     *  - INVALID_TFA_CODE: Invalid two factor authentication
     */
    code: string;
}

export interface DeleteAccountRequest {
    /**
     * Account password
     */
    password: string;

    /**
     * Two factor authentication code, if you have it enabled is required
     */
    tfa_token: string;
}

