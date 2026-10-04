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

  function cleanDisplayName(value) {
    return String(value || '').trim().replace(/^["']+|["']+$/g, '').trim();
  }

  function displayName(user) {
    return cleanDisplayName(user?.displayName) || user?.email || 'M3T User';
  }

  function roleLabel(role) {
    return ({
      technician: 'Technician',
      project_manager: 'Project Manager',
      system_admin: 'System Administrator',
      admin: 'System Administrator'
    })[role] || 'User';
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
      const needsConfirmation = !isLogin;
      overlay.innerHTML = `
        <form id="m3tAuthForm" class="auth-card">
          <h2 style="margin-top:0">M3T ${isLogin ? 'Sign In' : (mode === 'invite' ? 'Create Account' : 'Reset Password')}</h2>
          ${isLogin ? '<label>Email<input id="m3tAuthEmail" type="email" autocomplete="username" required></label>' : ''}
          <label>Password<span class="password-field"><input id="m3tAuthPassword" type="password" autocomplete="${isLogin ? 'current-password' : 'new-password'}" minlength="${isLogin ? '1' : '12'}" required><button type="button" class="password-toggle" data-target="m3tAuthPassword" aria-label="Show password">Show</button></span></label>
          ${needsConfirmation ? '<label>Confirm Password<span class="password-field"><input id="m3tAuthPasswordConfirm" type="password" autocomplete="new-password" minlength="12" required><button type="button" class="password-toggle" data-target="m3tAuthPasswordConfirm" aria-label="Show confirmed password">Show</button></span></label>' : ''}
          ${isLogin ? '' : '<small>Use at least 12 characters.</small>'}
          <p id="m3tAuthError" style="min-height:1.25rem;color:#b91c1c"></p>
          <button type="submit" style="width:100%;padding:.8rem">${isLogin ? 'Sign In' : 'Save Password'}</button>
        </form>`;
      document.body.appendChild(overlay);
      const form = overlay.querySelector('#m3tAuthForm');
      overlay.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', () => {
          const input = overlay.querySelector(`#${button.dataset.target}`);
          const showing = input.type === 'text';
          input.type = showing ? 'password' : 'text';
          button.textContent = showing ? 'Show' : 'Hide';
          button.setAttribute('aria-label', `${showing ? 'Show' : 'Hide'} password`);
        });
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const error = overlay.querySelector('#m3tAuthError');
        error.textContent = '';
        try {
          if (needsConfirmation && overlay.querySelector('#m3tAuthPassword').value !== overlay.querySelector('#m3tAuthPasswordConfirm').value) {
            throw new Error('Passwords do not match');
          }
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
    currentUser: () => currentUser,
    displayName,
    roleLabel
  };
})();
