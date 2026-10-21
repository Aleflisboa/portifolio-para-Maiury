
const revista = document.getElementById("revista");


const pageFlip = new St.PageFlip(revista, {
    width: 800,
    height: 900,

    size: "stretch",

    minWidth: 200,
    maxWidth: 2000,

    minHeight: 250,
    maxHeight: 2000,

    showCover: true,
    drawShadow: true,
    flippingTime: 1000,
    usePortrait: true,
    startPage: 0,
    maxShadowOpacity: 0.5,
    mobileScrollSupport: false,
    showPageCorners: true
});

// Carrega as páginas HTML
pageFlip.loadFromHTML(
    document.querySelectorAll(".pagina")
);

const anterior = document.getElementById("anterior");
const proxima = document.getElementById("proxima");
const contador = document.getElementById("contador");

// Botão para avançar
proxima.addEventListener("click", () => {
    pageFlip.flipNext();
});

// Botão para voltar
anterior.addEventListener("click", () => {
    pageFlip.flipPrev();
});

// Atualiza o contador
function atualizarContador() {
    const paginaAtual = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();

    contador.textContent =
        `${paginaAtual + 1} / ${total}`;

    anterior.disabled = paginaAtual === 0;
    proxima.disabled = paginaAtual === total - 1;
}

// Quando a página for virada
pageFlip.on("flip", atualizarContador);

// Inicializa os controles
atualizarContador();
