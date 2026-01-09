import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { Bindings } from "../types/env.types";

/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 * Uses Web Crypto API for Cloudflare Workers compatibility
 */

// Generate a cryptographically secure random code verifier
export function generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    // Convert to base64url encoding
    return arrayToBase64Url(array);
}

// Generate code challenge from verifier using SHA-256
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return arrayToBase64Url(new Uint8Array(hashBuffer));
}

// Base64URL encoding (RFC 4648 Section 5)
function arrayToBase64Url(buffer: Uint8Array): string {
    const bytes = Array.from(buffer)
        .map(b => String.fromCharCode(b))
        .join('');
    return btoa(bytes)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Set PKCE cookies for OAuth flow (code_verifier and state)
export function setPKCECookies(c: Context<{ Bindings: Bindings }>, codeVerifier: string, state: string) {
    // Determine environment explicitly from typed bindings
    const isProduction = c.env.ENVIRONMENT === 'production';

    setCookie(c, 'code_verifier', codeVerifier, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 600, // 10 minutes
        path: '/'
    });
    setCookie(c, 'oauth_state', state, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
        maxAge: 600, // 10 minutes
        path: '/'
    });
}