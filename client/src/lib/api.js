const base = process.env.NODE_ENV === 'production' ? '/api' : '/api';

async function request(path, { method = 'GET', body, headers = {}, token } = {}) {
  const finalHeaders = { 'Content-Type': 'application/json', ...headers };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || res.statusText || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get:   (p, opts)        => request(p, { ...opts, method: 'GET' }),
  post:  (p, body, opts)  => request(p, { ...opts, method: 'POST', body }),
  put:   (p, body, opts)  => request(p, { ...opts, method: 'PUT',  body }),
  patch: (p, body, opts)  => request(p, { ...opts, method: 'PATCH', body }),
  del:   (p, opts)        => request(p, { ...opts, method: 'DELETE' }),
};
