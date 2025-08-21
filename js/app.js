// IndexedDB setup
function abrirBanco() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("BibliotecaDB", 1);

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("livros")) {
        db.createObjectStore("livros", { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Erro ao abrir IndexedDB");
  });
}

// LocalStorage para configurações simples
let modoLista = localStorage.getItem("modoLista") === "true";

// Modais
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

document.querySelector(".ConfirmarNome").addEventListener("click", () => {
  const nome = document.getElementById("nomeInput").value.trim();
  const genero = document.querySelector('input[name="genero"]:checked').value;

  if (!nome) {
    alert("Por favor, informe seu nome.");
    return;
  }

  const artigo = genero === "feminino" ? "da" : "do";
  const titulo = document.querySelector(".cabecalho h1");
  titulo.textContent = `Estante ${artigo} ${nome}`;

  // Salva no localStorage para manter após recarregar
  const perfil = { nome, artigo };
  localStorage.setItem("perfilUsuario", JSON.stringify(perfil));

  fecharModalPerfil();
});

// Criar objeto livro
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
    dataAdicao: Date.now(),
  };
}

// Salvar livro no IndexedDB
async function salvarLivro(livroObj) {
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readwrite");
  tx.objectStore("livros").add(livroObj);
  tx.oncomplete = () => renderizarLivros();
}

// Buscar por título e autor
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
      salvarLivro(livroObj);
      fecharModal();
    })
    .catch(() => alert("Erro ao buscar o livro. Verifique a conexão."));
}

// Buscar por ISBN
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
    .then(async (data) => {
      if (!data.items || data.items.length === 0) {
        alert("Livro não encontrado com esse ISBN.");
        return;
      }

      const livro = data.items[0].volumeInfo;
      const livroObj = criarLivroObj(livro, isbn);

      const db = await abrirBanco();
      const tx = db.transaction("livros", "readonly");
      const store = tx.objectStore("livros");
      const todos = store.getAll();

      todos.onsuccess = () => {
        const jaExiste = todos.result.some((l) => l.isbn === livroObj.isbn);
        if (jaExiste) {
          alert("Esse livro já está na sua biblioteca.");
          return;
        }
        salvarLivro(livroObj);
        fecharModalCodigo();
      };
    })
    .catch(() => alert("Erro ao buscar o livro. Verifique a conexão."));
}

// Adicionar livro manual
function adicionarLivroManual() {
  const titulo = document.getElementById("tituloInput").value.trim();
  const autor =
    document.getElementById("autorInput").value.trim() || "Autor desconhecido";
  const capaInput = document.getElementById("capaManual");
  const codigo =
    document.getElementById("codigoInput").value.trim() || "Não disponível";
  const volume = document.getElementById("volumeInput").value.trim();
  const paginas = document.getElementById("paginasInput").value.trim() || "N/D";
  const sinopse =
    document.getElementById("sinopseInput").value.trim() ||
    "Sinopse não disponível.";
  const data = document.getElementById("dataInput").value || "Não informada";

  if (!titulo || !capaInput.files[0]) {
    alert("Preencha o título e selecione uma capa.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const capaBase64 = e.target.result;
    const novoLivro = {
      titulo,
      autor,
      capa: capaBase64,
      volume,
      dataLancamento: data,
      paginas,
      isbn: codigo,
      descricao: sinopse,
      dataAdicao: Date.now(),
    };
    salvarLivro(novoLivro);
    fecharModalManual();
  };
  reader.readAsDataURL(capaInput.files[0]);
}

// Excluir livro
async function excluirLivro(id) {
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readwrite");
  tx.objectStore("livros").delete(id);
  tx.oncomplete = () => renderizarLivros();
}

// Criar card
function criarCardLivro(livro) {
  const card = document.createElement("div");
  card.className = "livro";
  if (modoLista) card.classList.add("lista");

  const img = document.createElement("img");
  img.src = livro.capa;
  img.alt = livro.titulo;

  const info = document.createElement("div");
  info.className = "info-livro";
  info.innerHTML = `<h3>${livro.titulo}</h3><p>${livro.autor}</p>`;

  const excluirBtn = document.createElement("button");
  excluirBtn.className = "excluir-btn";
  excluirBtn.innerHTML = `<span class="material-symbols-outlined">delete</span>`;
  excluirBtn.onclick = (e) => {
    e.stopPropagation();
    excluirLivro(livro.id);
  };

  card.onclick = () => {
    localStorage.setItem("livroSelecionadoId", livro.id);
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
      <div class="sinopse"><h4>Sinopse</h4><p>${sinopseLimitada}</p></div>
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

async function renderizarLivros() {
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readonly");
  const store = tx.objectStore("livros");
  const request = store.getAll();

  request.onsuccess = function () {
    const container = document.getElementById("livros-container");
    const contador = document.getElementById("contador-livros");
    container.innerHTML = "";

    const livros = request.result.sort((a, b) => b.dataAdicao - a.dataAdicao);

    // Atualiza o contador
    contador.textContent = `${livros.length} Livros`;

    livros.forEach((livro) => {
      container.appendChild(criarCardLivro(livro));
    });

    if (modoLista) {
      container.classList.add("modo-lista");
    } else {
      container.classList.remove("modo-lista");
    }
  };
}

async function filtrarLivros() {
  const termo = document.getElementById("Buscar").value.toLowerCase();
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readonly");
  const store = tx.objectStore("livros");
  const request = store.getAll();

  request.onsuccess = function () {
    const container = document.getElementById("livros-container");
    container.innerHTML = "";
    const livros = request.result;

    livros.forEach((livro) => {
      const titulo = livro.titulo.toLowerCase();
      const autor = livro.autor.toLowerCase();

      if (titulo.includes(termo) || autor.includes(termo)) {
        container.appendChild(criarCardLivro(livro));
      }
    });
  };
}

async function ordenarAZ() {
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readonly");
  const store = tx.objectStore("livros");
  const request = store.getAll();

  request.onsuccess = function () {
    const livros = request.result.sort((a, b) =>
      a.autor.localeCompare(b.autor)
    );
    const container = document.getElementById("livros-container");
    container.innerHTML = "";
    livros.forEach((livro) => container.appendChild(criarCardLivro(livro)));
  };
}

async function ordenarZA() {
  const db = await abrirBanco();
  const tx = db.transaction("livros", "readonly");
  const store = tx.objectStore("livros");
  const request = store.getAll();

  request.onsuccess = function () {
    const livros = request.result.sort((a, b) =>
      b.autor.localeCompare(a.autor)
    );
    const container = document.getElementById("livros-container");
    container.innerHTML = "";
    livros.forEach((livro) => container.appendChild(criarCardLivro(livro)));
  };
}

function ordemPadrao() {
  renderizarLivros(); // apenas recarrega sem ordenação
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarLivros();

  const perfilSalvo = JSON.parse(localStorage.getItem("perfilUsuario"));
  if (perfilSalvo?.nome && perfilSalvo?.artigo) {
    const titulo = document.querySelector("h1");
    titulo.textContent = `Estante ${perfilSalvo.artigo} ${perfilSalvo.nome}`;
  }

  const container = document.getElementById("livros-container");
  const icone = document.getElementById("icone-visualizacao");

  if (modoLista) {
    container.classList.add("modo-lista");
    icone.textContent = "dashboard";
  } else {
    container.classList.remove("modo-lista");
    icone.textContent = "list";
  }

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
});
