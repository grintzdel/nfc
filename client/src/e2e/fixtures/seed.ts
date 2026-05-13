const API_BASE = process.env.E2E_API_BASE ?? 'http://localhost:3001/api'

export async function signUpUser(payload: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<{ token: string }> {
  const registerRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (registerRes.ok) return ((await registerRes.json()) as { data: { token: string } }).data
  // Backend returns 409 when the email is already registered — fall back to login.
  if (registerRes.status !== 409) {
    const body = await registerRes.text()
    throw new Error(`Seed register failed (${registerRes.status}): ${body}`)
  }
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  })
  if (!loginRes.ok) {
    const body = await loginRes.text()
    throw new Error(`Seed login failed (${loginRes.status}): ${body}`)
  }
  return ((await loginRes.json()) as { data: { token: string } }).data
}

export async function signInAdmin(): Promise<{ token: string }> {
  const email = process.env.E2E_ADMIN_EMAIL ?? 'admin@gmail.com'
  const password = process.env.E2E_ADMIN_PASSWORD ?? 'admin2026'
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!loginRes.ok) {
    const body = await loginRes.text()
    throw new Error(`Admin seed login failed (${loginRes.status}): ${body}. Did you run \`pnpm seed\` first?`)
  }
  return ((await loginRes.json()) as { data: { token: string } }).data
}
