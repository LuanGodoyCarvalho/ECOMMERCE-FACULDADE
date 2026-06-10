const API_URL = 'http://localhost:5000';

async function renderizarProdutos() {
	const container = document.getElementById('card-produto');
	if (!container) return;

	const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

	try {
		const resposta = await fetch(`${API_URL}/produtos`);

		if (!resposta.ok) {
			container.innerHTML = '<p class="ms-3">Erro ao carregar produtos.</p>';
			return;
		}

		const produtos = await resposta.json();

		if (produtos.length === 0) {
			container.innerHTML = '<p class="ms-3">Nenhum produto cadastrado ainda.</p>';
			return;
		}

		const cardsHtml = produtos.map((produto) => {
			const imagemHtml = produto.imagem
				? `<img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">`
				: '';

			const btnCarrinho = usuario
				? `<button class="btn btn-success btn-sm mt-2" onclick="adicionarAoCarrinho(${produto.id})">Adicionar ao Carrinho</button>`
				: `<a href="Login.html" class="btn btn-outline-secondary btn-sm mt-2">Entre para comprar</a>`;

			return `
			<div class="card m-2" style="width: 18rem;">
				${imagemHtml}
				<div class="card-body">
					<h5 class="card-title">${produto.nome}</h5>
					<p class="card-text">Preco: R$ ${Number(produto.preco).toFixed(2)}</p>
					${btnCarrinho}
				</div>
			</div>
		`;
		}).join('');

		container.innerHTML = cardsHtml;
	} catch (erro) {
		container.innerHTML = '<p class="ms-3">Erro ao conectar com a API. Verifique se o servidor esta rodando.</p>';
	}
}

async function adicionarAoCarrinho(produtoId) {
	const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');
	if (!usuario) {
		alert('Faça login para adicionar produtos ao carrinho.');
		window.location.href = 'Login.html';
		return;
	}

	try {
		const resposta = await fetch(`${API_URL}/carrinho`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ usuario_id: usuario.id, produto_id: produtoId })
		});

		if (resposta.ok) {
			alert('Produto adicionado ao carrinho!');
			atualizarBadgeCarrinho();
		} else {
			const dados = await resposta.json();
			alert(dados.erro || 'Erro ao adicionar ao carrinho.');
		}
	} catch (e) {
		alert('Erro ao conectar com o servidor.');
	}
}

async function atualizarBadgeCarrinho() {
	const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');
	const badge = document.getElementById('cart-badge');
	if (!usuario || !badge) return;

	try {
		const resposta = await fetch(`${API_URL}/carrinho/${usuario.id}`);
		if (resposta.ok) {
			const itens = await resposta.json();
			const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);
			if (totalItens > 0) {
				badge.textContent = totalItens;
				badge.style.display = 'inline';
			} else {
				badge.style.display = 'none';
			}
		}
	} catch (e) {
		// silently fail
	}
}

document.addEventListener('DOMContentLoaded', () => {
	renderizarProdutos();
	atualizarBadgeCarrinho();
});
window.addEventListener('pageshow', () => {
	renderizarProdutos();
	atualizarBadgeCarrinho();
});
