<<<<<<< HEAD
let livros = JSON.parse(localStorage.getItem("bibliotecaLivros")) || [];
let modoLista = localStorage.getItem("modoLista") === "true";

let livros = JSON.parse(localStorage.getItem("bibliotecaLivros")) || [];
let modoLista = localStorage.getItem("modoLista") === "true";

function abrirModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
}

function fecharModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.getElementById("tituloInput").value = "";
    document.getElementById("autorInput").value = "";
}

function AbrirModalCodigo() {
    const modalCodigo = document.getElementById("modalCodigo");
    modalCodigo.style.display = "flex"
}

function fecharModalCodigo() {
    document.getElementById("modalCodigo").style.display = "none"
    document.getElementById("isbnInput").value=""
}

function abrirModalManual () {
    const modalManual = document.getElementById("modalManual");
    modalManual.style.display = "flex"
}

function fechaModalManual () {
    document.getElementById("modalManual").style.display = "none"
    document.getElementById("tituloInput").value =""
    document.getElementById("capaManual").value = ""
    document.getElementById("autorInput").value = ""
    document.getElementById("codigoInput").value = ""
    document.getElementById("volumeInput").value = ""
    document.getElementById("paginasINput").value = ""
    document.getElementById("sinopseInput").value = ""
    document.getElementById("dataInput").value = ""
}

function fecharModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.getElementById("tituloInput").value = "";
    document.getElementById("autorInput").value = "";
}

function abrirModalPerfil() {
    const modalPerfil = document.getElementById("modalPerfil");
    modalPerfil.style.display = "flex"
}

function fecharModalPerfil() {
    document.getElementById("modalPerfil").style.display = "none";
}

function fecharModalPerfil() {
    document.getElementById("modalPerfil").style.display = "none";
}

document.querySelector(".ConfirmarNome").addEventListener("click", function () {
    const nome = document.getElementById("nomeInput").value.trim();
    const generoSelecionado = document.querySelector('input[name="genero"]:checked').value;
    const artigo = generoSelecionado === "feminino" ? "da" : "do";

    if (nome) {
        const titulo = document.querySelector("h1");
        titulo.textContent = `Estante ${artigo} ${nome}`;

        // Salva no localStorage
        localStorage.setItem("perfilUsuario", JSON.stringify({ nome, artigo }));

        fecharModalPerfil();
    }
});
    if (nome) {
        const titulo = document.querySelector("h1");
        titulo.textContent = `Estante ${artigo} ${nome}`;


function buscarELivro() {
    const titulo = document.getElementById("tituloInput").value;
    const autor = document.getElementById("autorInput").value;

    if (!titulo || !autor) {
        alert("Preencha título e autor!");
        return;
    }

    const query = `intitle:${titulo}+inauthor:${autor}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                alert("Livro não encontrado.");
                return;
            }

            const livro = data.items[0].volumeInfo;
            const livroObj = {
                titulo: livro.title,
                autor: livro.authors?.join(', ') || "Autor desconhecido",
                capa: livro.imageLinks?.extraLarge ||
                    livro.imageLinks?.large ||
                    livro.imageLinks?.medium ||
                    livro.imageLinks?.thumbnail ||
                    livro.imageLinks?.smallThumbnail ||
                    "https://via.placeholder.com/300x450?text=Sem+Capa",
                volume: livro.subtitle || "",
                dataLancamento: livro.publishedDate || "Não informada",
                paginas: livro.pageCount || "N/D",
                isbn: livro.industryIdentifiers?.[0]?.identifier || "Não disponível",
                descricao: livro.description || "Sinopse não disponível.",
            };

            livros.push(livroObj);
            localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
            renderizarLivros();
            fecharModal();
        })
        .catch(() => {
            alert("Erro ao buscar o livro. Verifique a conexão.");
        });
}

function buscarPorISBN() {
    const isbn = document.getElementById("isbnInput").value.trim();

    if (!isbn) {
        alert("Digite o código ISBN!");
        return;
    }

    const query = `isbn:${isbn}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                alert("Livro não encontrado com esse ISBN.");
                return;
            }

            const livro = data.items[0].volumeInfo;
            const livroObj = {
                titulo: livro.title,
                autor: livro.authors?.join(', ') || "Autor desconhecido",
                capa: livro.imageLinks?.extraLarge ||
                    livro.imageLinks?.large ||
                    livro.imageLinks?.medium ||
                    livro.imageLinks?.thumbnail ||
                    livro.imageLinks?.smallThumbnail ||
                    "https://via.placeholder.com/300x450?text=Sem+Capa",
                volume: livro.subtitle || "",
                dataLancamento: livro.publishedDate || "Não informada",
                paginas: livro.pageCount || "N/D",
                isbn: livro.industryIdentifiers?.[0]?.identifier || isbn,
                descricao: livro.description || "Sinopse não disponível.",
            };

            // ✅ Verificação antes de adicionar
            const jaExiste = livros.some(l => l.isbn === livroObj.isbn);
            if (jaExiste) {
                alert("Esse livro já está na sua biblioteca.");
                return;
            }

            livros.push(livroObj);
            localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
            renderizarLivros();
            fecharModalCodigo();
        })
        .catch(() => {
            alert("Erro ao buscar o livro. Verifique a conexão.");
        });
}

