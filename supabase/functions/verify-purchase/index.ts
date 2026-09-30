// Confirma uma compra única da Google Play e grava o direito de remover anúncios.
// Segredo obrigatório: GOOGLE_PLAY_SERVICE_ACCOUNT (JSON da conta de serviço).
// Opcional: GOOGLE_PLAY_PACKAGE (padrão app.logicjigsaw.game).
import { createClient } from "npm:@supabase/supabase-js@2";

const PRODUCT_ID = "remove_ads";
const PACKAGE_NAME = Deno.env.get("GOOGLE_PLAY_PACKAGE") ?? "app.logicjigsaw.game";

type ServiceAccount = {
  client_email: string;
  private_key: string;
};

type PlayPurchase = {
  purchaseState?: number;
  acknowledgementState?: number;
  orderId?: string;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") return json(405, { ok: false, code: "failed" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) return json(500, { ok: false, code: "failed" });

  const authHeader = request.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json(401, { ok: false, code: "login" });

  let purchaseToken = "";
  let productId = "";
  try {
    const body = (await request.json()) as { purchaseToken?: string; productId?: string };
    purchaseToken = body.purchaseToken?.trim() ?? "";
    productId = body.productId?.trim() ?? "";
  } catch {
    return json(400, { ok: false, code: "failed" });
  }
  if (!purchaseToken || productId !== PRODUCT_ID) return json(400, { ok: false, code: "failed" });

  const account = readServiceAccount();
  if (!account) return json(500, { ok: false, code: "failed" });

  let purchase: PlayPurchase;
  try {
    const accessToken = await googleAccessToken(account);
    purchase = await fetchPurchase(accessToken, productId, purchaseToken);
  } catch {
    return json(502, { ok: false, code: "failed" });
  }

  if (purchase.purchaseState === 2) return json(200, { ok: false, code: "pending" });
  if (purchase.purchaseState !== 0) return json(200, { ok: false, code: "failed" });

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: existing, error: existingError } = await admin
    .from("user_entitlements")
    .select("user_id")
    .eq("purchase_token", purchaseToken)
    .maybeSingle();
  if (existingError) return json(500, { ok: false, code: "failed" });
  if (existing && existing.user_id !== userData.user.id) return json(200, { ok: false, code: "linked" });

  const { error: upsertError } = await admin.from("user_entitlements").upsert(
    {
      user_id: userData.user.id,
      ads_removed: true,
      product_id: productId,
      purchase_token: purchaseToken,
      order_id: purchase.orderId ?? null,
      platform: "android",
    },
    { onConflict: "user_id" },
  );
  if (upsertError) {
    if (upsertError.code === "23505") return json(200, { ok: false, code: "linked" });
    return json(500, { ok: false, code: "failed" });
  }

  if (purchase.acknowledgementState !== 1) {
    try {
      const accessToken = await googleAccessToken(account);
      await acknowledgePurchase(accessToken, productId, purchaseToken);
    } catch {
      // O direito já foi gravado. A restauração tenta reconhecer de novo.
    }
  }

  return json(200, { ok: true });
});

function readServiceAccount(): ServiceAccount | null {
  const raw = Deno.env.get("GOOGLE_PLAY_SERVICE_ACCOUNT");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function googleAccessToken(account: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(account.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsigned));
  const assertion = `${unsigned}.${base64url(signature)}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error("google-token");
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("google-token");
  return payload.access_token;
}

async function fetchPurchase(accessToken: string, productId: string, purchaseToken: string): Promise<PlayPurchase> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}` +
    `/purchases/products/${productId}/tokens/${encodeURIComponent(purchaseToken)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error("play-purchase");
  return (await response.json()) as PlayPurchase;
}

async function acknowledgePurchase(accessToken: string, productId: string, purchaseToken: string): Promise<void> {
  const url =
    `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}` +
    `/purchases/products/${productId}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  if (!response.ok && response.status !== 400) throw new Error("play-ack");
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function base64url(value: string | ArrayBuffer): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function json(status: number, body: { ok: boolean; code?: string }): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
