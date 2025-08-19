const livro = JSON.parse(localStorage.getItem("livroSelecionado"));

if (livro) {
    document.getElementById("capa").src = livro.capa;
    document.getElementById("titulo").textContent = livro.titulo;
    document.getElementById("autor").textContent = livro.autor;
    document.getElementById("volume").textContent = livro.volume || "Não informado";
    document.getElementById("data").textContent = livro.dataLancamento || "Desconhecida";
    document.getElementById("paginas").textContent = livro.paginas || "N/D";
    document.getElementById("isbn").textContent = livro.isbn || "Não disponível";
    document.getElementById("descricao").textContent = livro.descricao || "Sinopse não disponível.";
} else {
    document.body.innerHTML = `
        <div style="text-align:center; font-family: var(--font); padding: 40px;">
          <p>Livro não encontrado.</p>
          <a href="index.html" class="voltar">⬅ Voltar à biblioteca</a>
        </div>
      `;
}

function habilitarEdicao() {
    const campos = ["autor", "volume", "data", "paginas", "isbn", "descricao"];
    campos.forEach(id => {
        document.getElementById(id).contentEditable = "true";
        document.getElementById(id).style.borderBottom = "1px dashed #555";
    });

    document.getElementById("editarBtn").style.display = "none";
    document.getElementById("salvarBtn").style.display = "inline-block";
    document.getElementById("cancelarBtn").style.display = "inline-block";
}

function cancelarEdicao() {
    // Restaura os valores originais
    document.getElementById("autor").textContent = livro.autor;
    document.getElementById("volume").textContent = livro.volume;
    document.getElementById("data").textContent = livro.dataLancamento;
    document.getElementById("paginas").textContent = livro.paginas;
    document.getElementById("isbn").textContent = livro.isbn;
    document.getElementById("descricao").textContent = livro.descricao;

    // Desativa edição visual
    const campos = ["autor", "volume", "data", "paginas", "isbn", "descricao"];
    campos.forEach(id => {
        document.getElementById(id).contentEditable = "false";
        document.getElementById(id).style.borderBottom = "none";
    });

    // Alterna botões
    document.getElementById("editarBtn").style.display = "inline-block";
    document.getElementById("salvarBtn").style.display = "none";
    document.getElementById("cancelarBtn").style.display = "none";
}

function salvarEdicao() {
    const livroEditado = {
        capa: livro.capa,
        titulo: livro.titulo,
        autor: document.getElementById("autor").textContent,
        volume: document.getElementById("volume").textContent,
        dataLancamento: document.getElementById("data").textContent,
        paginas: document.getElementById("paginas").textContent,
        isbn: document.getElementById("isbn").textContent,
        descricao: document.getElementById("descricao").textContent,
    };

    localStorage.setItem("livroSelecionado", JSON.stringify(livroEditado));

    const biblioteca = JSON.parse(localStorage.getItem("bibliotecaLivros")) || [];
    const index = biblioteca.findIndex(l => l.titulo === livro.titulo && l.autor === livro.autor);
    if (index !== -1) {
        biblioteca[index] = livroEditado;
        localStorage.setItem("bibliotecaLivros", JSON.stringify(biblioteca));
    }

    // Desativa edição
    const campos = ["autor", "volume", "data", "paginas", "isbn", "descricao"];
    campos.forEach(id => {
        document.getElementById(id).contentEditable = "false";
        document.getElementById(id).style.borderBottom = "none";
    });

    document.getElementById("editarBtn").style.display = "inline-block";
    document.getElementById("salvarBtn").style.display = "none";
    document.getElementById("cancelarBtn").style.display = "none";
}