(function(){
    function getParams() {
        const url = new URL(window.location.href);
        const qsToken = url.searchParams.get('token');
        const qsEmail = url.searchParams.get('email');
        // поддержка фрагмента
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        return {
            token: qsToken || hash.get('token'),
            email: qsEmail || hash.get('email')
        };
    }

    async function verify(token, email) {
        const r = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email })
        });
        if (!r.ok) throw new Error('invalid');
        return r.json();
    }

    (async () => {
        const status = document.getElementById('status');
        const form = document.getElementById('form');
        const submit = document.getElementById('submit');
        const pwd = document.getElementById('password');
        const pwd2 = document.getElementById('passwordConfirm');

        const { token, email } = getParams();
        if (!token || !email) {
            status.className = 'status error';
            status.textContent = 'Неверная или неполная ссылка.';
            return;
        }

        try {
            await verify(token, email);
            status.style.display = 'none';
            form.style.display = 'block';
        } catch {
            status.className = 'status error';
            status.textContent = 'Токен неверный или истёк.';
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submit.disabled = true;
            if (pwd.value.length < 8) {
                submit.disabled = false;
                status.style.display = 'block';
                status.className = 'status error';
                status.textContent = 'Пароль должен быть не менее 8 символов';
                return;
            }
            if (pwd.value !== pwd2.value) {
                submit.disabled = false;
                status.style.display = 'block';
                status.className = 'status error';
                status.textContent = 'Пароли не совпадают';
                return;
            }
            try {
                const r = await fetch(`/api/auth/password-reset/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, token, newPassword: pwd.value })
                });
                const json = await r.json().catch(() => ({}));
                if (r.ok) {
                    alert('Пароль изменён. Теперь войдите заново.');
                    window.location.href = '/login';
                } else {
                    throw new Error(json.error || 'Ошибка');
                }
            } catch (err) {
                submit.disabled = false;
                status.style.display = 'block';
                status.className = 'status error';
                status.textContent = err.message || 'Ошибка при смене пароля';
            }
        });
    })();
})();
