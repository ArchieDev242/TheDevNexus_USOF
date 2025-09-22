(function(){
    const form = document.getElementById('form');
    const statusEl = document.getElementById('status');
    const submitBtn = document.getElementById('submit');
    if (!form) return;
    function setStatus(type, msg) {
        statusEl.style.display = 'block';
        statusEl.className = 'status ' + (type === 'error' ? 'error' : type === 'success' ? 'success' : 'info');
        statusEl.textContent = msg;
    }
    function withSpinner(active){
        if (active) {
        submitBtn.dataset.label = submitBtn.textContent;
        submitBtn.innerHTML = submitBtn.textContent + ' <span class="spinner"></span>';
        submitBtn.disabled = true;
        } else {
        submitBtn.innerHTML = submitBtn.dataset.label || 'Войти';
        submitBtn.disabled = false;
        }
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
        loginOrEmail: document.getElementById('loginOrEmail').value.trim(),
        password: document.getElementById('password').value
        };
        if (!payload.loginOrEmail || !payload.password) {
        setStatus('error', 'Введите email/логин и пароль');
        return;
        }
        withSpinner(true);
        try {
        const r = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json.error || 'Ошибка входа');
        setStatus('success', 'Вход выполнен');
        // localStorage.setItem('token', json.token);
        // location.href = '/';
        } catch (err) {
        setStatus('error', err.message || 'Не удалось войти');
        } finally {
        withSpinner(false);
        }
    });
})();
