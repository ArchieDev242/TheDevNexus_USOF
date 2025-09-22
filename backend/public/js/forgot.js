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
        submitBtn.innerHTML = submitBtn.dataset.label || 'Отправить ссылку';
        submitBtn.disabled = false;
        }
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        if (!email) { setStatus('error','Введите email'); return; }
        withSpinner(true);
        try {
        const r = await fetch('/api/auth/password-reset', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        // Всегда генерик-ответ
        setStatus('success', 'Если такой email существует, мы отправили ссылку для сброса.');
        form.reset();
        } catch (err) {
        setStatus('error','Не удалось отправить ссылку, попробуйте позже');
        } finally {
        withSpinner(false);
        }
    });
})();
