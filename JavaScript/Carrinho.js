const API_URL = 'http://localhost:5000';

function getUsuario() {
    return JSON.parse(sessionStorage.getItem('usuario') || 'null');
}

async function carregarCarrinho() {
    const usuario = getUsuario();
    const container = document.getElementById('carrinho-itens');

    if (!usuario) {
        container.innerHTML = '<div class="alert alert-warning">Faça <a href="Login.html">login</a> para ver seu carrinho.</div>';
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/carrinho/${usuario.id}`);

        if (!resposta.ok) {
            container.innerHTML = '<p class="text-danger">Erro ao carregar carrinho.</p>';
            return;
        }

        const itens = await resposta.json();

        if (itens.length === 0) {
            container.innerHTML = '<div class="alert alert-info">Seu carrinho esta vazio. <a href="lista.html">Veja nossos produtos</a></div>';
            atualizarResumo(0, 0);
            return;
        }

        let total = 0;
        let qtdTotal = 0;

        const html = itens.map(item => {
            const subtotal = item.preco * item.quantidade;
            total += subtotal;
            qtdTotal += item.quantidade;

            const imagemHtml = item.imagem
                ? `<img src="${item.imagem}" class="carrinho-img" alt="${item.nome}">`
                : '<div class="carrinho-img-placeholder">Sem imagem</div>';

            return `
            <div class="card mb-3">
                <div class="card-body d-flex align-items-center">
                    <div class="me-3">${imagemHtml}</div>
                    <div class="flex-grow-1">
                        <h5 class="card-title mb-1">${item.nome}</h5>
                        <p class="card-text mb-1">Preço: R$ ${item.preco.toFixed(2)}</p>
                        <p class="card-text mb-0"><small>Quantidade: ${item.quantidade} | Subtotal: R$ ${subtotal.toFixed(2)}</small></p>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="removerItem(${item.item_id})">Remover</button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = html;
        atualizarResumo(qtdTotal, total);

    } catch (e) {
        container.innerHTML = '<p class="text-danger">Erro ao conectar com o servidor.</p>';
    }
}

function atualizarResumo(qtd, total) {
    const elQtd = document.getElementById('resumo-qtd');
    const elTotal = document.getElementById('resumo-total');
    if (elQtd) elQtd.textContent = qtd;
    if (elTotal) elTotal.textContent = total.toFixed(2);
}

async function removerItem(itemId) {
    try {
        const resposta = await fetch(`${API_URL}/carrinho/${itemId}`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            carregarCarrinho();
        } else {
            alert('Erro ao remover item.');
        }
    } catch (e) {
        alert('Erro ao conectar com o servidor.');
    }
}

async function limparCarrinho() {
    const usuario = getUsuario();
    if (!usuario) return;

    if (!confirm('Tem certeza que deseja limpar o carrinho?')) return;

    try {
        const resposta = await fetch(`${API_URL}/carrinho/${usuario.id}/limpar`, {
            method: 'DELETE'
        });

        if (resposta.ok) {
            carregarCarrinho();
        } else {
            alert('Erro ao limpar carrinho.');
        }
    } catch (e) {
        alert('Erro ao conectar com o servidor.');
    }
}

document.addEventListener('DOMContentLoaded', carregarCarrinho);