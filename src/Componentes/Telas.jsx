import { useEffect, useState } from "react";
import "./Telas.css";

const SENHA_ADMIN = "C@nt1nho";

const produtosIniciais = [
  {
    id: 1,
    nome: "Rei Davi",
    preco: 10,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/rei davi.jpeg",
    descricao: "Pão brioche, carne artesanal, queijo, alface e tomate.",
  },
  {
    id: 2,
    nome: "Elias",
    preco: 11,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/Elias.jpeg",
    descricao: "Hambúrguer artesanal preparado com ingredientes frescos.",
  },
  {
    id: 3,
    nome: "Salomão",
    preco: 12,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/salomão.jpeg",
    descricao: "Hambúrguer especial preparado com ingredientes selecionados.",
  },
  {
    id: 4,
    nome: "Rei Saul",
    preco: 13,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/rei saul.jpeg",
    descricao: "Hambúrguer especial com ingredientes frescos e saborosos.",
  },
  {
    id: 5,
    nome: "Hot Dog Maná Simples",
    preco: 14,
    categoria: "Hot Dogs",
    imagem: "/Imagens/mana.png",
    descricao: "Hot dog Maná simples com ingredientes frescos e saborosos.",
  },
  {
    id: 6,
    nome: "Hot Dog Maná Completo",
    preco: 15,
    categoria: "Hot Dogs",
    imagem: "/Imagens/manap.png",
    descricao: "Hot dog Maná completo com ingredientes frescos e saborosos.",
  },
  {
    id: 7,
    nome: "Coxinha de Frango",
    preco: 10,
    categoria: "Coxinhas",
    imagem: "/Imagens/coxinha.png",
    descricao: "Coxinha de frango crocante e recheada.",
  },
  {
    id: 8,
    nome: "Batata Camelo",
    preco: 10,
    categoria: "Batatas",
    imagem: "/Imagens/batata camelo.png",
    descricao: "Batata crocante preparada com ingredientes selecionados.",
  },
  {
    id: 9,
    nome: "Batata Jericó",
    preco: 10,
    categoria: "Batatas",
    imagem: "/Imagens/batata jericó.png",
    descricao: "Batata crocante e saborosa para acompanhar seu pedido.",
  },
  {
    id: 10,
    nome: "Prato da Provisão",
    preco: 15,
    categoria: "Combos",
    imagem: "/Imagens/prato provisão.png",
    descricao: "Uma combinação especial preparada com muito carinho.",
  },
];

const categoriasIniciais = [
  "Coxinhas",
  "Batatas",
  "Hot Dogs",
  "Hambúrgueres",
  "Combos",
  "Promoções",
];