function renderizarLivros() {
    const container = document.getElementById("livros-container");
    container.innerHTML = "";

    livros.forEach((livro, index) => {
        const card = document.createElement("div");
        card.className = "livro";
        if (modoLista) card.classList.add("lista");

        const img = document.createElement("img");
        img.src = livro.capa || "https://via.placeholder.com/300x450?text=Sem+Capa";
        img.alt = livro.titulo;

        const info = document.createElement("div");
        info.className = "info-livro";
        info.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p>${livro.autor}</p>
        `;

        const excluirBtn = document.createElement("button");
        excluirBtn.className = "excluir-btn";
        excluirBtn.innerHTML = `<span class="material-symbols-outlined">
delete
</span>`; // seu SVG aqui
        excluirBtn.onclick = (e) => {
            e.stopPropagation();
            livros.splice(index, 1);
            localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
            renderizarLivros();
        };

        card.onclick = () => {
            localStorage.setItem("livroSelecionado", JSON.stringify(livro));
            window.location.href = "livro.html";
        };

        card.onmouseenter = () => {
            const preview = document.getElementById("livro-preview");
            const sinopseLimitada = livro.descricao.length > 300
                ? livro.descricao.slice(0, 200) + "..."
                : livro.descricao;

            preview.innerHTML = `
                <img src="${livro.capa}" alt="${livro.titulo}">
                <h3>${livro.titulo}</h3>
                ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Data de lançamento:</strong> ${livro.dataLancamento}</p>
                <p><strong>Páginas:</strong> ${livro.paginas}</p>
                <p><strong>ISBN:</strong> ${livro.isbn}</p>
                <div class="sinopse">
                    <h4>Sinopse</h4>
                    <p>${sinopseLimitada}</p>
                </div>
            `;
            preview.style.display = "block";
        };

        card.onmouseleave = () => {
            document.getElementById("livro-preview").style.display = "none";
        };

        if (modoLista) {
            card.appendChild(img);
            card.appendChild(info);
        } else {
            card.appendChild(img);
        }

        card.appendChild(excluirBtn);
        container.appendChild(card);
    });
}

function filtrarLivros() {
    const termo = document.getElementById("Buscar").value.toLowerCase();
    const container = document.getElementById("livros-container");
    container.innerHTML = "";

    livros.forEach((livro, index) => {
        const titulo = livro.titulo.toLowerCase();
        const autor = livro.autor.toLowerCase();

        if (titulo.includes(termo) || autor.includes(termo)) {
            const card = document.createElement("div");
            card.className = modoLista ? "livro lista" : "livro";

            // Capa do livro
            const img = document.createElement("img");
            img.src = livro.capa || "https://via.placeholder.com/300x450?text=Sem+Capa";
            img.alt = livro.titulo;
            card.appendChild(img);

            // Informações adicionais no modo lista
            if (modoLista) {
                const info = document.createElement("div");
                info.className = "info-livro";
                info.innerHTML = `
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                    <p><strong>Lançamento:</strong> ${livro.dataLancamento}</p>
                `;
                card.appendChild(info);
            }

            // Botão de exclusão
            const excluirBtn = document.createElement("button");
            excluirBtn.className = "excluir-btn";
            excluirBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" fill="gray">
                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5-5h4v2h-4V4z"/>
                </svg>
            `;
            excluirBtn.onclick = (e) => {
                e.stopPropagation();
                livros.splice(index, 1);
                localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
                filtrarLivros();
            };
            card.appendChild(excluirBtn);

            // Eventos de clique e hover
            card.onclick = () => {
                localStorage.setItem("livroSelecionado", JSON.stringify(livro));
                window.location.href = "livro.html";
            };

            card.onmouseenter = () => {
                const preview = document.getElementById("livro-preview");
                const sinopseLimitada = livro.descricao.length > 1500
                    ? livro.descricao.slice(0, 1400) + "..."
                    : livro.descricao;

                preview.innerHTML = `
                    <img src="${livro.capa || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" alt="${livro.titulo}">
                    <h3>${livro.titulo}</h3>
                    ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Data de lançamento:</strong> ${livro.dataLancamento}</p>
                    <p><strong>Páginas:</strong> ${livro.paginas}</p>
                    <p><strong>ISBN:</strong> ${livro.isbn}</p>
                    <div class="sinopse">
                        <h4>Sinopse</h4>
                        <p>${sinopseLimitada}</p>
                    </div>
                `;
                preview.style.display = "block";
            };

            card.onmouseleave = () => {
                document.getElementById("livro-preview").style.display = "none";
            };

            container.appendChild(card);
        }
    });

    // Reaplica a classe de visualização correta
    if (modoLista) {
        container.classList.add("modo-lista");
    } else {
        container.classList.remove("modo-lista");
    }
}

