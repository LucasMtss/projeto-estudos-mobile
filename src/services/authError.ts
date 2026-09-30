import type { MessagePath } from "@/i18n/types";
import { t } from "@/i18n";

export class AuthFlowError extends Error {
  readonly code: "confirmEmail" | "emailTaken";

  constructor(code: "confirmEmail" | "emailTaken") {
    super(code);
    this.name = "AuthFlowError";
    this.code = code;
  }
}

const BY_CODE: Record<string, MessagePath> = {
  email_not_confirmed: "auth.emailNotConfirmed",
  invalid_credentials: "auth.invalidCredentials",
  user_already_exists: "auth.emailTaken",
  email_exists: "auth.emailTaken",
  weak_password: "auth.weakPassword",
  over_request_rate_limit: "auth.rateLimit",
  over_email_send_rate_limit: "auth.emailRateLimit",
  signup_disabled: "auth.signupDisabled",
  email_provider_disabled: "auth.signupDisabled",
  email_address_invalid: "auth.invalidEmail",
  email_address_not_authorized: "auth.emailNotAllowed",
  user_banned: "auth.userBanned",
};

const BY_MESSAGE: readonly [RegExp, MessagePath][] = [
  [/email not confirmed/i, "auth.emailNotConfirmed"],
  [/invalid login credentials/i, "auth.invalidCredentials"],
  [/already (?:been )?registered|already exists|user already/i, "auth.emailTaken"],
  [/password should be at least|at least \d+ characters|weak password/i, "auth.weakPassword"],
  [/email rate limit/i, "auth.emailRateLimit"],
  [/rate limit/i, "auth.rateLimit"],
  [/signups not allowed|signup(?:s)? (?:is |are )?disabled/i, "auth.signupDisabled"],
  [/not authorized/i, "auth.emailNotAllowed"],
  [/unable to validate email|invalid format|invalid email/i, "auth.invalidEmail"],
  [/banned/i, "auth.userBanned"],
  [/network request failed|failed to fetch|network error|load failed/i, "auth.network"],
];

type AuthLike = {
  name?: string;
  message?: string;
  code?: string;
  reasons?: string[];
};

function authLike(caught: unknown): AuthLike | null {
  if (!caught || typeof caught !== "object" || !("name" in caught) || typeof caught.name !== "string") return null;
  if (!caught.name.startsWith("Auth")) return null;
  return caught as AuthLike;
}

export function authFeedback(caught: unknown, kind: "signIn" | "signUp"): { tone: "error" | "info"; text: string } {
  if (caught instanceof AuthFlowError) {
    if (caught.code === "confirmEmail") return { tone: "info", text: t("auth.confirmEmail") };
    return { tone: "error", text: t("auth.emailTaken") };
  }

  const auth = authLike(caught);
  if (auth?.name === "AuthWeakPasswordError") {
    const reasons = auth.reasons ?? [];
    if (reasons.includes("pwned")) return { tone: "error", text: t("auth.passwordPwned") };
    if (reasons.includes("characters")) return { tone: "error", text: t("auth.passwordCharacters") };
    return { tone: "error", text: t("auth.weakPassword") };
  }
  if (auth?.name === "AuthRetryableFetchError") return { tone: "error", text: t("auth.network") };

  const code = auth?.code;
  if (code && BY_CODE[code]) return { tone: "error", text: t(BY_CODE[code]) };

  const message = caught instanceof Error ? caught.message : "";
  if (auth) {
    for (const [pattern, path] of BY_MESSAGE) {
      if (pattern.test(message)) return { tone: "error", text: t(path) };
    }
    return { tone: "error", text: kind === "signUp" ? t("auth.genericSignUp") : t("auth.genericError") };
  }

  if (message) return { tone: "error", text: message };
  return { tone: "error", text: kind === "signUp" ? t("auth.genericSignUp") : t("auth.genericError") };
}
