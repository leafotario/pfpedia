// Globo que fica quicando
const globo = document.getElementById('globo');
let x = Math.random() * (window.innerWidth - 75);
let y = Math.random() * (window.innerHeight - 75);
let velocidadeX = 2;
let velocidadeY = 2;

// isso era pra mudar as cores mas nao funciona mas deixa ai pq se tirar o codigo quebra
const cores = ['hue-rotate(0deg)', 'hue-rotate(60deg)', 'hue-rotate(120deg)', 'hue-rotate(180deg)', 'hue-rotate(240deg)', 'hue-rotate(300deg)'];
let corAtual = 0;

function animar() {
    x += velocidadeX;
    y += velocidadeY;

    // verifica colisão com as bordas e inverte direção
    if (x + 75 >= window.innerWidth || x <= 0) {
        velocidadeX *= -1;
        corAtual = (corAtual + 1) % cores.length;
        globo.style.filter = cores[corAtual];
    }

    if (y + 75 >= window.innerHeight || y <= 0) {
        velocidadeY *= -1;
        corAtual = (corAtual + 1) % cores.length;
        globo.style.filter = cores[corAtual];
    }

    // atualiza posição
    globo.style.left = x + 'px';
    globo.style.top = y + 'px';

    requestAnimationFrame(animar);
}

// ajusta quando a janela é redimensionada
window.addEventListener('resize', () => {
    if (x + 75 > window.innerWidth) x = window.innerWidth - 75;
    if (y + 75 > window.innerHeight) y = window.innerHeight - 75;
});

animar();