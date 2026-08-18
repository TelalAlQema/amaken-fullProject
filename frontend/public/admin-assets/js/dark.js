  const toggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Universal mode detection
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Apply saved or system preference on page load
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.classList.add('dark-mode');
    if (toggle) toggle.checked = true;
  }

  // On toggle change, update theme + save preference
  if (toggle) {
    toggle.addEventListener('change', () => {
      body.classList.toggle('dark-mode');
      const theme = body.classList.contains('dark-mode') ? 'dark' : 'light';
      localStorage.setItem('theme', theme);
    });
  }