// Executa ao carregar a página
renderizarLivros();
const perfilSalvo = JSON.parse(localStorage.getItem("perfilUsuario"));
if (perfilSalvo?.nome && perfilSalvo?.artigo) {
    const titulo = document.querySelector("h1");
    titulo.textContent = `Estante ${perfilSalvo.artigo} ${perfilSalvo.nome}`;
}


const container = document.getElementById("livros-container");
const icone = document.getElementById("icone-visualizacao");

// Aplica o modo salvo na interface
if (modoLista) {
    container.classList.add("modo-lista");
    icone.textContent = "dashboard";
} else {
    container.classList.remove("modo-lista");
    icone.textContent = "list";
}

renderizarLivros(); // Atualiza a visualização inicial

// Evento de clique para alternar e salvar no localStorage
document.getElementById("alternar-visualizacao").addEventListener("click", () => {
    modoLista = !modoLista;
    localStorage.setItem("modoLista", modoLista); // 👈 Salva o estado

    if (modoLista) {
        container.classList.add("modo-lista");
        icone.textContent = "dashboard";
    } else {
        container.classList.remove("modo-lista");
        icone.textContent = "list";
    }

    renderizarLivros(); // Atualiza a visualização com o novo modo
});
=======
let livros = JSON.parse(localStorage.getItem("bibliotecaLivros")) || [];
let modoLista = localStorage.getItem("modoLista") === "true";

function abrirModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
}

function fecharModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none";
    document.getElementById("tituloInput").value = "";
    document.getElementById("autorInput").value = "";
}

function abrirModalPerfil() {
    const modalPerfil = document.getElementById("modalPerfil");
    modalPerfil.style.display = "flex"
}

function fecharModalPerfil() {
    document.getElementById("modalPerfil").style.display = "none";
}

