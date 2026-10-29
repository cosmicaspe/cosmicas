(function () {
  var C = window.COSMICAS, $ = function (s) { return document.querySelector(s); };
  var P = [], cart = [], lastFocus = null;
  try { cart = JSON.parse(localStorage.getItem("cosmicas-carrito") || "[]"); } catch (e) {}
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var precio = function (n) { return "S/ " + (n % 1 ? n.toFixed(2) : n); };
  var slug = function (s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-"); };
  var num = function (v) { return parseFloat(String(v).replace(",", ".")) || 0; };
  var VISTAS = ["frente", "diagonal", "costado"];

  function csv(t) {
    t = t.replace(/^\uFEFF/, "");
    var l1 = t.split("\n")[0], d = (l1.match(/;/g) || []).length > (l1.match(/,/g) || []).length ? ";" : ",";
    var rows = [], r = [], f = "", q = false, i, c;
    for (i = 0; i < t.length; i++) {
      c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === d) { r.push(f); f = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; rows.push(r); r = []; }
      else f += c;
    }
    if (f || r.length) { r.push(f); rows.push(r); }
    var h = rows.shift().map(function (x) { return x.trim().toLowerCase(); });
    return rows.filter(function (x) { return x.some(function (v) { return v.trim(); }); }).map(function (x) {
      var o = {}; h.forEach(function (k, j) { o[k] = (x[j] || "").trim(); }); return o;
    });
  }

  var src = function (p, v) { return p.dir + (p["imagen_" + v] || p.imagen_frente); };
  var cant = function (id) { var c = cart.filter(function (x) { return x.id === id; })[0]; return c ? c.q : 0; };
  var guarda = function () { try { localStorage.setItem("cosmicas-carrito", JSON.stringify(cart)); } catch (e) {} };

  function card(p) {
    var nuevo = /^s[ií]$/i.test(p.destacado) && p.stock > 0;
    return '<a class="card' + (p.stock < 1 ? " ago" : "") + '" href="#' + encodeURIComponent(p.id) + '"><div class="im">' +
      (p.stock < 1 ? '<span class="pill a">AGOTADO</span>' : "") + (nuevo ? '<span class="pill n">NUEVO</span>' : "") +
      '<img src="' + src(p, "frente") + '" alt="' + esc(p.nombre) + '" loading="lazy">' +
      (p.imagen_diagonal ? '<img src="' + src(p, "diagonal") + '" alt="" loading="lazy">' : "") +
      '</div><div class="inf"><span>' + esc(p.nombre) + "</span><span>" + precio(p.precio) + "</span></div></a>";
  }

  function lista() {
    var fc = $("#fc").value, ft = $("#ft").value, fd = $("#fd").checked, o = $("#fo").value;
    var l = P.filter(function (p) { return (!fc || p.categoria === fc) && (!ft || p.talla === ft) && (!fd || p.stock > 0); });
    l.sort(o === "pa" ? function (a, b) { return a.precio - b.precio; } : o === "pd" ? function (a, b) { return b.precio - a.precio; } :
      o === "n" ? function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); } : function (a, b) { return a.orden - b.orden; });
    $("#cuenta").textContent = l.length + (l.length === 1 ? " ANILLO" : " ANILLOS");
    $("#grid").innerHTML = l.length ? l.map(card).join("") : '<p class="vacio">No hay anillos con esos filtros. Prueba quitando alguno.</p>';
  }

  function abrir(id) {
    var p = P.filter(function (x) { return x.id === id; })[0];
    if (!p) return cerrar(true);
    var ims = VISTAS.filter(function (v) { return p["imagen_" + v]; }).map(function (v) { return src(p, v); });
    var disp = p.stock - cant(p.id);
    var aviso = p.stock < 1 ? "AGOTADO" : p.stock === 1 ? "ÚLTIMA UNIDAD" : p.stock <= 3 ? "QUEDAN " + p.stock : "";
    $("#fi").innerHTML = '<button class="x" aria-label="Cerrar" data-cerrar>×</button><div class="gal"><img class="big" id="big" src="' + ims[0] + '" alt="' + esc(p.nombre) + '"><div class="th">' +
      ims.map(function (s, i) { return '<button data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '" aria-current="' + (i === 0) + '"><img src="' + s + '" alt=""></button>'; }).join("") +
      '</div></div><div class="det"><h2>' + esc(p.nombre) + '</h2><div class="px">' + (p.antes > p.precio ? "<s>" + precio(p.antes) + "</s>" : "") + precio(p.precio) + "</div>" +
      (p.descripcion ? "<p>" + esc(p.descripcion) + "</p>" : "") +
      "<p>" + [p.color && "COLOR: " + esc(p.color), p.talla && "TALLA: " + esc(p.talla), "CÓDIGO: " + esc(p.id)].filter(Boolean).join("<br>") + "</p>" +
      (aviso ? "<p><b>" + aviso + "</b></p>" : "") +
      '<button class="btn" id="add"' + (disp < 1 ? " disabled" : "") + ">" + (p.stock < 1 ? "AGOTADO" : disp < 1 ? "YA ESTÁ EN TU PEDIDO" : "AGREGAR A MI PEDIDO") + "</button>" +
      '<p id="ok" role="status"></p><a class="btn o" href="guia-de-tallas.html">VER GUÍA DE TALLAS</a></div>';
    $("#fi").dataset.id = p.id;
    if (!$("#ov").classList.contains("on")) lastFocus = document.activeElement;
    $("#ov").classList.add("on"); document.body.style.overflow = "hidden";
    $("#fi .x").focus();
    document.title = p.nombre + " · Cósmicas";
  }

  function cerrar(sinHash) {
    $("#ov").classList.remove("on"); document.body.style.overflow = "";
    document.title = "Catálogo · Cósmicas";
    if (location.hash && sinHash !== true) history.pushState(null, "", location.pathname + location.search);
    else if (sinHash === true && location.hash) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus) lastFocus.focus();
  }

  function ruta() { var id = decodeURIComponent(location.hash.slice(1)); if (id === "pedido") { history.replaceState(null, "", location.pathname + location.search); carrito(true); } else if (id) abrir(id); else if ($("#ov").classList.contains("on")) cerrar(true); }

  function pinta() {
    var it = cart.map(function (c) { return { c: c, p: P.filter(function (x) { return x.id === c.id; })[0] }; }).filter(function (x) { return x.p; });
    var total = it.reduce(function (s, x) { return s + x.p.precio * x.c.q; }, 0), n = it.reduce(function (s, x) { return s + x.c.q; }, 0);
    $("#items").innerHTML = it.length ? it.map(function (x) {
      var p = x.p, c = x.c;
      return '<div class="it"><img src="' + src(p, "frente") + '" alt=""><div><strong>' + esc(p.nombre) + "</strong><br>" + (p.talla ? "Talla " + esc(p.talla) + " · " : "") + precio(p.precio) +
        '<div class="q"><button data-m="' + esc(p.id) + '" aria-label="Quitar uno">−</button>' + c.q + '<button data-p="' + esc(p.id) + '" aria-label="Agregar uno"' + (c.q >= p.stock ? " disabled" : "") + '>+</button></div></div><button class="rm" data-r="' + esc(p.id) + '" aria-label="Eliminar ' + esc(p.nombre) + '">×</button></div>';
    }).join("") : '<p class="vacio">Tu pedido está vacío. ¡Elige tus anillos del catálogo!</p>';
    $("#tot").textContent = precio(total); $("#nc").textContent = n;
    var w = $("#envia");
    if (n) {
      var msg = "¡Hola Cósmicas! 💫 Quiero hacer este pedido:\n" + it.map(function (x, i) {
        return (i + 1) + ". " + x.p.id + " · " + x.p.nombre + (x.p.talla ? " (Talla " + x.p.talla + ")" : "") + " · " + precio(x.p.precio) + (x.c.q > 1 ? " x" + x.c.q : "");
      }).join("\n") + "\n\nTotal: " + precio(total) + "\n\nQuisiera confirmar disponibilidad y cotizar el envío 🚚";
      w.href = C.waLink(msg); w.setAttribute("aria-disabled", "false"); w.target = "_blank";
    } else { w.href = "#"; w.setAttribute("aria-disabled", "true"); w.removeAttribute("target"); }
  }

  function cambia(id, d) {
    var p = P.filter(function (x) { return x.id === id; })[0], c = cart.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    if (!c) { if (d > 0 && p.stock > 0) cart.push({ id: id, q: 1 }); }
    else { c.q = Math.min(p.stock, c.q + d); if (c.q < 1 || d === -99) cart = cart.filter(function (x) { return x.id !== id; }); }
    guarda(); pinta();
  }

  function carrito(on) { var c = $("#cart"); c.classList.toggle("on", on); c.setAttribute("aria-hidden", !on); if (on) $("#cart .x").focus(); }

  document.addEventListener("click", function (e) {
    if (e.target === $("#ov")) return cerrar();
    var t = e.target.closest("button,a"); if (!t) return;
    if (t.matches("[data-cerrar]")) return cerrar();
    if (t.dataset.i != null) { var ims = document.querySelectorAll(".th button"); $("#big").src = t.querySelector("img").src; ims.forEach(function (b) { b.setAttribute("aria-current", b === t); }); }
    if (t.id === "add") { cambia($("#fi").dataset.id, 1); abrir($("#fi").dataset.id); $("#ok").textContent = "Agregado a tu pedido ✓"; }
    if (t.dataset.p) cambia(t.dataset.p, 1);
    if (t.dataset.m) cambia(t.dataset.m, -1);
    if (t.dataset.r) cambia(t.dataset.r, -99);
    if (t.hasAttribute("data-cc")) carrito(false);
    if (t.id === "envia" && t.getAttribute("aria-disabled") === "true") e.preventDefault();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if ($("#ov").classList.contains("on")) cerrar(); else carrito(false); } });
  window.addEventListener("hashchange", ruta);

  fetch("data/productos.csv?v=" + Date.now()).then(function (r) { if (!r.ok) throw 0; return r.text(); }).then(function (t) {
    P = csv(t).filter(function (r) { return r.id; }).map(function (r) {
      r.precio = num(r.precio); r.antes = num(r.precio_antes); r.stock = parseInt(r.stock, 10) || 0; r.orden = num(r.orden) || 999;
      r.dir = "img/productos/" + (C.carpetas[r.categoria] || slug(r.categoria)) + "/"; return r;
    });
    cart = cart.filter(function (c) { var p = P.filter(function (x) { return x.id === c.id; })[0]; if (p) c.q = Math.min(c.q, p.stock); return p && c.q > 0; });
    var uniq = function (k) { return P.map(function (p) { return p[k]; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; }); };
    $("#fc").innerHTML += uniq("categoria").map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
    $("#ft").innerHTML += uniq("talla").map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
    ["#fc", "#ft", "#fd", "#fo"].forEach(function (s) { $(s).addEventListener("change", lista); });
    guarda(); lista(); pinta(); ruta();
  }).catch(function () {
    $("#grid").innerHTML = '<p class="vacio">No pudimos cargar el catálogo. Si estás probando en tu computadora, abre la página desde un servidor local (no con doble clic) y revisa que exista data/productos.csv.</p>';
  });
})();
