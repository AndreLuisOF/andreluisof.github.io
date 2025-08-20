let livros = JSON.parse(localStorage.getItem("bibliotecaLivros")) || [];
let modoLista = localStorage.getItem("modoLista") === "true";

// Funções genéricas para abrir/fechar modais
function abrirModalPorId(id) {
  document.getElementById(id).style.display = "flex";
}

function fecharModalPorId(id, campos = []) {
  document.getElementById(id).style.display = "none";
  campos.forEach((campo) => {
    const el = document.getElementById(campo);
    if (el) el.value = "";
  });
}

// Modais específicos
function abrirModal() {
  abrirModalPorId("modal");
}
function fecharModal() {
  fecharModalPorId("modal", ["tituloBuscaInput", "autorBuscaInput"]);
}
function abrirModalCodigo() {
  abrirModalPorId("modalCodigo");
}
function fecharModalCodigo() {
  fecharModalPorId("modalCodigo", ["isbnInput"]);
}
function abrirModalManual() {
  abrirModalPorId("modalManual");
}
function fecharModalManual() {
  fecharModalPorId("modalManual", [
    "tituloInput",
    "capaManual",
    "autorInput",
    "codigoInput",
    "volumeInput",
    "paginasInput",
    "sinopseInput",
    "dataInput",
  ]);
}
function abrirModalPerfil() {
  abrirModalPorId("modalPerfil");
}
function fecharModalPerfil() {
  fecharModalPorId("modalPerfil");
}

// Busca por título e autor
function buscarELivro() {
  const titulo = document.getElementById("tituloBuscaInput").value;
  const autor = document.getElementById("autorBuscaInput").value;

  if (!titulo || !autor) {
    alert("Preencha título e autor!");
    return;
  }

  const query = `intitle:${titulo}+inauthor:${autor}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        alert("Livro não encontrado.");
        return;
      }

      const livro = data.items[0].volumeInfo;
      const livroObj = criarLivroObj(livro);

      livros.unshift(livroObj);
      localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
      renderizarLivros();
      fecharModal();
    })
    .catch(() => {
      alert("Erro ao buscar o livro. Verifique a conexão.");
    });
}

// Busca por ISBN
function buscarPorISBN() {
  const isbn = document.getElementById("isbnInput").value.trim();

  if (!isbn) {
    alert("Digite o código ISBN!");
    return;
  }

  const query = `isbn:${isbn}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        alert("Livro não encontrado com esse ISBN.");
        return;
      }

      const livro = data.items[0].volumeInfo;
      const livroObj = criarLivroObj(livro, isbn);

      const jaExiste = livros.some((l) => l.isbn === livroObj.isbn);
      if (jaExiste) {
        alert("Esse livro já está na sua biblioteca.");
        return;
      }

      livros.unshift(livroObj);
      localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
      renderizarLivros();
      fecharModalCodigo();
    })
    .catch(() => {
      alert("Erro ao buscar o livro. Verifique a conexão.");
    });
}

function adicionarLivroManual() {
  const titulo = document.getElementById("tituloInput").value.trim();
  const autor = document.getElementById("autorInput").value.trim() || "Autor desconhecido";
  const capaInput = document.getElementById("capaManual");
  const codigo = document.getElementById("codigoInput").value.trim() || "Não disponível";
  const volume = document.getElementById("volumeInput").value.trim();
  const paginas = document.getElementById("paginasInput").value.trim() || "N/D";
  const sinopse = document.getElementById("sinopseInput").value.trim() || "Sinopse não disponível.";
  const data = document.getElementById("dataInput").value || "Não informada";

  // Validação simples
  if (!titulo || !capaInput.files[0]) {
    alert("Preencha o título e selecione uma capa.");
    return;
  }

  // Criar URL da imagem da capa
  const capaURL = URL.createObjectURL(capaInput.files[0]);

  const novoLivro = {
    titulo,
    autor,
    capa: capaURL,
    volume,
    dataLancamento: data,
    paginas,
    isbn: codigo,
    descricao: sinopse,
  };

  livros.unshift(novoLivro);
  localStorage.setItem("bibliotecaLivros", JSON.stringify(livros));
  renderizarLivros();
  fecharModalManual();
}

// Cria objeto livro padronizado
function criarLivroObj(livro, isbnFallback = "Não disponível") {
  return {
    titulo: livro.title,
    autor: livro.authors?.join(", ") || "Autor desconhecido",
    capa:
      livro.imageLinks?.extraLarge ||
      livro.imageLinks?.large ||
      livro.imageLinks?.medium ||
      livro.imageLinks?.thumbnail ||
      livro.imageLinks?.smallThumbnail ||
      "https://via.placeholder.com/300x450?text=Sem+Capa",
    volume: livro.subtitle || "",
    dataLancamento: livro.publishedDate || "Não informada",
    paginas: livro.pageCount || "N/D",
    isbn: livro.industryIdentifiers?.[0]?.identifier || isbnFallback,
    descricao: livro.description || "Sinopse não disponível.",
  };
}

// Cria card de livro (usado em renderizar e filtrar)
function criarCardLivro(livro, index) {
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
  excluirBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
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
    const sinopseLimitada =
      livro.descricao.length > 300
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
  return card;
}

// Renderiza todos os livros
function renderizarLivros() {
  const container = document.getElementById("livros-container");
  container.innerHTML = "";
  livros.forEach((livro, index) => {
    container.appendChild(criarCardLivro(livro, index));
  });
}

// Filtra livros pelo termo buscado
function filtrarLivros() {
  const termo = document.getElementById("Buscar").value.toLowerCase();
  const container = document.getElementById("livros-container");
  container.innerHTML = "";

  livros.forEach((livro, index) => {
    const titulo = livro.titulo.toLowerCase();
    const autor = livro.autor.toLowerCase();

    if (titulo.includes(termo) || autor.includes(termo)) {
      container.appendChild(criarCardLivro(livro, index));
    }
  });

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

// Evento de clique para alternar e salvar no localStorage
document
  .getElementById("alternar-visualizacao")
  .addEventListener("click", () => {
    modoLista = !modoLista;
    localStorage.setItem("modoLista", modoLista);

    if (modoLista) {
      container.classList.add("modo-lista");
      icone.textContent = "dashboard";
    } else {
      container.classList.remove("modo-lista");
      icone.textContent = "list";
    }

    renderizarLivros();
  });
