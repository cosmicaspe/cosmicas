/* Barra promocional negra (arriba de la barra roja de envíos).
   Para cambiar el texto o quitarla, agrega en js/config.js dentro de window.COSMICAS:
     promo: "OTRO TEXTO",   (cambia el texto)
     promo: "",             (la oculta) */
(function () {
  var C = window.COSMICAS || {};
  var txt = C.promo !== undefined ? C.promo : "DESCUENTOS BLACK WEEK";
  if (!txt) return;

  var st = document.createElement("style");
  st.textContent =
    ".bar2{display:block;background:#000;color:#fff;text-align:center;padding:7px 12px;font-size:11px;font-weight:700;letter-spacing:.12em;text-decoration:none}" +
    ".bar2:hover,.bar2:focus-visible{text-decoration:underline;text-underline-offset:4px}" +
    ".bar2:focus-visible{outline:2px solid #fff;outline-offset:-4px}" +
    ".hero{height:calc(100vh - 68px);height:calc(100svh - 68px)}";
  document.head.appendChild(st);

  var a = document.createElement("a");
  a.className = "bar2";
  a.href = "catalogo.html";
  a.textContent = txt;

  var roja = document.querySelector(".bar");
  if (roja) roja.parentNode.insertBefore(a, roja);
  else document.body.insertBefore(a, document.body.firstChild);
})();
