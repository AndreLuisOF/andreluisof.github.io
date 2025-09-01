// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDpi4DaxqYveqRcWYdv9rN_qGERCMDSajM",
  authDomain: "bookshelf-7b686.firebaseapp.com",
  projectId: "bookshelf-7b686",
  storageBucket: "bookshelf-7b686.firebasestorage.app",
  messagingSenderId: "263637972371",
  appId: "1:263637972371:web:48b1af61e6c0ce11b3e466",
  measurementId: "G-JEXXLW31GX",
};

firebase.initializeApp(firebaseConfig);

// Inicializa Firestore
const db = firebase.firestore();
const auth = firebase.auth();

auth.onAuthStateChanged((user) => {
  if (user) {
    carregarLivros(user.uid);
  }
});

let modoLista = false;
let livrosCarregados = [];
let ordenarPorAutor = false;
let ordemAutoresAscendente = true;
let filtroAtivo = "padrao"; // "padrao", "autorAsc", "autorDesc"

function atualizarVisualizacao(uid) {
  livrosContainer.innerHTML = "";
  livrosCarregados.forEach(({ livro, livroId }) => {
    renderizarLivro(livro, uid, livroId);
  });
}

const botaoVisualizacao = document.getElementById("alternar-visualizacao");
const iconeVisualizacao = document.getElementById("icone-visualizacao");

botaoVisualizacao.addEventListener("click", () => {
  modoLista = !modoLista;
  iconeVisualizacao.textContent = modoLista ? "dashboard" : "dehaze";

  // Adiciona ou remove a classe 'modo-lista' no container
  if (modoLista) {
    livrosContainer.classList.add("modo-lista");
  } else {
    livrosContainer.classList.remove("modo-lista");
  }

  const user = auth.currentUser;
  if (user) atualizarVisualizacao(user.uid);
});

const botaoOrdenar = document.getElementById("sortByName");

botaoOrdenar.addEventListener("click", () => {
  if (filtroAtivo === "autorAsc") {
    filtroAtivo = "autorDesc";
  } else {
    filtroAtivo = "autorAsc";
  }

  aplicarFiltro();
});

const botaoRemoverFiltros = document.getElementById("removeFilters");

botaoRemoverFiltros.addEventListener("click", () => {
  filtroAtivo = "padrao";
  aplicarFiltro();
});

function aplicarFiltro() {
  const user = auth.currentUser;
  if (!user) return;

  if (filtroAtivo === "padrao") {
    carregarLivros(user.uid); // Recarrega do Firestore com ordem por timestamp
  } else {
    livrosCarregados.sort((a, b) => {
      const autorA = (a.livro.autor || "").toLowerCase();
      const autorB = (b.livro.autor || "").toLowerCase();

      if (autorA < autorB) return filtroAtivo === "autorAsc" ? -1 : 1;
      if (autorA > autorB) return filtroAtivo === "autorAsc" ? 1 : -1;
      return 0;
    });

    atualizarVisualizacao(user.uid);
  }
}

// Referência ao container de livros
const livrosContainer = document.getElementById("livros-container");

function deslogarUsuario() {
  auth
    .signOut()
    .then(() => {
      console.log("Usuário deslogado com sucesso.");
      window.location.href = "login.html"; // Redireciona para a tela de login
    })
    .catch((error) => {
      console.error("Erro ao deslogar:", error.message);
    });
}

// Função para renderizar um livro
function renderizarLivro(livro, uid, livroId) {
  const div = document.createElement("div");
  div.classList.add("livro");

  const data = livro.timestamp?.toDate();
  const dataFormatada = data
    ? data.toLocaleDateString("pt-BR")
    : "Data desconhecida";

  if (modoLista) {
    div.classList.add("lista");
  } else {
    div.classList.add("livro-card"); // estilo original em grid
  }

  const img = document.createElement("img");
  img.src = livro.capa || "img/default.png";
  img.alt = livro.titulo || "Capa do livro";

  // Preview ao passar o mouse
  div.addEventListener("mouseenter", () => mostrarPreviewLivro(livro));
  div.addEventListener("mouseleave", esconderPreviewLivro);

  // Ícone de exclusão
  const iconeExcluir = document.createElement("span");
  iconeExcluir.classList.add(
    "material-symbols-outlined",
    "btn-excluir",
    "excluir-btn"
  );
  iconeExcluir.textContent = "delete";
  iconeExcluir.onclick = () => excluirLivro(uid, livroId);

  div.appendChild(img);

  if (modoLista) {
    const info = document.createElement("div");
    info.classList.add("info-livro");

    const titulo = document.createElement("h3");
    titulo.textContent = livro.titulo || "Sem título";

    const autor = document.createElement("p");
    autor.textContent = livro.autor || "Autor desconhecido";

    info.appendChild(titulo);
    info.appendChild(autor);
    div.appendChild(info);
  }

  div.appendChild(iconeExcluir);
  livrosContainer.insertBefore(div, livrosContainer.firstChild);
}

// Carrega livros do usuário logado
function carregarLivros(uid) {
  db.collection("usuarios")
    .doc(uid)
    .collection("livros")
    .orderBy("timestamp", "desc")
    .get()
    .then((snapshot) => {
      livrosCarregados = [];

      snapshot.forEach((doc) => {
        const livro = doc.data();
        const livroId = doc.id;
        livrosCarregados.push({ livro, livroId });
      });

      atualizarVisualizacao(uid);

      // Atualiza contador de livros
      document.getElementById("contador-livros").textContent = `${
        livrosCarregados.length
      } Livro${livrosCarregados.length !== 1 ? "s" : ""}`;
    })
    .catch((error) => {
      console.error("Erro ao carregar livros:", error);
      alert("Não foi possível carregar os livros.");
    });
}

