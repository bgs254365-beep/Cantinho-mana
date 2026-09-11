import { useEffect, useMemo, useState } from "react";
import "./Telas.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://cantinho-do-mana.onrender.com";

const PRODUTOS_INICIAIS = [
  {
    id: 1,
    nome: "Rei Davi",
    preco: 10,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/rei davi.jpeg",
    descricao:
      "Pão brioche, carne artesanal, queijo, alface e tomate.",
  },
  {
    id: 2,
    nome: "Elias",
    preco: 11,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/Elias.jpeg",
    descricao:
      "Hambúrguer artesanal preparado com ingredientes frescos.",
  },
  {
    id: 3,
    nome: "Salomão",
    preco: 12,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/salomão.jpeg",
    descricao:
      "Hambúrguer especial preparado com ingredientes selecionados.",
  },
  {
    id: 4,
    nome: "Rei Saul",
    preco: 13,
    categoria: "Hambúrgueres",
    imagem: "/Imagens/rei saul.jpeg",
    descricao:
      "Hambúrguer especial com ingredientes frescos e saborosos.",
  },
  {
    id: 5,
    nome: "Hot Dog Maná Simples",
    preco: 14,
    categoria: "Hot Dogs",
    imagem: "/Imagens/mana.png",
    descricao:
      "Hot dog Maná simples com ingredientes frescos e saborosos.",
  },
  {
    id: 6,
    nome: "Hot Dog Maná Completo",
    preco: 15,
    categoria: "Hot Dogs",
    imagem: "/Imagens/manap.png",
    descricao:
      "Hot dog Maná completo com ingredientes frescos e saborosos.",
  },
  {
    id: 7,
    nome: "Coxinha de Frango",
    preco: 10,
    categoria: "Coxinhas",
    imagem: "/Imagens/coxinha.png",
    descricao:
      "Coxinha de frango crocante e recheada.",
  },
  {
    id: 8,
    nome: "Batata Camelo",
    preco: 10,
    categoria: "Batatas",
    imagem: "/Imagens/batata camelo.png",
    descricao:
      "Batata crocante preparada com ingredientes selecionados.",
  },
  {
    id: 9,
    nome: "Batata Jericó",
    preco: 10,
    categoria: "Batatas",
    imagem: "/Imagens/batata jericó.png",
    descricao:
      "Batata crocante e saborosa para acompanhar seu pedido.",
  },
  {
    id: 10,
    nome: "Prato da Provisão",
    preco: 15,
    categoria: "Combos",
    imagem: "/Imagens/prato provisão.png",
    descricao:
      "Uma combinação especial preparada com muito carinho.",
  },
];

const CATEGORIAS_INICIAIS = [
  "Coxinhas",
  "Batatas",
  "Hot Dogs",
  "Hambúrgueres",
  "Combos",
  "Promoções",
];

const produtoVazio = {
  nome: "",
  preco: "",
  categoria: "",
  imagem: "",
  descricao: "",
};

