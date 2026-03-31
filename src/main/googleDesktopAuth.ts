import { createHash, randomBytes } from 'crypto'
import { createServer, type Server } from 'http'
import { shell } from 'electron'

export type DesktopGoogleAuthResult = {
  idToken: string
  accessToken: string
}

const GOOGLE_CLIENT_ID = '__GOOGLE_DESKTOP_CLIENT_ID__'
const GOOGLE_SCOPES = ['openid', 'email', 'profile'].join(' ')
const CALLBACK_PATH = '/oauth/callback'
const AUTH_TIMEOUT_MS = 3 * 60 * 1000

function base64Url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function randomToken(size = 32): string {
  return base64Url(randomBytes(size))
}

function createCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

function successHtml(): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>RiddhiDesk sign-in complete</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f8f6f1; color: #2d2a26; padding: 40px; }
      .card { max-width: 520px; margin: 48px auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
      h1 { margin: 0 0 12px; font-size: 24px; }
      p { margin: 0; line-height: 1.5; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Sign-in complete</h1>
      <p>You can return to RiddhiDesk now.</p>
    </div>
  </body>
</html>`
}

function errorHtml(message: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>RiddhiDesk sign-in failed</title>
  </head>
  <body style="font-family: Arial, sans-serif; background: #fff7f7; color: #6a1b1b; padding: 40px;">
    <div style="max-width: 520px; margin: 48px auto; background: white; border-radius: 16px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,.08);">
      <h1 style="margin: 0 0 12px; font-size: 24px;">Sign-in failed</h1>
      <p style="margin: 0; line-height: 1.5;">${message}</p>
    </div>
  </body>
</html>`
}

async function exchangeCodeForTokens(
  code: string,
  verifier: string,
  redirectUri: string
): Promise<DesktopGoogleAuthResult> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    })
  })

  const payload = (await response.json()) as {
    access_token?: string
    id_token?: string
    error?: string
    error_description?: string
  }

  if (!response.ok || !payload.access_token || !payload.id_token) {
    const reason = payload.error_description || payload.error || 'Desktop Google token exchange failed.'
    throw new Error(reason)
  }

  return {
    idToken: payload.id_token,
    accessToken: payload.access_token
  }
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve())
  })
}

export async function startDesktopGoogleSignIn(): Promise<DesktopGoogleAuthResult> {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '__GOOGLE_DESKTOP_CLIENT_ID__') {
    throw new Error(
      'Desktop Google sign-in is not configured. Add GOOGLE_DESKTOP_CLIENT_ID to your local env and rebuild Electron.'
    )
  }

  const state = randomToken()
  const verifier = randomToken(64)
  const challenge = createCodeChallenge(verifier)

  return await new Promise<DesktopGoogleAuthResult>((resolve, reject) => {
    let settled = false
    let redirectUri = ''

    const finish = async (
      server: Server,
      cb: (value?: DesktopGoogleAuthResult) => void,
      value?: DesktopGoogleAuthResult
    ): Promise<void> => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      await closeServer(server)
      cb(value)
    }

    const server = createServer(async (req, res) => {
      if (!req.url) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(errorHtml('Missing callback URL.'))
        await finish(server, reject, new Error('Missing callback URL.') as never)
        return
      }

      const incoming = new URL(req.url, redirectUri)
      if (incoming.pathname !== CALLBACK_PATH) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end('Not found')
        return
      }

      const returnedState = incoming.searchParams.get('state') || ''
      const code = incoming.searchParams.get('code') || ''
      const error = incoming.searchParams.get('error') || ''

      if (error) {
        const message =
          error === 'access_denied'
            ? 'Google sign-in was cancelled.'
            : `Google sign-in failed: ${error}`
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(errorHtml(message))
        await finish(server, reject, new Error(message) as never)
        return
      }

      if (returnedState !== state) {
        const message = 'Google sign-in failed because the callback state did not match.'
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(errorHtml(message))
        await finish(server, reject, new Error(message) as never)
        return
      }

      if (!code) {
        const message = 'Google sign-in did not return an authorization code.'
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(errorHtml(message))
        await finish(server, reject, new Error(message) as never)
        return
      }

      try {
        const tokens = await exchangeCodeForTokens(code, verifier, redirectUri)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(successHtml())
        await finish(server, resolve, tokens)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Desktop Google sign-in failed during token exchange.'
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(errorHtml(message))
        await finish(server, reject, new Error(message) as never)
      }
    })

    const timeout = setTimeout(() => {
      void finish(server, reject, new Error('Google sign-in timed out. Please try again.') as never)
    }, AUTH_TIMEOUT_MS)

    server.listen(0, '127.0.0.1', async () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        void finish(server, reject, new Error('Failed to start local auth callback server.') as never)
        return
      }

      redirectUri = `http://127.0.0.1:${address.port}${CALLBACK_PATH}`
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', GOOGLE_SCOPES)
      authUrl.searchParams.set('prompt', 'select_account')
      authUrl.searchParams.set('state', state)
      authUrl.searchParams.set('code_challenge', challenge)
      authUrl.searchParams.set('code_challenge_method', 'S256')

      try {
        await shell.openExternal(authUrl.toString())
      } catch {
        void finish(
          server,
          reject,
          new Error('Could not open the system browser for Google sign-in.') as never
        )
      }
    })
  })
}