document.querySelector(".ConfirmarNome").addEventListener("click", function () {
    const nome = document.getElementById("nomeInput").value.trim();
    const generoSelecionado = document.querySelector('input[name="genero"]:checked').value;
    const artigo = generoSelecionado === "feminino" ? "da" : "do";

    if (nome) {
        const titulo = document.querySelector("h1");
        titulo.textContent = `Estante ${artigo} ${nome}`;

        // Salva no localStorage
        localStorage.setItem("perfilUsuario", JSON.stringify({ nome, artigo }));

        fecharModalPerfil();
    }
});

function buscarELivro() {
    const titulo = document.getElementById("tituloInput").value;
    const autor = document.getElementById("autorInput").value;

    if (!titulo || !autor) {
        alert("Preencha título e autor!");
        return;
    }

    const query = `intitle:${titulo}+inauthor:${autor}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.items || data.items.length === 0) {
                alert("Livro não encontrado.");
                return;
            }

            const livro = data.items[0].volumeInfo;
            const livroObj = {
                titulo: livro.title,
                autor: livro.authors?.join(', ') || "Autor desconhecido",
                capa: livro.imageLinks?.extraLarge ||
                    livro.imageLinks?.large ||
                    livro.imageLinks?.medium ||
                    livro.imageLinks?.thumbnail ||
                    livro.imageLinks?.smallThumbnail ||
                    "https://via.placeholder.com/300x450?text=Sem+Capa",
                volume: livro.subtitle || "",
                dataLancamento: livro.publishedDate || "Não informada",
                paginas: livro.pageCount || "N/D",
                isbn: livro.industryIdentifiers?.[0]?.identifier || "Não disponível",
                descricao: livro.description || "Sinopse não disponível.",
            };

            livros.push(livroObj);
            localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
            renderizarLivros();
            fecharModal();
        })
        .catch(() => {
            alert("Erro ao buscar o livro. Verifique a conexão.");
        });
}

function renderizarLivros() {
    const container = document.getElementById("livros-container");
    container.innerHTML = "";

    livros.forEach((livro, index) => {
        const card = document.createElement("div");
        card.className = "livro";
        if (modoLista) card.classList.add("lista");

        const img = document.createElement("img");
        img.src = livro.capa || "https://via.placeholder.com/300x450?text=Sem+Capa";
        img.alt = livro.titulo;

        const info = document.createElement("div");
        info.className = "info-livro";
        info.innerHTML = `
            <h3>${livro.titulo}</h3>
            <p>${livro.autor}</p>
        `;

        const excluirBtn = document.createElement("button");
        excluirBtn.className = "excluir-btn";
        excluirBtn.innerHTML = `<span class="material-symbols-outlined">
delete
</span>`; // seu SVG aqui
        excluirBtn.onclick = (e) => {
            e.stopPropagation();
            livros.splice(index, 1);
            localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
            renderizarLivros();
        };

        card.onclick = () => {
            localStorage.setItem("livroSelecionado", JSON.stringify(livro));
            window.location.href = "livro.html";
        };

        card.onmouseenter = () => {
            const preview = document.getElementById("livro-preview");
            const sinopseLimitada = livro.descricao.length > 300
                ? livro.descricao.slice(0, 200) + "..."
                : livro.descricao;

            preview.innerHTML = `
                <img src="${livro.capa}" alt="${livro.titulo}">
                <h3>${livro.titulo}</h3>
                ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                <p><strong>Autor:</strong> ${livro.autor}</p>
                <p><strong>Data de lançamento:</strong> ${livro.dataLancamento}</p>
                <p><strong>Páginas:</strong> ${livro.paginas}</p>
                <p><strong>ISBN:</strong> ${livro.isbn}</p>
                <div class="sinopse">
                    <h4>Sinopse</h4>
                    <p>${sinopseLimitada}</p>
                </div>
            `;
            preview.style.display = "block";
        };

        card.onmouseleave = () => {
            document.getElementById("livro-preview").style.display = "none";
        };

        if (modoLista) {
            card.appendChild(img);
            card.appendChild(info);
        } else {
            card.appendChild(img);
        }

        card.appendChild(excluirBtn);
        container.appendChild(card);
    });
}

function filtrarLivros() {
    const termo = document.getElementById("Buscar").value.toLowerCase();
    const container = document.getElementById("livros-container");
    container.innerHTML = "";

    livros.forEach((livro, index) => {
        const titulo = livro.titulo.toLowerCase();
        const autor = livro.autor.toLowerCase();

        if (titulo.includes(termo) || autor.includes(termo)) {
            const card = document.createElement("div");
            card.className = modoLista ? "livro lista" : "livro";

            // Capa do livro
            const img = document.createElement("img");
            img.src = livro.capa || "https://via.placeholder.com/300x450?text=Sem+Capa";
            img.alt = livro.titulo;
            card.appendChild(img);

            // Informações adicionais no modo lista
            if (modoLista) {
                const info = document.createElement("div");
                info.className = "info-livro";
                info.innerHTML = `
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                    <p><strong>Lançamento:</strong> ${livro.dataLancamento}</p>
                `;
                card.appendChild(info);
            }

            // Botão de exclusão
            const excluirBtn = document.createElement("button");
            excluirBtn.className = "excluir-btn";
            excluirBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" fill="gray">
                    <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12h-11L5 9zm5-5h4v2h-4V4z"/>
                </svg>
            `;
            excluirBtn.onclick = (e) => {
                e.stopPropagation();
                livros.splice(index, 1);
                localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
                filtrarLivros();
            };
            card.appendChild(excluirBtn);

            // Eventos de clique e hover
            card.onclick = () => {
                localStorage.setItem("livroSelecionado", JSON.stringify(livro));
                window.location.href = "livro.html";
            };

            card.onmouseenter = () => {
                const preview = document.getElementById("livro-preview");
                const sinopseLimitada = livro.descricao.length > 1500
                    ? livro.descricao.slice(0, 1400) + "..."
                    : livro.descricao;

                preview.innerHTML = `
                    <img src="${livro.capa || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" alt="${livro.titulo}">
                    <h3>${livro.titulo}</h3>
                    ${livro.volume ? `<p><strong>Volume:</strong> ${livro.volume}</p>` : ""}
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Data de lançamento:</strong> ${livro.dataLancamento}</p>
                    <p><strong>Páginas:</strong> ${livro.paginas}</p>
                    <p><strong>ISBN:</strong> ${livro.isbn}</p>
                    <div class="sinopse">
                        <h4>Sinopse</h4>
                        <p>${sinopseLimitada}</p>
                    </div>
                `;
                preview.style.display = "block";
            };

            card.onmouseleave = () => {
                document.getElementById("livro-preview").style.display = "none";
            };

            container.appendChild(card);
        }
    });

    // Reaplica a classe de visualização correta
    if (modoLista) {
        container.classList.add("modo-lista");
    } else {
        container.classList.remove("modo-lista");
    }
}

