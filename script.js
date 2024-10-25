

const listaCategorias = [
    {nome: "Lazer", tipo: "despesa"},
    {nome: "Alimentação", tipo: "despesa"},
    {nome: "Estudos", tipo: "despesa"},
    {nome: "Pessoais", tipo: "despesa"},
    {nome: "Saúde", tipo: "despesa"},
    {nome: "Pet", tipo: "despesa"},
    {nome: "Família", tipo: "despesa"},
    {nome: "Outros", tipo: "despesa"},
    {nome: "Salário", tipo: "receita"},
    {nome: "Bolsa", tipo: "receita"},
    {nome: "Mesada", tipo: "receita"},
    {nome: "Auxílio", tipo: "receita"}
];

const carregarCategoriasNaDOM = (categorias, seletor) => {
    const elementoDatalist = document.querySelector(seletor);
    elementoDatalist.innerHTML = categorias.map(c => `<option value="${c.nome}">`).join("");
};

const determinarTipoCategoria = (nomeCategoria, categorias) => {
    const categoriaEncontrada = categorias.find(c => c.nome.toLowerCase() === nomeCategoria.toLowerCase());
    return categoriaEncontrada ? categoriaEncontrada.tipo : null;
};

const transacoesNoLocalStorage = JSON.parse(localStorage.getItem('transacoes')) || [];
let listaTransacoes = [...transacoesNoLocalStorage];

const salvarTransacao = (transacao) => {
    listaTransacoes.push(transacao);
    atualizarLocalStorage();
};

const removerTransacaoPorId = (id) => {
    listaTransacoes = listaTransacoes.filter(t => t.id !== id);
    atualizarLocalStorage();
    atualizarTransacoesNaDOM();
    atualizarSaldoNaDOM();
};

const obterDadosFormulario = () => ({
    id: Math.round(Math.random() * 1000),
    nome: document.querySelector("#transaction-name").value,
    valor: parseFloat(document.querySelector("#amount").value),
    nomeCategoria: document.querySelector("#category").value
});

const criarObjetoTransacao = ({id, nome, valor, nomeCategoria}) => {
    const tipoCategoria = determinarTipoCategoria(nomeCategoria, listaCategorias);
    return {
        id,
        nome,
        valor,
        categoria: {
            nome: nomeCategoria,
            tipo: tipoCategoria
        }
    };
};

const adicionarTransacaoNaDOM = (transacao) => {
    const ulTransacoes = document.querySelector(".transactions");
    const classeTransacao = transacao.categoria.tipo === "receita" ? "plus" : "minus";
    const operador = transacao.categoria.tipo === "receita" ? "+" : "-";

    ulTransacoes.innerHTML += `
        <li class="${classeTransacao}" id="${transacao.id}">
            ${transacao.nome} <span>${operador}${converterValorParaMoeda(transacao.valor)}</span>
            <button class="delete-btn" onClick="removerTransacaoPorId(${transacao.id})">x</button>
        </li>`;
};

const atualizarTransacoesNaDOM = () => {
    const elementoTransacoes = document.querySelector("#transactions");
    elementoTransacoes.innerHTML = "";
    listaTransacoes.forEach(transacao => adicionarTransacaoNaDOM(transacao));
};

const calcularValoresDoSaldo = () => {
    const totalReceita = listaTransacoes
        .filter(t => t.categoria.tipo === "receita")
        .reduce((soma, t) => soma + t.valor, 0);

    const totalDespesa = listaTransacoes
        .filter(t => t.categoria.tipo === "despesa")
        .reduce((soma, t) => soma + t.valor, 0);

    return {
        total: totalReceita - totalDespesa,
        receita: totalReceita,
        despesa: totalDespesa
    };
};

const atualizarSaldoNaDOM = () => {
    const { total, receita, despesa } = calcularValoresDoSaldo();
    document.querySelector("#balance").textContent = converterValorParaMoeda(total);
    document.querySelector("#money-plus").textContent = converterValorParaMoeda(receita);
    document.querySelector("#money-minus").textContent = converterValorParaMoeda(despesa);
};

const atualizarLocalStorage = () => {
    localStorage.setItem('transacoes', JSON.stringify(listaTransacoes));
};

const limparCamposFormulario = () => {
    document.querySelector("#transaction-name").value = "";
    document.querySelector("#amount").value = "";
    document.querySelector("#category").value = "";
};

const converterValorParaMoeda = valor => `R$ ${valor.toFixed(2)}`;

const processarDadosFormulario = () => {
    const dadosFormulario = obterDadosFormulario();
    const novaTransacao = criarObjetoTransacao(dadosFormulario);
    salvarTransacao(novaTransacao);
    adicionarTransacaoNaDOM(novaTransacao);
    atualizarSaldoNaDOM();
    limparCamposFormulario();
};

const inicializarAplicacao = () => {
    carregarCategoriasNaDOM(listaCategorias, "#category-list");
    atualizarTransacoesNaDOM();
    atualizarSaldoNaDOM();
};

inicializarAplicacao();

document.querySelector(".btn").addEventListener("click", () => {
    processarDadosFormulario();
});