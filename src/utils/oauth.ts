import { OAUTH_CONFIG } from "../config";

function generateRandomUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateState(): string {
  const id = generateRandomUUID();
  const json = JSON.stringify({ id, meta: { interactionType: "redirect" } });
  const encoded = btoa(json);
  const suffix = generateRandomUUID();
  return `${encoded}|${suffix}`;
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

export async function buildAuthUrl(): Promise<{ url: string; verifier: string }> {
  const verifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    scope: OAUTH_CONFIG.scope,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: "code",
    response_mode: "fragment",
    prompt: "select_account",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  params.set("state", generateState());
  params.set("nonce", generateRandomUUID());

  return {
    url: `${OAUTH_CONFIG.authEndpoint}?${params.toString()}`,
    verifier,
  };
}