// Executa ao carregar a página
renderizarLivros();
const perfilSalvo = JSON.parse(localStorage.getItem("perfilUsuario"));
if (perfilSalvo?.nome && perfilSalvo?.artigo) {
    const titulo = document.querySelector("h1");
    titulo.textContent = `Estante ${perfilSalvo.artigo} ${perfilSalvo.nome}`;
}


const container = document.getElementById("livros-container");
const icone = document.getElementById("icone-visualizacao");

// Aplica o modo salvo na interface
if (modoLista) {
    container.classList.add("modo-lista");
    icone.textContent = "dashboard";
} else {
    container.classList.remove("modo-lista");
    icone.textContent = "list";
}

renderizarLivros(); // Atualiza a visualização inicial

// Evento de clique para alternar e salvar no localStorage
document.getElementById("alternar-visualizacao").addEventListener("click", () => {
    modoLista = !modoLista;
    localStorage.setItem("modoLista", modoLista); // 👈 Salva o estado

    if (modoLista) {
        container.classList.add("modo-lista");
        icone.textContent = "dashboard";
    } else {
        container.classList.remove("modo-lista");
        icone.textContent = "list";
    }

    renderizarLivros(); // Atualiza a visualização com o novo modo

});
>>>>>>> 79a2bc6e5afadf07ebe74fe1b25e6e5e2db254f8
