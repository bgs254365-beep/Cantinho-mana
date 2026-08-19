import { useEffect, useMemo, useState } from "react";
import "./Telas.css";

const API_URL = "http://localhost:3001/api";

const PRODUTOS_INICIAIS = [
  { id: 1, nome: "Rei Davi", preco: 10, categoria: "Hambúrgueres", imagem: "/Imagens/rei davi.jpeg", descricao: "Pão brioche, carne artesanal, queijo, alface e tomate." },
  { id: 2, nome: "Elias", preco: 11, categoria: "Hambúrgueres", imagem: "/Imagens/Elias.jpeg", descricao: "Hambúrguer artesanal preparado com ingredientes frescos." },
  { id: 3, nome: "Salomão", preco: 12, categoria: "Hambúrgueres", imagem: "/Imagens/salomão.jpeg", descricao: "Hambúrguer especial preparado com ingredientes selecionados." },
  { id: 4, nome: "Rei Saul", preco: 13, categoria: "Hambúrgueres", imagem: "/Imagens/rei saul.jpeg", descricao: "Hambúrguer especial com ingredientes frescos e saborosos." },
  { id: 5, nome: "Hot Dog Maná Simples", preco: 14, categoria: "Hot Dogs", imagem: "/Imagens/mana.png", descricao: "Hot dog Maná simples com ingredientes frescos e saborosos." },
  { id: 6, nome: "Hot Dog Maná Completo", preco: 15, categoria: "Hot Dogs", imagem: "/Imagens/manap.png", descricao: "Hot dog Maná completo com ingredientes frescos e saborosos." },
  { id: 7, nome: "Coxinha de Frango", preco: 10, categoria: "Coxinhas", imagem: "/Imagens/coxinha.png", descricao: "Coxinha de frango crocante e recheada." },
  { id: 8, nome: "Batata Camelo", preco: 10, categoria: "Batatas", imagem: "/Imagens/batata camelo.png", descricao: "Batata crocante preparada com ingredientes selecionados." },
  { id: 9, nome: "Batata Jericó", preco: 10, categoria: "Batatas", imagem: "/Imagens/batata jericó.png", descricao: "Batata crocante e saborosa para acompanhar seu pedido." },
  { id: 10, nome: "Prato da Provisão", preco: 15, categoria: "Combos", imagem: "/Imagens/prato provisão.png", descricao: "Uma combinação especial preparada com muito carinho." },
];

const CATEGORIAS_INICIAIS = ["Coxinhas", "Batatas", "Hot Dogs", "Hambúrgueres", "Combos", "Promoções"];

const vazio = { nome: "", preco: "", categoria: "", imagem: "", descricao: "" };