function Tela() {
  const [secao, setSecao] = useState("inicio");

  const [produtos, setProdutos] = useState(() => {
    const salvos = localStorage.getItem("cantinho_produtos");
    return salvos ? JSON.parse(salvos) : produtosIniciais;
  });

  const [categorias, setCategorias] = useState(() => {
    const salvas = localStorage.getItem("cantinho_categorias");
    return salvas ? JSON.parse(salvas) : categoriasIniciais;
  });

  const [avisos, setAvisos] = useState(() => {
    const salvos = localStorage.getItem("cantinho_avisos");
    return salvos ? JSON.parse(salvos) : [];
  });

  const [carrinho, setCarrinho] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);

  const [mostrarAdicionado, setMostrarAdicionado] = useState(false);
  const [ultimoProduto, setUltimoProduto] = useState(null);

  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  const [senha, setSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");

  const [novoAviso, setNovoAviso] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    preco: "",
    categoria: "",
    imagem: "",
    descricao: "",
  });

  const [produtoEditando, setProdutoEditando] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      "cantinho_produtos",
      JSON.stringify(produtos)
    );
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem(
      "cantinho_categorias",
      JSON.stringify(categorias)
    );
  }, [categorias]);

  useEffect(() => {
    localStorage.setItem(
      "cantinho_avisos",
      JSON.stringify(avisos)
    );
  }, [avisos]);

  const categoriasMenu = ["Todos", ...categorias];

  const produtosFiltrados =
    categoriaAtiva === "Todos"
      ? produtos
      : produtos.filter(
          (produto) => produto.categoria === categoriaAtiva
        );

  const quantidadeCarrinho = carrinho.reduce(
    (total, produto) => total + produto.quantidade,
    0
  );

  const totalCarrinho = carrinho.reduce(
    (total, produto) =>
      total + produto.preco * produto.quantidade,
    0
  );

  function fazerLogin() {
    if (senha === SENHA_ADMIN) {
      setMostrarLogin(false);
      setMostrarAdmin(true);
      setSenha("");
      setErroSenha("");
      setSecao("admin");
    } else {
      setErroSenha("Código de acesso incorreto.");
    }
  }

  function sairAdmin() {
    setMostrarAdmin(false);
    setSecao("inicio");
  }

  function adicionarAoCarrinho(produto) {
    setCarrinho((atual) => {
      const encontrado = atual.find(
        (item) => item.id === produto.id
      );

      if (encontrado) {
        return atual.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
              }
            : item
        );
      }

      return [
        ...atual,
        {
          ...produto,
          quantidade: 1,
        },
      ];
    });

    setProdutoSelecionado(null);
    setUltimoProduto(produto);
    setMostrarAdicionado(true);
  }

  useEffect(() => {
    if (!mostrarAdicionado) return;

    const temporizador = setTimeout(() => {
      setMostrarAdicionado(false);
    }, 1800);

    return () => clearTimeout(temporizador);
  }, [mostrarAdicionado]);

  function aumentar(id) {
    setCarrinho((atual) =>
      atual.map((item) =>
        item.id === id
          ? {
              ...item,
              quantidade: item.quantidade + 1,
            }
          : item
      )
    );
  }

  function diminuir(id) {
    setCarrinho((atual) =>
      atual
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item
        )
        .filter((item) => item.quantidade > 0)
    );
  }

  function abrirWhatsApp() {
    if (carrinho.length === 0) return;

    let mensagem =
      "Olá! Gostaria de fazer um pedido no Cantinho do Maná:%0A%0A";

    carrinho.forEach((item) => {
      mensagem += `${item.quantidade}x ${item.nome} - R$ ${(
        item.preco * item.quantidade
      )
        .toFixed(2)
        .replace(".", ",")}%0A`;
    });

    mensagem += `%0ATotal: R$ ${totalCarrinho
      .toFixed(2)
      .replace(".", ",")}`;

    window.open(
      `https://wa.me/5581992081650?text=${mensagem}`,
      "_blank"
    );
  }

  function adicionarAviso() {
    if (!novoAviso.trim()) return;

    const aviso = {
      id: Date.now(),
      texto: novoAviso.trim(),
    };

    setAvisos((atual) => [aviso, ...atual]);
    setNovoAviso("");
  }

  function removerAviso(id) {
    setAvisos((atual) =>
      atual.filter((aviso) => aviso.id !== id)
    );
  }

  function adicionarCategoria() {
    const nome = novaCategoria.trim();

    if (!nome) return;

    const existe = categorias.some(
      (categoria) =>
        categoria.toLowerCase() === nome.toLowerCase()
    );

    if (existe) return;

    setCategorias((atual) => [...atual, nome]);
    setNovaCategoria("");
  }

  function removerCategoria(categoria) {
    const usada = produtos.some(
      (produto) => produto.categoria === categoria
    );

    if (usada) {
      alert(
        "Essa categoria possui produtos. Altere os produtos antes de removê-la."
      );
      return;
    }

    setCategorias((atual) =>
      atual.filter((item) => item !== categoria)
    );
  }

  function adicionarProduto() {
    if (
      !novoProduto.nome.trim() ||
      !novoProduto.preco ||
      !novoProduto.categoria ||
      !novoProduto.imagem.trim()
    ) {
      alert(
        "Preencha nome, preço, categoria e imagem do produto."
      );
      return;
    }

    const produto = {
      id: Date.now(),
      nome: novoProduto.nome.trim(),
      preco: Number(novoProduto.preco),
      categoria: novoProduto.categoria,
      imagem: novoProduto.imagem.trim(),
      descricao:
        novoProduto.descricao.trim() ||
        "Produto preparado com carinho pelo Cantinho do Maná.",
    };

    setProdutos((atual) => [...atual, produto]);

    setNovoProduto({
      nome: "",
      preco: "",
      categoria: "",
      imagem: "",
      descricao: "",
    });
  }

  function iniciarEdicao(produto) {
    setProdutoEditando({
      ...produto,
      preco: String(produto.preco),
    });
  }

  function cancelarEdicao() {
    setProdutoEditando(null);
  }

  function salvarEdicao() {
    if (
      !produtoEditando.nome.trim() ||
      !produtoEditando.preco ||
      !produtoEditando.categoria ||
      !produtoEditando.imagem.trim()
    ) {
      alert(
        "Preencha nome, preço, categoria e imagem do produto."
      );
      return;
    }

    setProdutos((atual) =>
      atual.map((produto) =>
        produto.id === produtoEditando.id
          ? {
              ...produtoEditando,
              nome: produtoEditando.nome.trim(),
              preco: Number(produtoEditando.preco),
              categoria: produtoEditando.categoria,
              imagem: produtoEditando.imagem.trim(),
              descricao:
                produtoEditando.descricao?.trim() ||
                "Produto preparado com carinho pelo Cantinho do Maná.",
            }
          : produto
      )
    );

    setProdutoEditando(null);
  }

  function removerProduto(id) {
    const confirmar = window.confirm(
      "Deseja realmente remover este produto?"
    );

    if (!confirmar) return;

    setProdutos((atual) =>
      atual.filter((produto) => produto.id !== id)
    );
  }

  return (
    <div className="app">

      <header className="header">
        <div className="header-conteudo">

          <button
            className="marca"
            onClick={() => setSecao("inicio")}
          >
            <img
              src="/Imagens/logo.jpeg"
              alt="Cantinho do Maná"
            />
          </button>

          <nav className="menu-principal">

            <button onClick={() => setSecao("inicio")}>
              Início
            </button>

            <button onClick={() => setSecao("produtos")}>
              Cardápio
            </button>

            <button onClick={() => setSecao("sobre")}>
              Saiba mais
            </button>

            <button onClick={() => setSecao("contato")}>
              Contato
            </button>

          </nav>

          <div className="acoes-header">

            <button
              className="botao-admin"
              onClick={() => setMostrarLogin(true)}
            >
              Administrador
            </button>

            <button
              className="botao-carrinho"
              onClick={() => setMostrarCarrinho(true)}
            >
              Carrinho
              <b>{quantidadeCarrinho}</b>
            </button>

          </div>

        </div>
      </header>

      {avisos.length > 0 && secao !== "admin" && (
        <section className="barra-aviso">

          <div className="aviso-conteudo">

            <span>AVISO</span>

            <div>
              {avisos[0].texto}
            </div>

          </div>

        </section>
      )}

      {secao === "inicio" && (
        <main className="inicio">

          <section className="hero">

            <div className="hero-conteudo">

              <span className="tag">
                SABOR DE CASA
              </span>

              <h1>
                Bem-vindo ao
                <br />
                <strong>Cantinho do Maná</strong>
              </h1>

              <p>
                Comida caseira feita com carinho,
                ingredientes selecionados e aquele
                sabor que faz você querer voltar.
              </p>

              <button
                className="botao-principal"
                onClick={() => setSecao("produtos")}
              >
                Ver nosso cardápio
              </button>

            </div>

            <div className="hero-detalhe">
              <div className="hero-circulo"></div>

              <div className="hero-texto">
                <span>Comida</span>
                <strong>UNGIDA</strong>
              </div>
            </div>

          </section>

        </main>
      )}

      {secao === "produtos" && (
        <main className="cardapio">

          <div className="titulo-secao">

            <span>MENU</span>

            <h1>
              Nosso cardápio
            </h1>

            <p>
              Escolha seu favorito e adicione ao carrinho.
            </p>

          </div>

          <div className="categorias">

            {categoriasMenu.map((categoria) => (
              <button
                key={categoria}
                className={
                  categoriaAtiva === categoria
                    ? "categoria-ativa"
                    : ""
                }
                onClick={() =>
                  setCategoriaAtiva(categoria)
                }
              >
                {categoria}
              </button>
            ))}

          </div>

          <section className="lista-produtos">

            {produtosFiltrados.map((produto) => (
              <article
                className="produto"
                key={produto.id}
              >

                <div
                  className="produto-imagem"
                  onClick={() =>
                    setProdutoSelecionado(produto)
                  }
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                  />
                </div>

                <div className="produto-info">

                  <span className="produto-categoria">
                    {produto.categoria}
                  </span>

                  <h2>{produto.nome}</h2>

                  <p>
                    {produto.descricao}
                  </p>

                  <div className="produto-final">

                    <strong>
                      R$ {Number(produto.preco)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>

                    <button
                      className="adicionar"
                      onClick={() =>
                        adicionarAoCarrinho(produto)
                      }
                    >
                      Adicionar
                    </button>

                  </div>

                </div>

              </article>
            ))}

          </section>

        </main>
      )}

      {secao === "admin" && mostrarAdmin && (
        <main className="admin">

          <div className="admin-cabecalho">

            <div>

              <span>PAINEL RESTRITO</span>

              <h1>Administração</h1>

              <p>
                Gerencie o conteúdo do Cantinho do Maná.
              </p>

            </div>

            <button
              className="sair-admin"
              onClick={sairAdmin}
            >
              Sair
            </button>

          </div>

          <section className="admin-grid">

            <div className="admin-card">

              <span>AVISOS E PROMOÇÕES</span>

              <h2>
                Publicar aviso
              </h2>

              <p>
                O aviso aparecerá no topo do site para os clientes.
              </p>

              <textarea
                value={novoAviso}
                onChange={(e) =>
                  setNovoAviso(e.target.value)
                }
                placeholder="Ex.: Promoção de sexta: combo especial por R$ 20,00."
              />

              <button
                className="admin-principal"
                onClick={adicionarAviso}
              >
                Publicar aviso
              </button>

              <div className="lista-admin">

                {avisos.map((aviso) => (
                  <div
                    className="admin-item"
                    key={aviso.id}
                  >

                    <p>{aviso.texto}</p>

                    <button
                      onClick={() =>
                        removerAviso(aviso.id)
                      }
                    >
                      Excluir
                    </button>

                  </div>
                ))}

              </div>

            </div>

            <div className="admin-card">

              <span>CATEGORIAS</span>

              <h2>
                Gerenciar categorias
              </h2>

              <div className="campo-duplo">

                <input
                  value={novaCategoria}
                  onChange={(e) =>
                    setNovaCategoria(e.target.value)
                  }
                  placeholder="Nova categoria"
                />

                <button
                  onClick={adicionarCategoria}
                >
                  Adicionar
                </button>

              </div>

              <div className="lista-categorias-admin">

                {categorias.map((categoria) => (
                  <div key={categoria}>

                    <span>{categoria}</span>

                    <button
                      onClick={() =>
                        removerCategoria(categoria)
                      }
                    >
                      Remover
                    </button>

                  </div>
                ))}

              </div>

            </div>

          </section>

          <section className="admin-card produto-admin">

            <span>CATÁLOGO</span>

            <h2>
              {produtoEditando
                ? "Editar produto"
                : "Adicionar produto"}
            </h2>

            <div className="form-produto">

              <input
                value={
                  produtoEditando
                    ? produtoEditando.nome
                    : novoProduto.nome
                }
                onChange={(e) => {

                  if (produtoEditando) {
                    setProdutoEditando({
                      ...produtoEditando,
                      nome: e.target.value,
                    });
                  } else {
                    setNovoProduto({
                      ...novoProduto,
                      nome: e.target.value,
                    });
                  }

                }}
                placeholder="Nome do produto"
              />

              <input
                type="number"
                value={
                  produtoEditando
                    ? produtoEditando.preco
                    : novoProduto.preco
                }
                onChange={(e) => {

                  if (produtoEditando) {
                    setProdutoEditando({
                      ...produtoEditando,
                      preco: e.target.value,
                    });
                  } else {
                    setNovoProduto({
                      ...novoProduto,
                      preco: e.target.value,
                    });
                  }

                }}
                placeholder="Preço"
              />

              <select
                value={
                  produtoEditando
                    ? produtoEditando.categoria
                    : novoProduto.categoria
                }
                onChange={(e) => {

                  if (produtoEditando) {
                    setProdutoEditando({
                      ...produtoEditando,
                      categoria: e.target.value,
                    });
                  } else {
                    setNovoProduto({
                      ...novoProduto,
                      categoria: e.target.value,
                    });
                  }

                }}
              >

                <option value="">
                  Escolha uma categoria
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria}
                    value={categoria}
                  >
                    {categoria}
                  </option>
                ))}

              </select>

              <input
                value={
                  produtoEditando
                    ? produtoEditando.imagem
                    : novoProduto.imagem
                }
                onChange={(e) => {

                  if (produtoEditando) {
                    setProdutoEditando({
                      ...produtoEditando,
                      imagem: e.target.value,
                    });
                  } else {
                    setNovoProduto({
                      ...novoProduto,
                      imagem: e.target.value,
                    });
                  }

                }}
                placeholder="Caminho da imagem. Ex.: /Imagens/produto.png"
              />

              <textarea
                value={
                  produtoEditando
                    ? produtoEditando.descricao
                    : novoProduto.descricao
                }
                onChange={(e) => {

                  if (produtoEditando) {
                    setProdutoEditando({
                      ...produtoEditando,
                      descricao: e.target.value,
                    });
                  } else {
                    setNovoProduto({
                      ...novoProduto,
                      descricao: e.target.value,
                    });
                  }

                }}
                placeholder="Descrição do produto"
              />

              {produtoEditando ? (
                <div className="botoes-edicao">

                  <button
                    className="admin-principal"
                    onClick={salvarEdicao}
                  >
                    Salvar alterações
                  </button>

                  <button
                    className="cancelar-edicao"
                    onClick={cancelarEdicao}
                  >
                    Cancelar
                  </button>

                </div>
              ) : (
                <button
                  className="admin-principal"
                  onClick={adicionarProduto}
                >
                  Adicionar produto
                </button>
              )}

            </div>

          </section>

          <section className="admin-card">

            <span>PRODUTOS ATUAIS</span>

            <h2>
              Gerenciar produtos
            </h2>

            <div className="produtos-admin">

              {produtos.map((produto) => (
                <div
                  className="produto-admin-item"
                  key={produto.id}
                >

                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                  />

                  <div>

                    <strong>
                      {produto.nome}
                    </strong>

                    <span>
                      {produto.categoria}
                    </span>

                    <small>
                      R$ {Number(produto.preco)
                        .toFixed(2)
                        .replace(".", ",")}
                    </small>

                  </div>

                  <div className="acoes-produto-admin">

                    <button
                      className="editar-produto"
                      onClick={() =>
                        iniciarEdicao(produto)
                      }
                    >
                      Editar
                    </button>

                    <button
                      onClick={() =>
                        removerProduto(produto.id)
                      }
                    >
                      Excluir
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </section>

        </main>
      )}

      {secao === "sobre" && (
        <main className="pagina">

          <div className="titulo-secao">

            <span>SAIBA MAIS</span>

            <h1>
              Sobre o Cantinho
            </h1>

          </div>

          <div className="sobre-box">

            <h2>
              Mais que comida,
              <br />
              um cantinho especial.
            </h2>

            <p>
              Somos uma empresa com foco na satisfação do cliente,
              através do fornecimento de alimentos de qualidade a
              preços justos, visando o crescimento sustentável num
              processo contínuo de aperfeiçoamento, para que possamos
              sempre exceder a expectativa de todos que servimos.
            </p>

          </div>

        </main>
      )}

      {secao === "contato" && (
        <main className="pagina">

          <div className="titulo-secao">

            <span>FALE CONOSCO</span>

            <h1>
              Contato
            </h1>

          </div>

          <div className="contato-box">

            <span>WHATSAPP</span>

            <h2>
              (81) 99208-1650
            </h2>

            <p>
              Entre em contato conosco para tirar
              dúvidas ou fazer seu pedido.
            </p>

            <button
              className="whatsapp"
              onClick={() =>
                window.open(
                  "https://wa.me/5581992081650",
                  "_blank"
                )
              }
            >
              Conversar no WhatsApp
            </button>

          </div>

        </main>
      )}

      {produtoSelecionado && (
        <div
          className="overlay"
          onClick={() =>
            setProdutoSelecionado(null)
          }
        >

          <div
            className="modal-produto"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="fechar"
              onClick={() =>
                setProdutoSelecionado(null)
              }
            >
              ×
            </button>

            <div className="modal-imagem">

              <img
                src={produtoSelecionado.imagem}
                alt={produtoSelecionado.nome}
              />

            </div>

            <span className="produto-categoria">
              {produtoSelecionado.categoria}
            </span>

            <h2>
              {produtoSelecionado.nome}
            </h2>

            <p>
              {produtoSelecionado.descricao}
            </p>

            <strong className="modal-preco">
              R$ {Number(produtoSelecionado.preco)
                .toFixed(2)
                .replace(".", ",")}
            </strong>

            <button
              className="botao-modal"
              onClick={() =>
                adicionarAoCarrinho(
                  produtoSelecionado
                )
              }
            >
              Adicionar ao carrinho
            </button>

          </div>

        </div>
      )}

      {mostrarAdicionado && (
        <div
          className="overlay popup-overlay"
          onClick={() =>
            setMostrarAdicionado(false)
          }
        >

          <div
            className="popup-adicionado"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="check">
              ✓
            </div>

            <h2>
              Adicionado ao carrinho
            </h2>

            <p>
              {ultimoProduto?.nome} foi adicionado
              ao seu pedido.
            </p>

          </div>

        </div>
      )}

      {mostrarCarrinho && (
        <div
          className="overlay"
          onClick={() =>
            setMostrarCarrinho(false)
          }
        >

          <aside
            className="carrinho"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="carrinho-topo">

              <div>

                <span>SEU PEDIDO</span>

                <h2>
                  Carrinho
                </h2>

              </div>

              <button
                className="fechar"
                onClick={() =>
                  setMostrarCarrinho(false)
                }
              >
                ×
              </button>

            </div>

            {carrinho.length === 0 ? (

              <div className="carrinho-vazio">

                <h3>
                  Seu carrinho está vazio
                </h3>

                <p>
                  Adicione alguns produtos
                  deliciosos ao seu pedido.
                </p>

                <button
                  onClick={() => {
                    setMostrarCarrinho(false);
                    setSecao("produtos");
                  }}
                >
                  Ver cardápio
                </button>

              </div>

            ) : (

              <>

                <div className="itens">

                  {carrinho.map((item) => (

                    <div
                      className="item"
                      key={item.id}
                    >

                      <div className="item-imagem">

                        <img
                          src={item.imagem}
                          alt={item.nome}
                        />

                      </div>

                      <div className="item-dados">

                        <h3>
                          {item.nome}
                        </h3>

                        <strong>
                          R$ {Number(item.preco)
                            .toFixed(2)
                            .replace(".", ",")}
                        </strong>

                        <div className="quantidade">

                          <button
                            onClick={() =>
                              diminuir(item.id)
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantidade}
                          </span>

                          <button
                            onClick={() =>
                              aumentar(item.id)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

                <div className="carrinho-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    R$ {totalCarrinho
                      .toFixed(2)
                      .replace(".", ",")}
                  </strong>

                </div>

                <button
                  className="finalizar"
                  onClick={abrirWhatsApp}
                >
                  Finalizar pelo WhatsApp
                </button>

              </>

            )}

          </aside>

        </div>
      )}

      {mostrarLogin && (
        <div
          className="overlay"
          onClick={() =>
            setMostrarLogin(false)
          }
        >

          <div
            className="login-admin"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="fechar"
              onClick={() =>
                setMostrarLogin(false)
              }
            >
              ×
            </button>

            <span>
              ÁREA RESTRITA
            </span>

            <h2>
              Administrador
            </h2>

            <p>
              Digite o código de acesso para
              gerenciar o cardápio.
            </p>

            <input
              type="password"
              value={senha}
              onChange={(e) =>
                setSenha(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fazerLogin();
                }
              }}
              placeholder="Código de acesso"
            />

            {erroSenha && (
              <small className="erro-senha">
                {erroSenha}
              </small>
            )}

            <button
              className="admin-principal"
              onClick={fazerLogin}
            >
              Entrar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Tela;