function Tela() {
  const [secao, setSecao] = useState("inicio");

  const [produtos, setProdutos] = useState(
    PRODUTOS_INICIAIS
  );

  const [categorias, setCategorias] = useState(
    CATEGORIAS_INICIAIS
  );

  const [avisos, setAvisos] = useState([]);
  const [historico, setHistorico] = useState([]);

  const [carrinho, setCarrinho] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] =
    useState("Todos");

  const [produtoSelecionado, setProdutoSelecionado] =
    useState(null);

  const [menuAberto, setMenuAberto] =
    useState(false);

  const [mostrarCarrinho, setMostrarCarrinho] =
    useState(false);

  const [mostrarAdicionado, setMostrarAdicionado] =
    useState(false);

  const [ultimoProduto, setUltimoProduto] =
    useState(null);

  const [mostrarLoginAdmin, setMostrarLoginAdmin] =
    useState(false);

  const [senhaAdmin, setSenhaAdmin] =
    useState("");

  const [mostrarSenhaAdmin, setMostrarSenhaAdmin] =
    useState(false);

  const [erroAdmin, setErroAdmin] =
    useState("");

  const [adminToken, setAdminToken] = useState(
    localStorage.getItem(
      "cantinho_admin_token"
    ) || ""
  );

  const [novoAviso, setNovoAviso] =
    useState("");

  const [novaCategoria, setNovaCategoria] =
    useState("");

  const [novoProduto, setNovoProduto] =
    useState(produtoVazio);

  const [produtoEditando, setProdutoEditando] =
    useState(null);

  const categoriasMenu = useMemo(
    () => ["Todos", ...categorias],
    [categorias]
  );

  const produtosFiltrados = useMemo(() => {
    if (categoriaAtiva === "Todos") {
      return produtos;
    }

    return produtos.filter(
      (produto) =>
        produto.categoria === categoriaAtiva
    );
  }, [
    produtos,
    categoriaAtiva,
  ]);

  const quantidadeCarrinho =
    carrinho.reduce(
      (total, item) =>
        total + item.quantidade,
      0
    );

  const totalCarrinho =
    carrinho.reduce(
      (total, item) =>
        total +
        item.preco *
          item.quantidade,
      0
    );

  const formProduto =
    produtoEditando ||
    novoProduto;

  useEffect(() => {
    carregarPublicos();
  }, []);

  useEffect(() => {
    try {
      const pedidosSalvos =
        localStorage.getItem(
          "cantinho_historico_pedidos"
        );

      if (pedidosSalvos) {
        setHistorico(
          JSON.parse(pedidosSalvos)
        );
      }
    } catch {
      setHistorico([]);
    }
  }, []);

  useEffect(() => {
    if (!mostrarAdicionado) {
      return;
    }

    const timer =
      setTimeout(() => {
        setMostrarAdicionado(false);
      }, 1800);

    return () =>
      clearTimeout(timer);
  }, [
    mostrarAdicionado,
  ]);

  async function api(
    path,
    options = {},
    token = ""
  ) {
    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          ...options,

          headers: {
            ...(options.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),

            ...(options.headers || {}),
          },
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.erro ||
          data.error ||
          "Erro na API."
      );
    }

    return data;
  }

  function normalizarProduto(
    produto
  ) {
    return {
      ...produto,
      id:
        produto._id ||
        produto.id,

      preco: Number(
        produto.preco
      ),
    };
  }

  async function carregarPublicos() {
    try {
      const [
        produtosApi,
        categoriasApi,
        avisosApi,
      ] = await Promise.all([
        api("/produtos"),
        api("/categorias"),
        api("/avisos"),
      ]);

      if (
        Array.isArray(
          produtosApi
        ) &&
        produtosApi.length
      ) {
        setProdutos(
          produtosApi.map(
            normalizarProduto
          )
        );
      }

      if (
        Array.isArray(
          categoriasApi
        ) &&
        categoriasApi.length
      ) {
        setCategorias(
          categoriasApi.map(
            (categoria) =>
              typeof categoria ===
              "string"
                ? categoria
                : categoria.nome
          )
        );
      }

      if (
        Array.isArray(
          avisosApi
        )
      ) {
        setAvisos(
          avisosApi
        );
      }
    } catch {
      try {
        const produtosSalvos =
          localStorage.getItem(
            "cantinho_produtos"
          );

        const categoriasSalvas =
          localStorage.getItem(
            "cantinho_categorias"
          );

        const avisosSalvos =
          localStorage.getItem(
            "cantinho_avisos"
          );

        if (produtosSalvos) {
          setProdutos(
            JSON.parse(
              produtosSalvos
            )
          );
        }

        if (categoriasSalvas) {
          setCategorias(
            JSON.parse(
              categoriasSalvas
            )
          );
        }

        if (avisosSalvos) {
          setAvisos(
            JSON.parse(
              avisosSalvos
            )
          );
        }
      } catch {
        // Mantém dados iniciais.
      }
    }
  }

  function navegar(destino) {
    setSecao(destino);
    setMenuAberto(false);
    setMostrarCarrinho(false);
  }

  function adicionarAoCarrinho(
    produto
  ) {
    setCarrinho(
      (atual) => {
        const existente =
          atual.find(
            (item) =>
              item.id ===
              produto.id
          );

        if (existente) {
          return atual.map(
            (item) =>
              item.id ===
              produto.id
                ? {
                    ...item,
                    quantidade:
                      item.quantidade +
                      1,
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
      }
    );

    setUltimoProduto(
      produto
    );

    setProdutoSelecionado(
      null
    );

    setMostrarAdicionado(
      true
    );
  }

  function aumentar(id) {
    setCarrinho(
      (atual) =>
        atual.map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  quantidade:
                    item.quantidade +
                    1,
                }
              : item
        )
    );
  }

  function diminuir(id) {
    setCarrinho(
      (atual) =>
        atual
          .map(
            (item) =>
              item.id === id
                ? {
                    ...item,
                    quantidade:
                      item.quantidade -
                      1,
                  }
                : item
          )
          .filter(
            (item) =>
              item.quantidade > 0
          )
    );
  }

  function removerDoCarrinho(
    id
  ) {
    setCarrinho(
      (atual) =>
        atual.filter(
          (item) =>
            item.id !== id
        )
    );
  }

  async function loginAdmin() {
    if (!senhaAdmin.trim()) {
      setErroAdmin(
        "Digite o código de acesso."
      );
      return;
    }

    try {
      const data =
        await api(
          "/admin/login",
          {
            method: "POST",
            body: JSON.stringify({
              password:
                senhaAdmin,
            }),
          }
        );

      setAdminToken(
        data.token || ""
      );

      if (data.token) {
        localStorage.setItem(
          "cantinho_admin_token",
          data.token
        );
      }

      setSenhaAdmin("");
      setErroAdmin("");
      setMostrarLoginAdmin(
        false
      );
      setSecao("admin");
    } catch (error) {
      setErroAdmin(
        error.message ||
          "Não foi possível entrar."
      );
    }
  }

  function sairAdmin() {
    setAdminToken("");

    localStorage.removeItem(
      "cantinho_admin_token"
    );

    setSecao("inicio");
  }

  function salvarHistoricoLocal(pedidos) {
    setHistorico(pedidos);

    localStorage.setItem(
      "cantinho_historico_pedidos",
      JSON.stringify(pedidos)
    );
  }

  function finalizarWhatsApp() {
    if (!carrinho.length) {
      return;
    }

    const mensagem = [
      "Olá! Gostaria de fazer um pedido no Cantinho do Maná:",
      "",
      ...carrinho.map(
        (item) =>
          `${item.quantidade}x ${item.nome} - R$ ${(
            item.preco *
            item.quantidade
          )
            .toFixed(2)
            .replace(".", ",")}`
      ),
      "",
      `Total: R$ ${totalCarrinho
        .toFixed(2)
        .replace(".", ",")}`,
    ].join("\n");

    const pedido = {
      _id: String(Date.now()),
      total: Number(totalCarrinho),
      status: "enviado",
      createdAt: new Date().toISOString(),
      itens: carrinho.map((item) => ({
        produtoId: item.id,
        nome: item.nome,
        quantidade: Number(item.quantidade),
        preco: Number(item.preco),
      })),
    };

    try {
      const pedidosAtuais = JSON.parse(
        localStorage.getItem(
          "cantinho_historico_pedidos"
        ) || "[]"
      );

      salvarHistoricoLocal([
        pedido,
        ...pedidosAtuais,
      ]);
    } catch (error) {
      console.error(
        "Erro ao salvar histórico local:",
        error
      );
    }

    setCarrinho([]);
    setMostrarCarrinho(false);

    window.open(
      `https://wa.me/5581992081650?text=${encodeURIComponent(
        mensagem
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function excluirPedido(id) {
    const novoHistorico = historico.filter(
      (pedido) => pedido._id !== id
    );

    salvarHistoricoLocal(novoHistorico);
  }

  async function adicionarAviso() {
    const texto =
      novoAviso.trim();

    if (!texto) {
      return;
    }

    if (!adminToken) {
      alert(
        "Faça login como administrador."
      );
      return;
    }

    try {
      const novo =
        await api(
          "/avisos",
          {
            method: "POST",
            body:
              JSON.stringify({
                texto,
              }),
          },
          adminToken
        );

      setAvisos(
        (atual) => [
          novo,
          ...atual,
        ]
      );

      setNovoAviso("");
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível publicar o aviso."
      );
    }
  }

  async function removerAviso(
    id
  ) {
    if (!adminToken) {
      return;
    }

    try {
      await api(
        `/avisos/${id}`,
        {
          method: "DELETE",
        },
        adminToken
      );

      setAvisos(
        (atual) =>
          atual.filter(
            (aviso) =>
              (aviso._id ||
                aviso.id) !==
              id
          )
      );
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível excluir o aviso."
      );
    }
  }

  async function adicionarCategoria() {
    const nome =
      novaCategoria.trim();

    if (!nome) {
      return;
    }

    if (!adminToken) {
      alert(
        "Faça login como administrador."
      );
      return;
    }

    const existe =
      categorias.some(
        (categoria) =>
          categoria.toLowerCase() ===
          nome.toLowerCase()
      );

    if (existe) {
      alert(
        "Essa categoria já existe."
      );
      return;
    }

    try {
      const nova =
        await api(
          "/categorias",
          {
            method: "POST",
            body:
              JSON.stringify({
                nome,
              }),
          },
          adminToken
        );

      setCategorias(
        (atual) => [
          ...atual,
          nova.nome ||
            nome,
        ]
      );

      setNovaCategoria("");
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível adicionar a categoria."
      );
    }
  }

  async function removerCategoria(
    nome
  ) {
    if (!adminToken) {
      return;
    }

    const usada =
      produtos.some(
        (produto) =>
          produto.categoria ===
          nome
      );

    if (usada) {
      alert(
        "Essa categoria possui produtos. Altere os produtos antes de removê-la."
      );
      return;
    }

    try {
      const categoriasApi =
        await api(
          "/categorias"
        );

      const alvo =
        categoriasApi.find(
          (categoria) =>
            categoria.nome ===
            nome
        );

      if (!alvo) {
        return;
      }

      await api(
        `/categorias/${alvo.id}`,
        {
          method: "DELETE",
        },
        adminToken
      );

      setCategorias(
        (atual) =>
          atual.filter(
            (categoria) =>
              categoria !==
              nome
          )
      );

      if (
        categoriaAtiva ===
        nome
      ) {
        setCategoriaAtiva(
          "Todos"
        );
      }
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível remover a categoria."
      );
    }
  }

  function escolherImagem(
    event,
    editando = false
  ) {
    const arquivo =
      event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (
      !arquivo.type.startsWith(
        "image/"
      )
    ) {
      alert(
        "Escolha uma imagem válida."
      );
      return;
    }

    const leitor =
      new FileReader();

    leitor.onload = () => {
      const resultado =
        leitor.result;

      if (editando) {
        setProdutoEditando(
          (produto) => ({
            ...produto,
            imagem:
              resultado,
          })
        );
      } else {
        setNovoProduto(
          (produto) => ({
            ...produto,
            imagem:
              resultado,
          })
        );
      }
    };

    leitor.readAsDataURL(
      arquivo
    );
  }

  function atualizarFormProduto(
    campo,
    valor
  ) {
    if (produtoEditando) {
      setProdutoEditando(
        (atual) => ({
          ...atual,
          [campo]: valor,
        })
      );
    } else {
      setNovoProduto(
        (atual) => ({
          ...atual,
          [campo]: valor,
        })
      );
    }
  }

  function iniciarEdicao(
    produto
  ) {
    setProdutoEditando({
      ...produto,
      preco: String(
        produto.preco
      ),
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelarEdicao() {
    setProdutoEditando(
      null
    );

    setNovoProduto(
      produtoVazio
    );
  }

  async function salvarProduto(
    event
  ) {
    event.preventDefault();

    if (!adminToken) {
      alert(
        "Faça login como administrador."
      );
      return;
    }

    const produto =
      formProduto;

    if (
      !produto.nome?.trim() ||
      !produto.preco ||
      !produto.categoria ||
      !produto.imagem
    ) {
      alert(
        "Preencha nome, preço, categoria e escolha uma imagem."
      );
      return;
    }

    const dados = {
      nome:
        produto.nome.trim(),
      preco:
        Number(
          produto.preco
        ),
      categoria:
        produto.categoria,
      imagem:
        produto.imagem,
      descricao:
        produto.descricao?.trim() ||
        "Produto preparado com carinho pelo Cantinho do Maná.",
    };

    try {
      if (produtoEditando) {
        const id =
          produtoEditando._id ||
          produtoEditando.id;

        const salvo =
          await api(
            `/produtos/${id}`,
            {
              method: "PUT",
              body:
                JSON.stringify(
                  dados
                ),
            },
            adminToken
          );

        setProdutos(
          (atual) =>
            atual.map(
              (item) =>
                (item._id ||
                  item.id) ===
                id
                  ? normalizarProduto(
                      salvo
                    )
                  : item
            )
        );

        setProdutoEditando(
          null
        );
      } else {
        const salvo =
          await api(
            "/produtos",
            {
              method: "POST",
              body:
                JSON.stringify(
                  dados
                ),
            },
            adminToken
          );

        setProdutos(
          (atual) => [
            ...atual,
            normalizarProduto(
              salvo
            ),
          ]
        );

        setNovoProduto(
          produtoVazio
        );
      }
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível salvar o produto."
      );
    }
  }

  async function excluirProduto(
    id
  ) {
    if (!adminToken) {
      alert(
        "Faça login como administrador."
      );
      return;
    }

    const confirmar =
      window.confirm(
        "Deseja realmente remover este produto?"
      );

    if (!confirmar) {
      return;
    }

    try {
      await api(
        `/produtos/${id}`,
        {
          method: "DELETE",
        },
        adminToken
      );

      setProdutos(
        (atual) =>
          atual.filter(
            (produto) =>
              (produto._id ||
                produto.id) !==
              id
          )
      );

      setCarrinho(
        (atual) =>
          atual.filter(
            (item) =>
              item.id !== id
          )
      );
    } catch (error) {
      alert(
        error.message ||
          "Não foi possível excluir o produto."
      );
    }
  }

  return (
    <div className="app">

      <header className="header">

        <div className="header-conteudo">

          <button
            className="marca"
            onClick={() =>
              navegar("inicio")
            }
          >
            <img
              src="/Imagens/logo.jpeg"
              alt="Cantinho do Maná"
            />
          </button>

          <nav className="menu-principal">

            <button
              onClick={() =>
                navegar("inicio")
              }
            >
              Início
            </button>

            <button
              onClick={() =>
                navegar("produtos")
              }
            >
              Cardápio
            </button>

            <button
              onClick={() =>
                navegar("sobre")
              }
            >
              Saiba mais
            </button>

            <button
              onClick={() =>
                navegar("contato")
              }
            >
              Contato
            </button>

          </nav>

          <div className="acoes-header">

            <button
              className="botao-carrinho"
              onClick={() =>
                setMostrarCarrinho(
                  true
                )
              }
            >
              Carrinho
              <b>
                {quantidadeCarrinho}
              </b>
            </button>

            <button
              className="botao-menu"
              onClick={() =>
                setMenuAberto(
                  (valor) =>
                    !valor
                )
              }
              aria-label="Abrir menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

          </div>

        </div>

      </header>

      {menuAberto && (
        <div className="menu-lateral">

          <div className="menu-lateral-topo">

            <div>
              <span>MENU</span>
              <h2>
                Meu espaço
              </h2>
            </div>

            <button
              className="fechar-menu"
              onClick={() =>
                setMenuAberto(
                  false
                )
              }
            >
              ×
            </button>

          </div>

          <button
            onClick={() =>
              navegar("inicio")
            }
          >
            Início
          </button>

          <button
            onClick={() =>
              navegar("produtos")
            }
          >
            Cardápio
          </button>

          <button
            onClick={() =>
              navegar("sobre")
            }
          >
            Saiba mais
          </button>

          <button
            onClick={() =>
              navegar("contato")
            }
          >
            Contato
          </button>

          <div className="linha-menu"></div>

          <button
            onClick={() =>
              navegar("historico")
            }
          >
            Histórico de pedidos
          </button>

          <button
            onClick={() => {
              setMostrarLoginAdmin(
                true
              );
              setMenuAberto(
                false
              );
            }}
          >
            Login do administrador
          </button>

        </div>
      )}

      {avisos.length > 0 && (
        <section className="barra-aviso">

          <div className="aviso-conteudo">

            <span>AVISO</span>

            <div>
              {
                avisos[0].texto
              }
            </div>

          </div>

        </section>
      )}

      {secao === "inicio" && (
        <main className="inicio">

          <section className="hero">

            <div className="hero-conteudo">

              <span className="tag">
                sabor de casa
              </span>

              <h1>
                Bem-vindo ao
                <br />
                <strong>
                  Cantinho do Maná
                </strong>
              </h1>

              <p>
                Comida caseira feita
                com carinho,
                ingredientes
                selecionados e
                aquele sabor que
                faz você querer
                voltar.
              </p>

              <button
                className="botao-principal"
                onClick={() =>
                  navegar(
                    "produtos"
                  )
                }
              >
                Ver nosso cardápio
              </button>

            </div>

            <div className="hero-detalhe">

              <div className="hero-circulo"></div>

              <div className="hero-texto">

                <span>
                  Comida
                </span>

                <strong>
                  UNGIDA
                </strong>

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
              Escolha seu favorito
              e adicione ao
              carrinho.
            </p>

          </div>

          <div className="categorias">

            {categoriasMenu.map(
              (categoria) => (
                <button
                  key={categoria}
                  className={
                    categoriaAtiva ===
                    categoria
                      ? "categoria-ativa"
                      : ""
                  }
                  onClick={() =>
                    setCategoriaAtiva(
                      categoria
                    )
                  }
                >
                  {categoria}
                </button>
              )
            )}

          </div>

          <section className="lista-produtos">

            {produtosFiltrados.map(
              (produto) => (
                <article
                  className="produto"
                  key={
                    produto._id ||
                    produto.id
                  }
                >

                  <div
                    className="produto-imagem"
                    onClick={() =>
                      setProdutoSelecionado(
                        produto
                      )
                    }
                  >
                    <img
                      src={
                        produto.imagem
                      }
                      alt={
                        produto.nome
                      }
                    />
                  </div>

                  <div className="produto-info">

                    <span className="produto-categoria">
                      {
                        produto.categoria
                      }
                    </span>

                    <h2>
                      {produto.nome}
                    </h2>

                    <p>
                      {
                        produto.descricao
                      }
                    </p>

                    <div className="produto-final">

                      <strong>
                        R${" "}
                        {produto.preco
                          .toFixed(2)
                          .replace(
                            ".",
                            ","
                          )}
                      </strong>

                      <button
                        className="adicionar"
                        onClick={() =>
                          adicionarAoCarrinho(
                            produto
                          )
                        }
                      >
                        Adicionar
                      </button>

                    </div>

                  </div>

                </article>
              )
            )}

          </section>

        </main>
      )}

      {secao === "sobre" && (
        <main className="pagina">

          <div className="titulo-secao">

            <span>
              SAIBA MAIS
            </span>

            <h1>
              Sobre o Cantinho
            </h1>

          </div>

          <div className="sobre-box">

            <h2>
              Mais que comida,
              <br />
              um cantinho
              especial.
            </h2>

            <p>
              Somos uma empresa
              com foco na
              satisfação do
              cliente, através
              do fornecimento
              de alimentos de
              qualidade a preços
              justos, visando o
              crescimento
              sustentável num
              processo contínuo
              de aperfeiçoamento,
              para que possamos
              sempre exceder a
              expectativa de
              todos que servimos.
            </p>

          </div>

        </main>
      )}

      {secao === "contato" && (
        <main className="pagina">

          <div className="titulo-secao">

            <span>
              FALE CONOSCO
            </span>

            <h1>
              Contato
            </h1>

          </div>

          <div className="contato-box">

            <span>
              WHATSAPP
            </span>

            <h2>
              (81) 99208-1650
            </h2>

            <p>
              Entre em contato
              conosco para tirar
              dúvidas ou fazer
              seu pedido.
            </p>

            <button
              className="whatsapp"
              onClick={() =>
                window.open(
                  "https://wa.me/5581992081650",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              Conversar no WhatsApp
            </button>

          </div>

        </main>
      )}

      {secao === "historico" && (
        <main className="pagina">

          <div className="titulo-secao">
            <span>HISTÓRICO</span>

            <h1>
              Meus pedidos
            </h1>

            <p>
              Seus pedidos ficam salvos neste dispositivo.
            </p>
          </div>

          {historico.length === 0 ? (
            <div className="historico-vazio">
              <h2>
                Nenhum pedido registrado
              </h2>

              <p>
                Quando você enviar um pedido pelo WhatsApp,
                ele aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="historico-lista">
              {historico.map((pedido) => (
                <div
                  className="historico-card"
                  key={pedido._id}
                >
                  <div className="historico-topo">
                    <strong>
                      Pedido #{String(pedido._id).slice(-6)}
                    </strong>

                    <small>
                      {new Date(
                        pedido.createdAt
                      ).toLocaleString("pt-BR")}
                    </small>
                  </div>

                  {(pedido.itens || []).map(
                    (item, index) => (
                      <div
                        className="historico-linha"
                        key={index}
                      >
                        <span>
                          {item.quantidade}x {item.nome}
                        </span>

                        <strong>
                          R${" "}
                          {(Number(item.preco) * Number(item.quantidade))
                            .toFixed(2)
                            .replace(".", ",")}
                        </strong>
                      </div>
                    )
                  )}

                  <div className="historico-total">
                    <span>Total</span>

                    <strong>
                      R${" "}
                      {Number(pedido.total)
                        .toFixed(2)
                        .replace(".", ",")}
                    </strong>
                  </div>

                  <button
                    className="excluir-historico"
                    onClick={() =>
                      excluirPedido(pedido._id)
                    }
                  >
                    Excluir este pedido
                  </button>
                </div>
              ))}
            </div>
          )}

        </main>
      )}

      {secao === "admin" &&
        adminToken && (
          <main className="admin">

            <div className="admin-cabecalho">

              <div>

                <span>
                  PAINEL RESTRITO
                </span>

                <h1>
                  Administração
                </h1>

                <p>
                  Gerencie o
                  cardápio e os
                  avisos.
                </p>

              </div>

              <button
                className="sair-admin"
                onClick={
                  sairAdmin
                }
              >
                Sair
              </button>

            </div>

            <section className="admin-grid">

              <div className="admin-card">

                <span>
                  AVISOS
                </span>

                <h2>
                  Publicar aviso
                </h2>

                <textarea
                  value={
                    novoAviso
                  }
                  onChange={(
                    event
                  ) =>
                    setNovoAviso(
                      event.target
                        .value
                    )
                  }
                  placeholder="Digite o aviso ou promoção."
                />

                <button
                  className="admin-principal"
                  onClick={
                    adicionarAviso
                  }
                >
                  Publicar aviso
                </button>

                {avisos.map(
                  (aviso) => (
                    <div
                      className="admin-item"
                      key={
                        aviso._id ||
                        aviso.id
                      }
                    >

                      <p>
                        {
                          aviso.texto
                        }
                      </p>

                      <button
                        onClick={() =>
                          removerAviso(
                            aviso._id ||
                              aviso.id
                          )
                        }
                      >
                        Excluir
                      </button>

                    </div>
                  )
                )}

              </div>

              <div className="admin-card">

                <span>
                  CATEGORIAS
                </span>

                <h2>
                  Gerenciar
                  categorias
                </h2>

                <div className="campo-duplo">

                  <input
                    value={
                      novaCategoria
                    }
                    onChange={(
                      event
                    ) =>
                      setNovaCategoria(
                        event.target
                          .value
                      )
                    }
                    placeholder="Nova categoria"
                  />

                  <button
                    onClick={
                      adicionarCategoria
                    }
                  >
                    Adicionar
                  </button>

                </div>

                {categorias.map(
                  (categoria) => (
                    <div
                      className="categoria-admin"
                      key={categoria}
                    >

                      <span>
                        {categoria}
                      </span>

                      <button
                        onClick={() =>
                          removerCategoria(
                            categoria
                          )
                        }
                      >
                        Remover
                      </button>

                    </div>
                  )
                )}

              </div>

            </section>

            <section className="admin-card">

              <span>
                CATÁLOGO
              </span>

              <h2>
                {produtoEditando
                  ? "Editar produto"
                  : "Adicionar produto"}
              </h2>

              <form
                className="form-produto"
                onSubmit={
                  salvarProduto
                }
              >

                <input
                  value={
                    formProduto.nome
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarFormProduto(
                      "nome",
                      event.target
                        .value
                    )
                  }
                  placeholder="Nome do produto"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    formProduto.preco
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarFormProduto(
                      "preco",
                      event.target
                        .value
                    )
                  }
                  placeholder="Preço"
                />

                <select
                  value={
                    formProduto.categoria
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarFormProduto(
                      "categoria",
                      event.target
                        .value
                    )
                  }
                >

                  <option value="">
                    Escolha uma
                    categoria
                  </option>

                  {categorias.map(
                    (categoria) => (
                      <option
                        value={
                          categoria
                        }
                        key={
                          categoria
                        }
                      >
                        {categoria}
                      </option>
                    )
                  )}

                </select>

                <label className="campo-imagem">

                  <span>
                    Escolher foto
                    do produto
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(
                      event
                    ) =>
                      escolherImagem(
                        event,
                        Boolean(
                          produtoEditando
                        )
                      )
                    }
                  />

                </label>

                {formProduto.imagem && (
                  <div className="preview-imagem">

                    <img
                      src={
                        formProduto.imagem
                      }
                      alt="Prévia do produto"
                    />

                  </div>
                )}

                <textarea
                  value={
                    formProduto.descricao
                  }
                  onChange={(
                    event
                  ) =>
                    atualizarFormProduto(
                      "descricao",
                      event.target
                        .value
                    )
                  }
                  placeholder="Descrição do produto"
                />

                <div className="botoes-edicao">

                  <button
                    className="admin-principal"
                    type="submit"
                  >
                    {produtoEditando
                      ? "Salvar alterações"
                      : "Adicionar produto"}
                  </button>

                  {produtoEditando && (
                    <button
                      className="cancelar-edicao"
                      type="button"
                      onClick={
                        cancelarEdicao
                      }
                    >
                      Cancelar
                    </button>
                  )}

                </div>

              </form>

            </section>

            <section className="admin-card">

              <span>
                PRODUTOS ATUAIS
              </span>

              <h2>
                Gerenciar
                produtos
              </h2>

              <div className="produtos-admin">

                {produtos.map(
                  (produto) => (
                    <div
                      className="produto-admin-item"
                      key={
                        produto._id ||
                        produto.id
                      }
                    >

                      <img
                        src={
                          produto.imagem
                        }
                        alt={
                          produto.nome
                        }
                      />

                      <div>

                        <strong>
                          {
                            produto.nome
                          }
                        </strong>

                        <span>
                          {
                            produto.categoria
                          }
                        </span>

                        <small>
                          R${" "}
                          {Number(
                            produto.preco
                          )
                            .toFixed(2)
                            .replace(
                              ".",
                              ","
                            )}
                        </small>

                      </div>

                      <div className="acoes-produto-admin">

                        <button
                          onClick={() =>
                            iniciarEdicao(
                              produto
                            )
                          }
                        >
                          Editar
                        </button>

                        <button
                          onClick={() =>
                            excluirProduto(
                              produto._id ||
                                produto.id
                            )
                          }
                        >
                          Excluir
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

          </main>
        )}

      {produtoSelecionado && (
        <div
          className="overlay"
          onClick={() =>
            setProdutoSelecionado(
              null
            )
          }
        >

          <div
            className="modal-produto"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="fechar"
              onClick={() =>
                setProdutoSelecionado(
                  null
                )
              }
            >
              ×
            </button>

            <div className="modal-imagem">

              <img
                src={
                  produtoSelecionado.imagem
                }
                alt={
                  produtoSelecionado.nome
                }
              />

            </div>

            <span className="produto-categoria">
              {
                produtoSelecionado.categoria
              }
            </span>

            <h2>
              {
                produtoSelecionado.nome
              }
            </h2>

            <p>
              {
                produtoSelecionado.descricao
              }
            </p>

            <strong className="modal-preco">
              R${" "}
              {
                produtoSelecionado.preco
                  .toFixed(2)
                  .replace(
                    ".",
                    ","
                  )
              }
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
        <div className="overlay popup-overlay">

          <div className="popup-adicionado">

            <button
              className="fechar"
              onClick={() =>
                setMostrarAdicionado(
                  false
                )
              }
            >
              ×
            </button>

            <div className="check">
              ✓
            </div>

            <h2>
              Produto adicionado
            </h2>

            <p>
              {
                ultimoProduto?.nome
              } foi adicionado
              ao seu pedido.
            </p>

            <div className="popup-acoes">

              <button
                className="continuar"
                onClick={() =>
                  setMostrarAdicionado(
                    false
                  )
                }
              >
                Continuar
              </button>

              <button
                className="ver-carrinho"
                onClick={() => {
                  setMostrarAdicionado(
                    false
                  );
                  setMostrarCarrinho(
                    true
                  );
                }}
              >
                Ver carrinho
              </button>

            </div>

          </div>

        </div>
      )}

      {mostrarCarrinho && (
        <div
          className="overlay"
          onClick={() =>
            setMostrarCarrinho(
              false
            )
          }
        >

          <aside
            className="carrinho"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="carrinho-topo">

              <div>

                <span>
                  SEU PEDIDO
                </span>

                <h2>
                  Carrinho
                </h2>

              </div>

              <button
                className="fechar"
                onClick={() =>
                  setMostrarCarrinho(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            {carrinho.length ===
            0 ? (
              <div className="carrinho-vazio">

                <h3>
                  Seu carrinho
                  está vazio
                </h3>

                <p>
                  Adicione alguns
                  produtos ao seu
                  pedido.
                </p>

                <button
                  className="botao-ver-cardapio"
                  onClick={() => {
                    setMostrarCarrinho(
                      false
                    );
                    setSecao(
                      "produtos"
                    );
                  }}
                >
                  Ver cardápio
                </button>

              </div>
            ) : (
              <>
                <div className="itens">

                  {carrinho.map(
                    (item) => (
                      <div
                        className="item"
                        key={
                          item.id
                        }
                      >

                        <div className="item-imagem">

                          <img
                            src={
                              item.imagem
                            }
                            alt={
                              item.nome
                            }
                          />

                        </div>

                        <div className="item-dados">

                          <h3>
                            {
                              item.nome
                            }
                          </h3>

                          <strong>
                            R${" "}
                            {item.preco
                              .toFixed(2)
                              .replace(
                                ".",
                                ","
                              )}
                          </strong>

                          <div className="quantidade">

                            <button
                              onClick={() =>
                                diminuir(
                                  item.id
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantidade
                              }
                            </span>

                            <button
                              onClick={() =>
                                aumentar(
                                  item.id
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                          <button
                            className="remover-item"
                            onClick={() =>
                              removerDoCarrinho(
                                item.id
                              )
                            }
                          >
                            Remover
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>

                <div className="carrinho-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    R${" "}
                    {totalCarrinho
                      .toFixed(2)
                      .replace(
                        ".",
                        ","
                      )}
                  </strong>

                </div>

                <button
                  className="finalizar"
                  onClick={
                    finalizarWhatsApp
                  }
                >
                  Finalizar pelo
                  WhatsApp
                </button>

              </>
            )}

          </aside>

        </div>
      )}

      {mostrarLoginAdmin && (
        <div
          className="overlay"
          onClick={() =>
            setMostrarLoginAdmin(
              false
            )
          }
        >

          <div
            className="login-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="fechar"
              onClick={() =>
                setMostrarLoginAdmin(
                  false
                )
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

            <div className="campo-senha">

              <input
                type={
                  mostrarSenhaAdmin
                    ? "text"
                    : "password"
                }
                value={
                  senhaAdmin
                }
                onChange={(
                  event
                ) =>
                  setSenhaAdmin(
                    event.target
                      .value
                  )
                }
                onKeyDown={(
                  event
                ) => {
                  if (
                    event.key ===
                    "Enter"
                  ) {
                    loginAdmin();
                  }
                }}
                placeholder="Código de acesso"
              />

              <button
                type="button"
                className="botao-olho-senha"
                onClick={() =>
                  setMostrarSenhaAdmin(
                    (valor) =>
                      !valor
                  )
                }
              >
                {mostrarSenhaAdmin
                  ? "Ocultar"
                  : "Mostrar"}
              </button>

            </div>

            {erroAdmin && (
              <small className="erro-senha">
                {
                  erroAdmin
                }
              </small>
            )}

            <button
              className="admin-principal"
              onClick={
                loginAdmin
              }
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