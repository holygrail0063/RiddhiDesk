const AKASH_ALLOWED_EMAIL = 'akashkamble0063@gmail.com'
const ENV_ALLOWED_EMAIL = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase()

export const allowedEmails = Array.from(
  new Set([ENV_ALLOWED_EMAIL, AKASH_ALLOWED_EMAIL].map((value) => value.trim().toLowerCase()).filter(Boolean))
)

export const primaryAllowedEmail = ENV_ALLOWED_EMAIL || AKASH_ALLOWED_EMAIL

export function normalizeEmail(email: string | null | undefined): string {
  return (email || '').trim().toLowerCase()
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  const normalized = normalizeEmail(email)
  return normalized.length > 0 && allowedEmails.includes(normalized)
}

export function getUnauthorizedEmailMessage(): string {
  return `This account is not allowed. Use ${allowedEmails.join(' or ')}.`
}
