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

// Inicializa o Firebase e o serviço de autenticação
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Se houver um usuário logado, redirecione para index.html
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Seleciona as seções
  const loginSection = document.getElementById("loginSection");
  const cadastroSection = document.getElementById("cadastroSection");
  const recuperarSection = document.getElementById("recuperarSection");

  // Seleciona os formulários
  const loginForm = document.getElementById("loginForm");
  const cadastroForm = document.getElementById("cadastroForm");
  const recuperarForm = document.getElementById("recuperarForm");

  // Botões de navegação
  const btnToCadastro = document.getElementById("btnToCadastro");
  const btnToLogin = document.getElementById("btnToLogin");
  const btnToRecuperar = document.getElementById("btnToRecuperar");
  const btnReturnLogin = document.getElementById("btnReturnLogin");

  btnToCadastro.addEventListener("click", () => {
    loginSection.style.display = "none";
    cadastroSection.style.display = "block";
    recuperarSection.style.display = "none";
  });

  btnToLogin.addEventListener("click", () => {
    cadastroSection.style.display = "none";
    recuperarSection.style.display = "none";
    loginSection.style.display = "block";
  });

  btnToRecuperar.addEventListener("click", (e) => {
    e.preventDefault();
    loginSection.style.display = "none";
    cadastroSection.style.display = "none";
    recuperarSection.style.display = "block";
  });

  btnReturnLogin.addEventListener("click", () => {
    recuperarSection.style.display = "none";
    loginSection.style.display = "block";
  });

  // Login
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Usuário logado:", user);
        // Redirecionamento será feito pelo onAuthStateChanged
      })
      .catch((error) => {
        console.error("Erro no login:", error.code, error.message);

        let mensagemErro =
          "Erro ao fazer login. Verifique os dados e tente novamente.";

        switch (error.code) {
          case "auth/user-not-found":
            mensagemErro =
              "Usuário não encontrado. Verifique o email digitado.";
            break;
          case "auth/wrong-password":
            mensagemErro = "Senha incorreta. Tente novamente.";
            break;
          case "auth/invalid-email":
            mensagemErro = "Formato de email inválido.";
            break;
          case "auth/user-disabled":
            mensagemErro = "Este usuário foi desativado.";
            break;
        }

        exibirMensagemErroLogin(mensagemErro);
      });
    function exibirMensagemErroLogin(mensagem) {
      const erroLogin = document.getElementById("erroLogin");
      erroLogin.textContent = mensagem;
      erroLogin.style.display = "block";
    }
  });

  // Cadastro
  cadastroForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const nome = cadastroForm.nome.value;
    const email = cadastroForm.email.value;
    const password = cadastroForm.password.value;

    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Usuário cadastrado:", user);

        // Cria o documento do usuário no Firestore
        db.collection("usuarios").doc(user.uid).set({
          nome: nome,
          email: email,
          criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
        });
      })
      .catch((error) => {
        console.error("Erro no cadastro:", error.message);
      });
  });

  // Recuperação de Senha
  recuperarForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const emailRecuperacao = recuperarForm.email.value;

    auth
      .sendPasswordResetEmail(emailRecuperacao)
      .then(() => {
        alert("Um email de recuperação foi enviado!");
        // Retorna para a tela de login
        recuperarSection.style.display = "none";
        loginSection.style.display = "block";
      })
      .catch((error) => {
        console.error("Erro ao enviar email de recuperação:", error.message);
      });
  });
});