// Adiciona livro ao Firestore
function salvarLivro(uid, livro) {
  livro.timestamp = firebase.firestore.FieldValue.serverTimestamp();

  db.collection("usuarios")
    .doc(uid)
    .collection("livros")
    .add(livro)
    .then((docRef) => {
      // Aguarda o documento ser salvo com timestamp resolvido
      return docRef.get();
    })
    .then(() => {
      // Agora sim, recarrega a lista com o timestamp válido
      carregarLivros(uid);
    })
    .catch((error) => {
      console.error("Erro ao salvar livro:", error);
      alert("Não foi possível salvar o livro.");
    });
}

function excluirLivro(uid, livroId) {
  if (confirm("Tem certeza que deseja excluir este livro?")) {
    db.collection("usuarios")
      .doc(uid)
      .collection("livros")
      .doc(livroId)
      .delete()
      .then(() => {
        console.log("Livro excluído com sucesso.");
        carregarLivros(uid); // Atualiza a lista
      })
      .catch((error) => {
        console.error("Erro ao excluir livro:", error);
        alert("Não foi possível excluir o livro.");
      });
  }
}

// Busca livro pela API do Google Books
function buscarELivro() {
  const titulo = document.getElementById("tituloBuscaInput").value;
  const autor = document.getElementById("autorBuscaInput").value;
  const query = `${titulo} ${autor}`;

  fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.items && data.items.length > 0) {
        const info = data.items[0].volumeInfo;
        const sale = data.items[0].saleInfo;

        const livro = {
          titulo: info.title || "Sem título",
          autor: (info.authors && info.authors.join(", ")) || "Desconhecido",
          editora: info.publisher || "",
          isbn: info.industryIdentifiers?.[0]?.identifier || "",
          paginas: info.pageCount || "",
          sinopse: info.description || "",
          capa: info.imageLinks?.thumbnail || "",
        };

        const user = auth.currentUser;
        if (user) salvarLivro(user.uid, livro);
        fecharModal();
      } else {
        alert("Livro não encontrado.");
      }
    })
    .catch((error) => {
      console.error("Erro na busca:", error);
      alert("Erro ao buscar livro.");
    });
}

function mostrarPreviewLivro(livro) {
  const preview = document.getElementById("livro-preview");
  preview.style.display = "block";

  preview.innerHTML = `
    <h2>${livro.titulo || "Sem título"}</h2>
    <img src="${livro.capa || "https://via.placeholder.com/128x192?text=Sem+Capa"}" alt="Capa do livro" />

    <p><strong>Autor:</strong> ${livro.autor || "—"}</p>
    <p><strong>Editora:</strong> ${livro.editora || "—"}</p>
    <p><strong>Volume:</strong> ${livro.volume || "—"}</p>
    <p><strong>Série:</strong> ${livro.serie || "—"}</p>
    <p><strong>Data de lançamento:</strong> ${livro.data || "—"}</p>
    <p><strong>ISBN:</strong> ${livro.isbn || "—"}</p>
    <p><strong>Número de páginas:</strong> ${livro.paginas || "—"}</p>

    <p><strong>Sinopse:</strong></p>
    <p>${livro.sinopse || "—"}</p>
  `;
}

function esconderPreviewLivro() {
  const preview = document.getElementById("livro-preview");
  preview.style.display = "none";
  preview.innerHTML = ""; // Limpa conteúdo
}

// Adiciona livro manualmente
function adicionarLivroManual() {
  const livro = {
    titulo: document.getElementById("tituloInput").value,
    autor: document.getElementById("autorInput").value,
    editora: document.getElementById("editoraInput").value,
    isbn: document.getElementById("codigoInput").value,
    paginas: document.getElementById("paginasInput").value,
    sinopse: document.getElementById("sinopseInput").value,
    capa: "", // Você pode implementar upload de imagem no Firebase Storage depois
  };

  const user = auth.currentUser;
  if (user) salvarLivro(user.uid, livro);
  fecharModalManual();
}

function abrirModal() {
  document.getElementById("tituloBuscaInput").value = "";
  document.getElementById("modal").style.display = "flex";
}

function abrirModalManual() {
  document.getElementById("tituloInput").value = "";
  document.getElementById("capaManual").value = "";
  document.getElementById("autorInput").value = "";
  document.getElementById("codigoInput").value = "";
  document.getElementById("editoraInput").value = "";
  document.getElementById("serieInput").value = "";
  document.getElementById("volumeInput").value = "";
  document.getElementById("paginasInput").value = "";
  document.getElementById("sinopseInput").value = "";
  document.getElementById("dataInput").value = "";
  document.getElementById("modalManual").style.display = "flex";
}

function abrirLogoutModal() {
  document.getElementById("modalLogout").style.display = "flex";
}

// Fecha modais
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}
function fecharModalManual() {
  document.getElementById("modalManual").style.display = "none";
}
function fecharModalLogout() {
  document.getElementById("modalLogout").style.display = "none";
}

// Autenticação
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("Usuário autenticado:", user.uid);
    carregarLivros(user.uid);
  } else {
    console.warn("Usuário não autenticado");
    window.location.href = "login.html";
  }
});
