// isso aqui é pra aquela animação de container da página faq

document.querySelectorAll('.faq-pergunta').forEach(button => {
    button.addEventListener('click', () => {
        const item = button.parentElement;
        const isOpen = item.classList.contains('ativo');

        // fecha todos os outros
        document.querySelectorAll('.faq-item').forEach(i => {
            i.classList.remove('ativo');
            i.querySelector('.faq-pergunta').setAttribute('aria-expanded', 'false');
        });

        // abre o clicado (se não estava aberto)
        if (!isOpen) {
            item.classList.add('ativo');
            button.setAttribute('aria-expanded', 'true');
        }
    });
});
