import { createClient } from
  "https://esm.sh/@supabase/supabase-js@2";

const URL_SUPABASE = "https://nshgtsqjwynqgrrucyyn.supabase.co";

const CHAVE_PUBLICA = "sb_publishable_qUFsft7YrquAqNnzc1MvbA_kUO3TjCWsb_publishable_qUFsft7YrquAqNnzc1MvbA_kUO3TjCW";

const supabase = createClient(URL_SUPABASE, CHAVE_PUBLICA);
const BUCKET = "portfolio-fotos";

const upload = document.getElementById("uploadImagem");
const destino = document.getElementById("fotoDestino");
const toolbar = document.getElementById("toolbar");

// Área de upload: oculta para visitantes.
const areaUpload = upload.closest("label");
areaUpload.hidden = true;
areaUpload.style.display = "none";

// Botão para abrir o acesso administrativo
const botaoAdmin = document.createElement("button");
botaoAdmin.textContent = "Admin";
botaoAdmin.type = "button";
toolbar.append(botaoAdmin);

// Formulário de login, criado pelo JavaScript
const painel = document.createElement("div");
painel.innerHTML = `
  <form id="loginPortfolio"
    style="position:fixed;top:20px;right:20px;
    z-index:100000;background:white;color:#222;
    padding:20px;border-radius:12px;
    box-shadow:0 8px 30px #0004;
    display:none;width:min(300px,90vw)">

    <h3>Administrador</h3>

    <input id="emailAdmin"
      type="email" placeholder="E-mail"
      autocomplete="username" required
      style="width:100%;padding:10px;margin-bottom:10px">

    <input id="senhaAdmin"
      type="password" placeholder="Senha"
      autocomplete="current-password" required
      style="width:100%;padding:10px;margin-bottom:10px">

    <button type="submit">Entrar</button>
    <button type="button" id="fecharAdmin">Fechar</button>
  </form>
`;

document.body.append(painel);

const formulario = document.getElementById("loginPortfolio");

document.getElementById("fecharAdmin").onclick = () => {
  formulario.style.display = "none";
};

botaoAdmin.onclick = async () => {
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    await supabase.auth.signOut();
  } else {
    formulario.style.display = "block";
  }
};

formulario.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const email = document.getElementById("emailAdmin").value;
  const password = document.getElementById("senhaAdmin").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Não foi possível entrar: " + error.message);
    return;
  }

  formulario.reset();
  formulario.style.display = "none";
});

// Oculte o botão de upload quando não há login.
async function atualizarAdmin() {
  const { data: { user } } = await supabase.auth.getUser();

  // O backend ainda verificará se é o UID autorizado.
  areaUpload.hidden = !user;
  areaUpload.style.display = user ? "inline-flex" : "none";
  botaoAdmin.textContent = user ? "Sair do Admin" : "Admin";
}

supabase.auth.onAuthStateChange(() => {
  // Executa fora do callback de autenticação para evitar bloqueios.
  setTimeout(atualizarAdmin, 0);
});

function mostrarImagem(slot, caminho) {
  const imagem = document.querySelector(
    `img[data-slot="${slot}"]`
  );

  if (!imagem) return;

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(caminho);

  // O nome exclusivo do arquivo evita reutilizar uma imagem antiga do cache.
  imagem.src = data.publicUrl;
}

// Busca as imagens salvas ao entrar no site.
async function carregarFotos() {
  const { data, error } = await supabase
    .from("fotos_portfolio")
    .select("slot, caminho");

  if (error) {
    console.error("Erro ao carregar fotos:", error);
    return;
  }

  for (const foto of data) {
    mostrarImagem(foto.slot, foto.caminho);
  }
}

// Salva uma nova foto e atualiza a revista.
upload.addEventListener("change", async () => {
  const arquivo = upload.files?.[0];
  if (!arquivo) return;

  const tipos = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  const extensao = tipos[arquivo.type];

  if (!extensao) {
    alert("Escolha uma imagem JPG, PNG ou WebP.");
    upload.value = "";
    return;
  }

  if (arquivo.size > 5 * 1024 * 1024) {
    alert("O limite é de 5 MB por imagem.");
    upload.value = "";
    return;
  }

  // Confirme que existe uma sessão ativa antes do upload.
  const { data: { user }, error: erroUsuario } = await supabase.auth.getUser();
  if (erroUsuario || !user) {
    alert("Entre como administrador antes de trocar a foto.");
    upload.value = "";
    return;
  }

  const slot = Number(destino.value);
  const caminho = `${slot}/${crypto.randomUUID()}.${extensao}`;

  try {
    // Cada upload recebe um novo nome.
    const { error: erroUpload } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, arquivo, {
        contentType: arquivo.type,
        cacheControl: "3600",
        upsert: false
      });

    if (erroUpload) throw erroUpload;

    // Registra a nova fotografia como a atual.
    const { error: erroBanco } = await supabase
      .from("fotos_portfolio")
      .upsert({
        slot,
        caminho,
        atualizado_em: new Date().toISOString()
      }, {
        onConflict: "slot"
      });

    if (erroBanco) throw erroBanco;

    mostrarImagem(slot, caminho);
    alert("Fotografia salva com sucesso!");
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível salvar: " + erro.message);
  } finally {
    upload.value = "";
  }
});

await carregarFotos();
await atualizarAdmin();
