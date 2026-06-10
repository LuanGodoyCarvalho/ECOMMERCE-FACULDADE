const API_URL = 'http://localhost:5000';

function mostrarAba(aba) {
    const formLogin   = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const tabLogin    = document.getElementById('tab-login');
    const tabCadastro = document.getElementById('tab-cadastro');

    limparAlerta();

    if (aba === 'login') {
        formLogin.classList.remove('d-none');
        formCadastro.classList.add('d-none');
        tabLogin.classList.add('active');
        tabCadastro.classList.remove('active');
    } else {
        formLogin.classList.add('d-none');
        formCadastro.classList.remove('d-none');
        tabLogin.classList.remove('active');
        tabCadastro.classList.add('active');
    }
}

function mostrarAlerta(mensagem, tipo) {
    const alerta = document.getElementById('mensagem-alerta');
    alerta.textContent = mensagem;
    alerta.className = `alert alert-${tipo}`;
}

function limparAlerta() {
    const alerta = document.getElementById('mensagem-alerta');
    alerta.className = 'alert d-none';
    alerta.textContent = '';
}

async function fazerLogin() {
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;

    if (!email || !senha) {
        mostrarAlerta('Preencha email e senha.', 'warning');
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarAlerta(dados.erro || 'Erro ao fazer login.', 'danger');
            return;
        }

        sessionStorage.setItem('usuario', JSON.stringify({
            id:    dados.id,
            email: dados.email,
            tipo:  dados.tipo
        }));

        window.location.href = 'lista.html';
    } catch (e) {
        mostrarAlerta('Erro ao conectar com o servidor.', 'danger');
    }
}

async function fazerCadastro() {
    const email = document.getElementById('cad-email').value.trim();
    const senha = document.getElementById('cad-senha').value;
    const tipo  = document.querySelector('input[name="tipo-usuario"]:checked').value;

    if (!email || !senha) {
        mostrarAlerta('Preencha email e senha.', 'warning');
        return;
    }

    if (senha.length < 6) {
        mostrarAlerta('A senha deve ter no mínimo 6 caracteres.', 'warning');
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/usuarios/cadastro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha, tipo })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarAlerta(dados.erro || 'Erro ao criar conta.', 'danger');
            return;
        }

        mostrarAlerta('Conta criada com sucesso! Faça login para continuar.', 'success');
        document.getElementById('cad-email').value = '';
        document.getElementById('cad-senha').value = '';
        setTimeout(() => mostrarAba('login'), 1500);
    } catch (e) {
        mostrarAlerta('Erro ao conectar com o servidor.', 'danger');
    }
}

// Permitir envio com Enter
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const formLoginVisivel = !document.getElementById('form-login').classList.contains('d-none');
    if (formLoginVisivel) {
        fazerLogin();
    } else {
        fazerCadastro();
    }
});