function Tela() {
  const [secao, setSecao] = useState("inicio");
  const [produtos, setProdutos] = useState(PRODUTOS_INICIAIS);
  const [categorias, setCategorias] = useState(CATEGORIAS_INICIAIS);
  const [avisos, setAvisos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [mostrarAdicionado, setMostrarAdicionado] = useState(false);
  const [ultimoProduto, setUltimoProduto] = useState(null);

  const [adminToken, setAdminToken] = useState(localStorage.getItem("cantinho_admin_token") || "");
  const [clienteToken, setClienteToken] = useState(localStorage.getItem("cantinho_cliente_token") || "");
  const [cliente, setCliente] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cantinho_cliente") || "null"); } catch { return null; }
  });

  const [mostrarLoginAdmin, setMostrarLoginAdmin] = useState(false);
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [erroAdmin, setErroAdmin] = useState("");

  const [mostrarLoginCliente, setMostrarLoginCliente] = useState(false);
  const [modoCliente, setModoCliente] = useState("login");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteSenha, setClienteSenha] = useState("");
  const [erroCliente, setErroCliente] = useState("");

  const [novoAviso, setNovoAviso] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoProduto, setNovoProduto] = useState(vazio);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const categoriasMenu = useMemo(() => ["Todos", ...categorias], [categorias]);
  const produtosFiltrados = useMemo(() => categoriaAtiva === "Todos" ? produtos : produtos.filter(p => p.categoria === categoriaAtiva), [produtos, categoriaAtiva]);
  const quantidadeCarrinho = carrinho.reduce((s, p) => s + p.quantidade, 0);
  const totalCarrinho = carrinho.reduce((s, p) => s + p.preco * p.quantidade, 0);

  useEffect(() => { carregarPublicos(); }, []);
  useEffect(() => { if (clienteToken) carregarHistorico(); else setHistorico([]); }, [clienteToken]);
  useEffect(() => {
    if (!mostrarAdicionado) return;
    const timer = setTimeout(() => setMostrarAdicionado(false), 1800);
    return () => clearTimeout(timer);
  }, [mostrarAdicionado]);

  async function api(path, options = {}, token = "") {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erro na API.");
    return data;
  }

  function normalizarProduto(p) { return { ...p, id: p._id || p.id, preco: Number(p.preco) }; }

  async function carregarPublicos() {
    try {
      const [ps, cs, as] = await Promise.all([api("/produtos"), api("/categorias"), api("/avisos")]);
      if (ps.length) setProdutos(ps.map(normalizarProduto));
      if (cs.length) setCategorias(cs.map(c => c.nome));
      setAvisos(as);
    } catch {
      try {
        const ps = localStorage.getItem("cantinho_produtos");
        const cs = localStorage.getItem("cantinho_categorias");
        const as = localStorage.getItem("cantinho_avisos");
        if (ps) setProdutos(JSON.parse(ps));
        if (cs) setCategorias(JSON.parse(cs));
        if (as) setAvisos(JSON.parse(as));
      } catch {}
    }
  }

  async function carregarHistorico() {
    try { setHistorico(await api("/pedidos", {}, clienteToken)); } catch { setHistorico([]); }
  }

  function navegar(destino) { setSecao(destino); setMenuAberto(false); setMostrarCarrinho(false); }

  function adicionarAoCarrinho(produto) {
    setCarrinho(atual => {
      const encontrado = atual.find(i => i.id === produto.id);
      if (encontrado) return atual.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...atual, { ...produto, quantidade: 1 }];
    });
    setUltimoProduto(produto);
    setProdutoSelecionado(null);
    setMostrarAdicionado(true);
  }

  function aumentar(id) { setCarrinho(a => a.map(i => i.id === id ? { ...i, quantidade: i.quantidade + 1 } : i)); }
  function diminuir(id) { setCarrinho(a => a.map(i => i.id === id ? { ...i, quantidade: i.quantidade - 1 } : i).filter(i => i.quantidade > 0)); }
  function removerDoCarrinho(id) { setCarrinho(a => a.filter(i => i.id !== id)); }

  async function loginAdmin() {
    try {
      const data = await api("/admin/login", { method: "POST", body: JSON.stringify({ password: senhaAdmin }) });
      setAdminToken(data.token); localStorage.setItem("cantinho_admin_token", data.token);
      setSenhaAdmin(""); setErroAdmin(""); setMostrarLoginAdmin(false); setSecao("admin");
    } catch (e) { setErroAdmin(e.message); }
  }

  function sairAdmin() { setAdminToken(""); localStorage.removeItem("cantinho_admin_token"); setSecao("inicio"); }

  async function loginOuCadastroCliente() {
    try {
      const endpoint = modoCliente === "login" ? "/client/login" : "/client/register";
      const body = modoCliente === "login"
        ? { email: clienteEmail, password: clienteSenha }
        : { nome: clienteNome, email: clienteEmail, password: clienteSenha };
      const data = await api(endpoint, { method: "POST", body: JSON.stringify(body) });
      setClienteToken(data.token); localStorage.setItem("cantinho_cliente_token", data.token);
      setCliente(data.cliente); localStorage.setItem("cantinho_cliente", JSON.stringify(data.cliente));
      setClienteNome(""); setClienteEmail(""); setClienteSenha(""); setErroCliente(""); setMostrarLoginCliente(false);
      setSecao("historico");
    } catch (e) { setErroCliente(e.message); }
  }

  function sairCliente() { setCliente(null); setClienteToken(""); setHistorico([]); localStorage.removeItem("cantinho_cliente"); localStorage.removeItem("cantinho_cliente_token"); }

  async function finalizarWhatsApp() {
    if (!carrinho.length) return;
    if (!clienteToken) {
      setMostrarLoginCliente(true); setModoCliente("login"); setMostrarCarrinho(false); return;
    }
    try {
      const itens = carrinho.map(i => ({ produtoId: i.id, nome: i.nome, quantidade: i.quantidade, preco: i.preco }));
      await api("/pedidos", { method: "POST", body: JSON.stringify({ itens, total: totalCarrinho }) }, clienteToken);
      await carregarHistorico();
      const mensagem = ["Olá! Gostaria de fazer um pedido no Cantinho do Maná:", "", ...carrinho.map(i => `${i.quantidade}x ${i.nome} - R$ ${(i.preco * i.quantidade).toFixed(2).replace(".", ",")}`), "", `Total: R$ ${totalCarrinho.toFixed(2).replace(".", ",")}`].join("\n");
      window.open(`https://wa.me/5581992081650?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
    } catch (e) { alert(e.message); }
  }

  async function excluirPedido(id) {
    if (!clienteToken) return;
    try { await api(`/pedidos/${id}`, { method: "DELETE" }, clienteToken); setHistorico(a => a.filter(p => p._id !== id)); }
    catch (e) { alert(e.message); }
  }

  async function adicionarAviso() {
    if (!novoAviso.trim()) return;
    try { const a = await api("/avisos", { method: "POST", body: JSON.stringify({ texto: novoAviso.trim() }) }, adminToken); setAvisos(a => [a, ...a]); setNovoAviso(""); }
    catch (e) { alert(e.message); }
  }

  async function removerAviso(id) {
    try { await api(`/avisos/${id}`, { method: "DELETE" }, adminToken); setAvisos(a => a.filter(x => x._id !== id)); }
    catch (e) { alert(e.message); }
  }

  async function adicionarCategoria() {
    if (!novaCategoria.trim()) return;
    try { const c = await api("/categorias", { method: "POST", body: JSON.stringify({ nome: novaCategoria.trim() }) }, adminToken); setCategorias(a => [...a, c.nome]); setNovaCategoria(""); }
    catch (e) { alert(e.message); }
  }

  async function removerCategoria(nome) {
    if (produtos.some(p => p.categoria === nome)) { alert("Essa categoria possui produtos. Altere os produtos antes de removê-la."); return; }
    try {
      const cs = await api("/categorias"); const alvo = cs.find(c => c.nome === nome); if (!alvo) return;
      await api(`/categorias/${alvo._id}`, { method: "DELETE" }, adminToken); setCategorias(a => a.filter(c => c !== nome));
    } catch (e) { alert(e.message); }
  }

  function escolherImagem(e, editando = false) {
    const arquivo = e.target.files?.[0]; if (!arquivo) return;
    if (!arquivo.type.startsWith("image/")) { alert("Escolha uma imagem válida."); return; }
    const leitor = new FileReader(); leitor.onload = () => editando ? setProdutoEditando(p => ({ ...p, imagem: leitor.result })) : setNovoProduto(p => ({ ...p, imagem: leitor.result })); leitor.readAsDataURL(arquivo);
  }

  async function salvarProduto(e) {
    e.preventDefault();
    const p = produtoEditando || novoProduto;
    if (!p.nome.trim() || !p.preco || !p.categoria || !p.imagem) { alert("Preencha nome, preço, categoria e escolha uma imagem."); return; }
    try {
      if (produtoEditando) {
        const id = produtoEditando._id || produtoEditando.id;
        const salvo = await api(`/produtos/${id}`, { method: "PUT", body: JSON.stringify({ nome: p.nome, preco: Number(p.preco), categoria: p.categoria, imagem: p.imagem, descricao: p.descricao }) }, adminToken);
        setProdutos(a => a.map(x => (x._id || x.id) === id ? normalizarProduto(salvo) : x)); setProdutoEditando(null);
      } else {
        const salvo = await api("/produtos", { method: "POST", body: JSON.stringify({ nome: p.nome, preco: Number(p.preco), categoria: p.categoria, imagem: p.imagem, descricao: p.descricao }) }, adminToken);
        setProdutos(a => [...a, normalizarProduto(salvo)]); setNovoProduto(vazio);
      }
    } catch (e2) { alert(e2.message); }
  }

  async function excluirProduto(id) {
    if (!window.confirm("Deseja realmente remover este produto?")) return;
    try { await api(`/produtos/${id}`, { method: "DELETE" }, adminToken); setProdutos(a => a.filter(p => (p._id || p.id) !== id)); }
    catch (e) { alert(e.message); }
  }

  const form = produtoEditando || novoProduto;
  const atualizarForm = (campo, valor) => produtoEditando ? setProdutoEditando(p => ({ ...p, [campo]: valor })) : setNovoProduto(p => ({ ...p, [campo]: valor }));

  return (
    <div className="app">
      <header className="header">
        <div className="header-conteudo">
          <button className="marca" onClick={() => navegar("inicio")}><img src="/Imagens/logo.jpeg" alt="Cantinho do Maná" /></button>
          <nav className="menu-principal">
            <button onClick={() => navegar("inicio")}>Início</button>
            <button onClick={() => navegar("produtos")}>Cardápio</button>
            <button onClick={() => navegar("sobre")}>Saiba mais</button>
            <button onClick={() => navegar("contato")}>Contato</button>
          </nav>
          <div className="acoes-header">
            <button className="botao-carrinho" onClick={() => setMostrarCarrinho(true)}>Carrinho <b>{quantidadeCarrinho}</b></button>
            <button className="botao-menu" onClick={() => setMenuAberto(v => !v)} aria-label="Abrir menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </header>

      {menuAberto && <div className="menu-lateral">
        <div className="menu-lateral-topo"><div><span>MENU</span><h2>Meu espaço</h2></div><button className="fechar-menu" onClick={() => setMenuAberto(false)}>×</button></div>
        <button onClick={() => navegar("inicio")}>Início</button>
        <button onClick={() => navegar("produtos")}>Cardápio</button>
        <button onClick={() => navegar("sobre")}>Saiba mais</button>
        <button onClick={() => navegar("contato")}>Contato</button>
        <div className="linha-menu"></div>
        <button onClick={() => cliente ? navegar("historico") : (setMostrarLoginCliente(true), setModoCliente("login"), setMenuAberto(false))}>Meu histórico</button>
        {cliente ? <button onClick={sairCliente}>Sair da conta de {cliente.nome}</button> : <button onClick={() => { setMostrarLoginCliente(true); setModoCliente("login"); setMenuAberto(false); }}>Login do cliente</button>}
        <button onClick={() => { setMostrarLoginAdmin(true); setMenuAberto(false); }}>Login do administrador</button>
      </div>}

      {avisos.length > 0 && <section className="barra-aviso"><div className="aviso-conteudo"><span>AVISO</span><div>{avisos[0].texto}</div></div></section>}

      {secao === "inicio" && <main className="inicio"><section className="hero"><div className="hero-conteudo"><span className="tag">comida Ungida</span><h1>Bem-vindo ao<br /><strong>Cantinho do Maná</strong></h1><p>Comida caseira feita com carinho, ingredientes selecionados e aquele sabor que faz você querer voltar.</p><button className="botao-principal" onClick={() => navegar("produtos")}>Ver nosso cardápio</button></div><div className="hero-detalhe"><div className="hero-circulo"></div><div className="hero-texto"><span>Comida</span><strong>DE CASA</strong></div></div></section></main>}

      {secao === "produtos" && <main className="cardapio"><div className="titulo-secao"><span>MENU</span><h1>Nosso cardápio</h1><p>Escolha seu favorito e adicione ao carrinho.</p></div><div className="categorias">{categoriasMenu.map(c => <button key={c} className={categoriaAtiva === c ? "categoria-ativa" : ""} onClick={() => setCategoriaAtiva(c)}>{c}</button>)}</div><section className="lista-produtos">{produtosFiltrados.map(p => <article className="produto" key={p._id || p.id}><div className="produto-imagem" onClick={() => setProdutoSelecionado(p)}><img src={p.imagem} alt={p.nome} /></div><div className="produto-info"><span className="produto-categoria">{p.categoria}</span><h2>{p.nome}</h2><p>{p.descricao}</p><div className="produto-final"><strong>R$ {p.preco.toFixed(2).replace(".", ",")}</strong><button className="adicionar" onClick={() => adicionarAoCarrinho(p)}>Adicionar</button></div></div></article>)}</section></main>}

      {secao === "sobre" && <main className="pagina"><div className="titulo-secao"><span>SOBRE NÓS</span><h1>Sobre o Cantinho</h1></div><div className="sobre-box"><h2>Mais que comida,<br />um cantinho especial.</h2><p>Somos uma empresa com foco na satisfação do cliente, através do fornecimento de alimentos de qualidade a preços justos, visando o crescimento sustentável num processo contínuo de aperfeiçoamento, para que possamos sempre exceder a expectativa de todos que servimos.</p></div></main>}

      {secao === "contato" && <main className="pagina"><div className="titulo-secao"><span>FALE CONOSCO</span><h1>Contato</h1></div><div className="contato-box"><span>WHATSAPP</span><h2>(81) 99208-1650</h2><p>Entre em contato conosco para tirar dúvidas ou fazer seu pedido.</p><button className="whatsapp" onClick={() => window.open("https://wa.me/5581992081650", "_blank")}>Conversar no WhatsApp</button></div></main>}

      {secao === "historico" && <main className="pagina"><div className="titulo-secao"><span>MINHA CONTA</span><h1>Meu histórico</h1><p>{cliente ? `Pedidos de ${cliente.nome}.` : "Entre na sua conta para ver seus pedidos."}</p></div>{!cliente ? <div className="historico-vazio"><h2>Faça login para continuar</h2><button className="admin-principal" onClick={() => { setMostrarLoginCliente(true); setModoCliente("login"); }}>Entrar</button></div> : historico.length === 0 ? <div className="historico-vazio"><h2>Nenhum pedido registrado</h2><p>Seu histórico aparecerá quando você enviar um pedido pelo WhatsApp.</p></div> : <div className="historico-lista">{historico.map(p => <div className="historico-card" key={p._id}><div className="historico-topo"><strong>Pedido #{p._id.slice(-6)}</strong><small>{new Date(p.createdAt).toLocaleString("pt-BR")}</small></div>{p.itens.map((i, idx) => <div className="historico-linha" key={idx}><span>{i.quantidade}x {i.nome}</span><strong>R$ {(i.preco * i.quantidade).toFixed(2).replace(".", ",")}</strong></div>)}<div className="historico-total"><span>Total</span><strong>R$ {Number(p.total).toFixed(2).replace(".", ",")}</strong></div><button className="excluir-historico" onClick={() => excluirPedido(p._id)}>Excluir este pedido</button></div>)}</div>}</main>}

      {secao === "admin" && adminToken && <main className="admin"><div className="admin-cabecalho"><div><span>PAINEL RESTRITO</span><h1>Administração</h1><p>Gerencie o cardápio e os avisos.</p></div><button className="sair-admin" onClick={sairAdmin}>Sair</button></div><section className="admin-grid"><div className="admin-card"><span>AVISOS</span><h2>Publicar aviso</h2><textarea value={novoAviso} onChange={e => setNovoAviso(e.target.value)} placeholder="Digite o aviso ou promoção."/><button className="admin-principal" onClick={adicionarAviso}>Publicar aviso</button>{avisos.map(a => <div className="admin-item" key={a._id}><p>{a.texto}</p><button onClick={() => removerAviso(a._id)}>Excluir</button></div>)}</div><div className="admin-card"><span>CATEGORIAS</span><h2>Gerenciar categorias</h2><div className="campo-duplo"><input value={novaCategoria} onChange={e => setNovaCategoria(e.target.value)} placeholder="Nova categoria"/><button onClick={adicionarCategoria}>Adicionar</button></div>{categorias.map(c => <div className="categoria-admin" key={c}><span>{c}</span><button onClick={() => removerCategoria(c)}>Remover</button></div>)}</div></section><section className="admin-card"><span>CATÁLOGO</span><h2>{produtoEditando ? "Editar produto" : "Adicionar produto"}</h2><form className="form-produto" onSubmit={salvarProduto}><input value={form.nome} onChange={e => atualizarForm("nome", e.target.value)} placeholder="Nome do produto"/><input type="number" value={form.preco} onChange={e => atualizarForm("preco", e.target.value)} placeholder="Preço"/><select value={form.categoria} onChange={e => atualizarForm("categoria", e.target.value)}><option value="">Escolha uma categoria</option>{categorias.map(c => <option key={c}>{c}</option>)}</select><label className="campo-imagem"><span>Escolher foto do produto</span><input type="file" accept="image/*" onChange={e => escolherImagem(e, Boolean(produtoEditando))}/></label>{form.imagem && <div className="preview-imagem"><img src={form.imagem} alt="Prévia"/></div>}<textarea value={form.descricao} onChange={e => atualizarForm("descricao", e.target.value)} placeholder="Descrição do produto"/><div className="botoes-edicao"><button className="admin-principal" type="submit">{produtoEditando ? "Salvar alterações" : "Adicionar produto"}</button>{produtoEditando && <button className="cancelar-edicao" type="button" onClick={() => setProdutoEditando(null)}>Cancelar</button>}</div></form></section><section className="admin-card"><span>PRODUTOS ATUAIS</span><h2>Gerenciar produtos</h2><div className="produtos-admin">{produtos.map(p => <div className="produto-admin-item" key={p._id || p.id}><img src={p.imagem} alt={p.nome}/><div><strong>{p.nome}</strong><span>{p.categoria}</span><small>R$ {p.preco.toFixed(2).replace(".", ",")}</small></div><div className="acoes-produto-admin"><button onClick={() => setProdutoEditando({...p, preco: String(p.preco)})}>Editar</button><button onClick={() => excluirProduto(p._id || p.id)}>Excluir</button></div></div>)}</div></section></main>}

      {produtoSelecionado && <div className="overlay" onClick={() => setProdutoSelecionado(null)}><div className="modal-produto" onClick={e => e.stopPropagation()}><button className="fechar" onClick={() => setProdutoSelecionado(null)}>×</button><div className="modal-imagem"><img src={produtoSelecionado.imagem} alt={produtoSelecionado.nome}/></div><span className="produto-categoria">{produtoSelecionado.categoria}</span><h2>{produtoSelecionado.nome}</h2><p>{produtoSelecionado.descricao}</p><strong className="modal-preco">R$ {produtoSelecionado.preco.toFixed(2).replace(".", ",")}</strong><button className="botao-modal" onClick={() => adicionarAoCarrinho(produtoSelecionado)}>Adicionar ao carrinho</button></div></div>}

      {mostrarAdicionado && <div className="overlay popup-overlay"><div className="popup-adicionado"><button className="fechar" onClick={() => setMostrarAdicionado(false)}>×</button><div className="check">✓</div><h2>Produto adicionado</h2><p>{ultimoProduto?.nome} foi adicionado ao seu pedido.</p><div className="popup-acoes"><button className="continuar" onClick={() => setMostrarAdicionado(false)}>Continuar</button><button className="ver-carrinho" onClick={() => {setMostrarAdicionado(false);setMostrarCarrinho(true);}}>Ver carrinho</button></div></div></div>}

      {mostrarCarrinho && <div className="overlay" onClick={() => setMostrarCarrinho(false)}><aside className="carrinho" onClick={e => e.stopPropagation()}><div className="carrinho-topo"><div><span>SEU PEDIDO</span><h2>Carrinho</h2></div><button className="fechar" onClick={() => setMostrarCarrinho(false)}>×</button></div>{carrinho.length === 0 ? <div className="carrinho-vazio"><h3>Seu carrinho está vazio</h3><p>Adicione alguns produtos ao seu pedido.</p><button className="botao-ver-cardapio" onClick={() => {setMostrarCarrinho(false);setSecao("produtos");}}>Ver cardápio</button></div> : <><div className="itens">{carrinho.map(i => <div className="item" key={i.id}><div className="item-imagem"><img src={i.imagem} alt={i.nome}/></div><div className="item-dados"><h3>{i.nome}</h3><strong>R$ {i.preco.toFixed(2).replace(".", ",")}</strong><div className="quantidade"><button onClick={() => diminuir(i.id)}>−</button><span>{i.quantidade}</span><button onClick={() => aumentar(i.id)}>+</button></div><button className="remover-item" onClick={() => removerDoCarrinho(i.id)}>Remover</button></div></div>)}</div><div className="carrinho-total"><span>Total</span><strong>R$ {totalCarrinho.toFixed(2).replace(".", ",")}</strong></div><button className="finalizar" onClick={finalizarWhatsApp}>Finalizar pelo WhatsApp</button></>}</aside></div>}

      {mostrarLoginCliente && <div className="overlay" onClick={() => setMostrarLoginCliente(false)}><div className="login-modal" onClick={e => e.stopPropagation()}><button className="fechar" onClick={() => setMostrarLoginCliente(false)}>×</button><span>ÁREA DO CLIENTE</span><h2>{modoCliente === "login" ? "Entrar" : "Criar conta"}</h2>{modoCliente === "register" && <input value={clienteNome} onChange={e => setClienteNome(e.target.value)} placeholder="Seu nome"/>}<input type="email" value={clienteEmail} onChange={e => setClienteEmail(e.target.value)} placeholder="Seu e-mail"/><input type="password" value={clienteSenha} onChange={e => setClienteSenha(e.target.value)} placeholder="Sua senha"/>{erroCliente && <small className="erro-senha">{erroCliente}</small>}<button className="admin-principal" onClick={loginOuCadastroCliente}>{modoCliente === "login" ? "Entrar" : "Criar conta"}</button><button className="trocar-login" onClick={() => {setModoCliente(modoCliente === "login" ? "register" : "login");setErroCliente("");}}>{modoCliente === "login" ? "Criar minha conta" : "Já tenho uma conta"}</button></div></div>}

      {mostrarLoginAdmin && <div className="overlay" onClick={() => setMostrarLoginAdmin(false)}><div className="login-modal" onClick={e => e.stopPropagation()}><button className="fechar" onClick={() => setMostrarLoginAdmin(false)}>×</button><span>ÁREA RESTRITA</span><h2>Administrador</h2><input type="password" value={senhaAdmin} onChange={e => setSenhaAdmin(e.target.value)} onKeyDown={e => e.key === "Enter" && loginAdmin()} placeholder="Código de acesso"/>{erroAdmin && <small className="erro-senha">{erroAdmin}</small>}<button className="admin-principal" onClick={loginAdmin}>Entrar</button></div></div>}
    </div>
  );
}

export default Tela;