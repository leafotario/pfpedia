// isso aqui é pra trocar o nome de personagem que fica na barra de pesquisa do site cada vez que vc atualizar o site
// dai ele pega uma aleatoria do banco de palavras .json e coloca

async function carregarPlaceholder() {
    try {
        const resposta = await fetch("../json/placeholdernames.json");
        const data = await resposta.json();

        const lista = data.palavras;
        if (!lista || lista.length === 0) return;

        const input = document.querySelector(".search-input");
        if (!input) return;

        const palavra = lista[Math.floor(Math.random() * lista.length)];
        input.placeholder = palavra;

    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
    }
}

window.addEventListener("DOMContentLoaded", carregarPlaceholder);