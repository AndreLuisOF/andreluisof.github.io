// Abre o banco IndexedDB
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

// Carrega o livro selecionado pelo ID salvo no localStorage
async function carregarLivroSelecionado() {
  const id = Number(localStorage.getItem("livroSelecionadoId"));
  if (!id) return mostrarErro();

  const db = await abrirBanco();
  const tx = db.transaction("livros", "readonly");
  const store = tx.objectStore("livros");
  const request = store.get(id);

  request.onsuccess = function () {
    const livro = request.result;
    if (livro) preencherPaginaLivro(livro);
    else mostrarErro();
  };
}

// Mostra mensagem de erro se o livro não for encontrado
function mostrarErro() {
  document.body.innerHTML = `
    <div style="text-align:center; font-family: var(--font); padding: 40px;">
      <p>Livro não encontrado.</p>
      <a href="index.html" class="voltar">⬅ Voltar à biblioteca</a>
    </div>
  `;
}

// Preenche os campos da página com os dados do livro
function preencherPaginaLivro(livro) {
  document.getElementById("capa").src = livro.capa;
  document.getElementById("titulo").textContent = livro.titulo;
  document.getElementById("autor").textContent = livro.autor;
  document.getElementById("volume").textContent =
    livro.volume || "Não informado";
  document.getElementById("data").textContent =
    livro.dataLancamento || "Desconhecida";
  document.getElementById("paginas").textContent = livro.paginas || "N/D";
  document.getElementById("isbn").textContent = livro.isbn || "Não disponível";
  document.getElementById("descricao").textContent =
    livro.descricao || "Sinopse não disponível.";

  // Armazena o livro atual para edição
  window.livroAtual = livro;
}

// Habilita edição dos campos
function habilitarEdicao() {
  const campos = [
    "titulo",
    "autor",
    "volume",
    "data",
    "paginas",
    "isbn",
    "descricao",
  ];
  campos.forEach((id) => {
    document.getElementById(id).contentEditable = "true";
    document.getElementById(id).style.borderBottom = "1px dashed #555";
  });

  // Mostrar input de nova capa
  document.getElementById("novaCapaInput").style.display = "block";

  document.getElementById("editarBtn").style.display = "none";
  document.getElementById("salvarBtn").style.display = "inline-block";
  document.getElementById("cancelarBtn").style.display = "inline-block";
}

// Cancela edição e restaura valores originais
function cancelarEdicao() {
  const livro = window.livroAtual;
  document.getElementById("titulo").textContent = livro.titulo;
  document.getElementById("autor").textContent = livro.autor;
  document.getElementById("volume").textContent =
    livro.volume || "Não informado";
  document.getElementById("data").textContent =
    livro.dataLancamento || "Desconhecida";
  document.getElementById("paginas").textContent = livro.paginas || "N/D";
  document.getElementById("isbn").textContent = livro.isbn || "Não disponível";
  document.getElementById("descricao").textContent =
    livro.descricao || "Sinopse não disponível.";

  const campos = [
    "titulo",
    "autor",
    "volume",
    "data",
    "paginas",
    "isbn",
    "descricao",
  ];
  campos.forEach((id) => {
    document.getElementById(id).contentEditable = "false";
    document.getElementById(id).style.borderBottom = "none";
  });

  document.getElementById("novaCapaInput").style.display = "none";
  document.getElementById("editarBtn").style.display = "inline-block";
  document.getElementById("salvarBtn").style.display = "none";
  document.getElementById("cancelarBtn").style.display = "none";
}

// Salva alterações no IndexedDB
async function salvarEdicao() {
  const novaCapaInput = document.getElementById("novaCapaInput");
  const novoTitulo = document.getElementById("titulo").textContent;

  let novaCapaBase64 = window.livroAtual.capa;

  if (novaCapaInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      novaCapaBase64 = e.target.result;

      await salvarLivroEditado(novoTitulo, novaCapaBase64);
    };
    reader.readAsDataURL(novaCapaInput.files[0]);
  } else {
    await salvarLivroEditado(novoTitulo, novaCapaBase64);
  }
}

async function salvarLivroEditado(novoTitulo, novaCapaBase64) {
  const livroEditado = {
    ...window.livroAtual,
    titulo: novoTitulo,
    capa: novaCapaBase64,
    autor: document.getElementById("autor").textContent,
    volume: document.getElementById("volume").textContent,
    dataLancamento: document.getElementById("data").textContent,
    paginas: document.getElementById("paginas").textContent,
    isbn: document.getElementById("isbn").textContent,
    descricao: document.getElementById("descricao").textContent,
  };

  const db = await abrirBanco();
  const tx = db.transaction("livros", "readwrite");
  tx.objectStore("livros").put(livroEditado);
  tx.oncomplete = () => {
    window.livroAtual = livroEditado;
    cancelarEdicao();
  };
}

// Inicia carregamento ao abrir a página
document.addEventListener("DOMContentLoaded", () => {
  carregarLivroSelecionado();

  // Atualiza a capa imediatamente após upload
  const inputCapa = document.getElementById("novaCapaInput");
  inputCapa.addEventListener("change", function () {
    const file = inputCapa.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("capa").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
});