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
        submitBtn.innerHTML = submitBtn.dataset.label || 'Зарегистрироваться';
        submitBtn.disabled = false;
        }
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
        login: document.getElementById('login').value.trim(),
        password: document.getElementById('password').value,
        full_name: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim()
        };
        if (!payload.login || !payload.password || !payload.full_name || !payload.email) {
        setStatus('error', 'Заполните все поля');
        return;
        }
        if (payload.password.length < 8) {
        setStatus('error', 'Пароль должен быть не менее 8 символов');
        return;
        }
        withSpinner(true);
        try {
        const r = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(json.error || 'Ошибка регистрации');
        setStatus('success', 'Пользователь создан. Проверьте почту для подтверждения.');
        form.reset();
        } catch (err) {
        setStatus('error', err.message || 'Не удалось зарегистрироваться');
        } finally {
        withSpinner(false);
        }
    });
})();
