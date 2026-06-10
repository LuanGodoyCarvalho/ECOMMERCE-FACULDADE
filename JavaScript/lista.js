const API_URL = 'http://localhost:5000';

async function renderizarProdutos() {
	const container = document.getElementById('card-produto');
	if (!container) return;

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

			return `
			<div class="card m-2" style="width: 18rem;">
				${imagemHtml}
				<div class="card-body">
					<h5 class="card-title">${produto.nome}</h5>
					<p class="card-text">Preco: R$ ${Number(produto.preco).toFixed(2)}</p>
				</div>
			</div>
		`;
		}).join('');

		container.innerHTML = cardsHtml;
	} catch (erro) {
		container.innerHTML = '<p class="ms-3">Erro ao conectar com a API. Verifique se o servidor esta rodando.</p>';
	}
}

document.addEventListener('DOMContentLoaded', renderizarProdutos);
window.addEventListener('pageshow', renderizarProdutos);
