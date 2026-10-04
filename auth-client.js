(function () {
  const TOKEN_KEY = 'm3t-session-token';
  let apiBase = '';
  let currentUser = null;
  let installed = false;
  const nativeFetch = window.fetch.bind(window);

  function setCurrentUser(user) {
    currentUser = user;
    window.dispatchEvent(new CustomEvent('m3t-auth-ready', { detail: user }));
    return user;
  }

  function token() {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  function installFetch(base) {
    apiBase = String(base || '').replace(/\/$/, '');
    if (installed) return;
    installed = true;
    window.fetch = (input, init = {}) => {
      const url = typeof input === 'string' ? input : input.url;
      if (!url.startsWith(apiBase)) return nativeFetch(input, init);
      const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
      if (token()) headers.set('Authorization', `Bearer ${token()}`);
      headers.set('ngrok-skip-browser-warning', 'true');
      return nativeFetch(input, { ...init, headers });
    };
  }

  async function api(path, options = {}) {
    const response = await window.fetch(`${apiBase}${path}`, options);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  }

  function authScreen(mode, specialToken = '') {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.id = 'm3tAuthOverlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:20000;background:#111827;display:grid;place-items:center;padding:1rem';
      const isLogin = mode === 'login';
      overlay.innerHTML = `
        <form id="m3tAuthForm" style="width:min(420px,100%);background:white;border-radius:14px;padding:1.5rem;box-shadow:0 20px 60px #0008">
          <h2 style="margin-top:0">M3T ${isLogin ? 'Sign In' : (mode === 'invite' ? 'Create Account' : 'Reset Password')}</h2>
          ${isLogin ? '<label>Email<br><input id="m3tAuthEmail" type="email" autocomplete="username" required style="width:100%;box-sizing:border-box;padding:.7rem"></label><br><br>' : ''}
          <label>Password<br><input id="m3tAuthPassword" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" minlength="12" required style="width:100%;box-sizing:border-box;padding:.7rem"></label>
          ${isLogin ? '' : '<small>Use at least 12 characters.</small>'}
          <p id="m3tAuthError" style="min-height:1.25rem;color:#b91c1c"></p>
          <button type="submit" style="width:100%;padding:.8rem">${isLogin ? 'Sign In' : 'Save Password'}</button>
        </form>`;
      document.body.appendChild(overlay);
      const form = overlay.querySelector('#m3tAuthForm');
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const error = overlay.querySelector('#m3tAuthError');
        error.textContent = '';
        try {
          if (isLogin) {
            const payload = await api('/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: overlay.querySelector('#m3tAuthEmail').value,
                password: overlay.querySelector('#m3tAuthPassword').value
              })
            });
            localStorage.setItem(TOKEN_KEY, payload.token);
            setCurrentUser(payload.authUser);
            overlay.remove();
            resolve(currentUser);
            return;
          }
          const endpoint = mode === 'invite' ? '/auth/invitations/accept' : '/auth/password-reset/accept';
          await api(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: specialToken, password: overlay.querySelector('#m3tAuthPassword').value })
          });
          overlay.remove();
          const url = new URL(window.location.href);
          url.searchParams.delete(mode);
          history.replaceState({}, '', url);
          resolve(await authScreen('login'));
        } catch (err) {
          error.textContent = err.message;
        }
      });
    });
  }

  async function bootstrap(base) {
    installFetch(base);
    const params = new URLSearchParams(window.location.search);
    if (params.get('invite')) return authScreen('invite', params.get('invite'));
    if (params.get('reset')) return authScreen('reset', params.get('reset'));
    if (token()) {
      try {
        const session = await api('/auth/session');
        return setCurrentUser(session.authUser);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return authScreen('login');
  }

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
  }

  window.M3TAuth = {
    bootstrap,
    installFetch,
    logout,
    currentUser: () => currentUser
  };
})();
