// Dark Mode Toggle
(function() {
    const toggle = document.getElementById('darkmode-toggle');
    const body = document.body;
    const themeColorMeta = document.getElementById('theme-color-meta');
    
    // Checa se tem preferência salva no localStorage
    const savedTheme = localStorage.getItem('pfpedia-theme');
    
    // Checa preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Aplica tema salvo ou preferência do sistema
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        body.classList.add('dark-mode');
        if (themeColorMeta) themeColorMeta.content = '#1a1a2e';
    }
    
    // Toggle ao clicar
    toggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        
        const isDark = body.classList.contains('dark-mode');
        
        // Salva preferência
        localStorage.setItem('pfpedia-theme', isDark ? 'dark' : 'light');
        
        // Atualiza cor da barra do navegador mobile
        if (themeColorMeta) {
            themeColorMeta.content = isDark ? '#1a1a2e' : '#ffea98';
        }
        
        // Animação do botão
        toggle.classList.add('clicked');
        setTimeout(() => toggle.classList.remove('clicked'), 300);
    });
})();
