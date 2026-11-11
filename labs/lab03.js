// ===== Lab 3 — Smart Parking: simulación de sensores IoT =====
// Los datos de los cajones (CAJONES) vienen de slots.js.
// Estado de cada cajón: true = ocupado, false = disponible.

(function () {
    "use strict";

    var NS = "http://www.w3.org/2000/svg";
    var INTERVALO_MS = 2200;        // cada cuánto "reportan" los sensores
    var PROB_OCUPADO_INICIAL = 0.65; // probabilidad de que un cajón empiece ocupado
    var MAX_EVENTOS = 8;            // eventos que se muestran en la bitácora

    var contenedor = document.getElementById("cajones");
    var elPorcentaje = document.getElementById("porcentaje");
    var elBarra = document.getElementById("barra");
    var elBarraRelleno = document.getElementById("barra-relleno");
    var elTotal = document.getElementById("total");
    var elOcupados = document.getElementById("ocupados");
    var elDisponibles = document.getElementById("disponibles");
    var elBitacora = document.getElementById("bitacora");
    var elIndicador = document.getElementById("indicador");
    var elIndicadorTexto = document.getElementById("indicador-texto");
    var btnPausa = document.getElementById("btn-pausa");
    var btnReiniciar = document.getElementById("btn-reiniciar");

    var estados = [];   // estados[i] corresponde a CAJONES[i]
    var figuras = [];   // figuras[i] es el polígono SVG de CAJONES[i]
    var temporizador = null;
    var pausado = false;

    // ----- Utilidades -----
    function hora() {
        var d = new Date();
        function dos(n) { return (n < 10 ? "0" : "") + n; }
        return dos(d.getHours()) + ":" + dos(d.getMinutes()) + ":" + dos(d.getSeconds());
    }

    function textoEstado(i) {
        return estados[i] ? "Ocupado" : "Disponible";
    }

    // ----- Dibujo de un cajón -----
    function pintarCajon(i, destello) {
        var fig = figuras[i];
        fig.setAttribute("class", estados[i] ? "ocupado" : "libre");
        fig.setAttribute("aria-label", "Cajón " + CAJONES[i].id + ": " + textoEstado(i).toLowerCase() + ". Presiona para cambiar su estado.");
        fig.firstChild.textContent = "Cajón " + CAJONES[i].id + " · " + textoEstado(i);

        if (destello) {
            fig.classList.remove("cambio");
            void fig.getBoundingClientRect(); // reinicia la animación
            fig.classList.add("cambio");
        }
    }

    // ----- Dashboard -----
    function actualizarDashboard() {
        var total = estados.length;
        var ocupados = 0;
        for (var i = 0; i < total; i++) {
            if (estados[i]) { ocupados++; }
        }
        var disponibles = total - ocupados;
        var porcentaje = total === 0 ? 0 : Math.round((ocupados / total) * 100);

        elTotal.textContent = total;
        elOcupados.textContent = ocupados;
        elDisponibles.textContent = disponibles;
        elPorcentaje.textContent = porcentaje;
        elBarraRelleno.style.width = porcentaje + "%";
        elBarra.setAttribute("aria-valuenow", porcentaje);
    }

    // ----- Bitácora de eventos -----
    function registrarEvento(i, origen) {
        var li = document.createElement("li");
        var spanHora = document.createElement("span");
        spanHora.className = "hora";
        spanHora.textContent = hora();

        var spanTexto = document.createElement("span");
        spanTexto.className = estados[i] ? "entra" : "sale";
        var accion = estados[i] ? "vehículo detectado" : "cajón liberado";
        spanTexto.textContent = (origen === "manual" ? "Manual " : "Sensor ") + CAJONES[i].id + ": " + accion;

        li.appendChild(spanHora);
        li.appendChild(spanTexto);
        elBitacora.insertBefore(li, elBitacora.firstChild);

        while (elBitacora.children.length > MAX_EVENTOS) {
            elBitacora.removeChild(elBitacora.lastChild);
        }
    }

    // ----- Cambios de estado -----
    function cambiarEstado(i, origen) {
        estados[i] = !estados[i];
        pintarCajon(i, true);
        registrarEvento(i, origen);
        actualizarDashboard();
    }

    // Simula una lectura de sensores: algunos cajones cambian al azar
    function lecturaDeSensores() {
        var cambios = 1 + Math.floor(Math.random() * 3); // entre 1 y 3 cambios por lectura
        for (var c = 0; c < cambios; c++) {
            var i = Math.floor(Math.random() * estados.length);
            cambiarEstado(i, "sensor");
        }
    }

    // Asigna estados aleatorios a todos los cajones
    function generarDatosIniciales() {
        for (var i = 0; i < estados.length; i++) {
            estados[i] = Math.random() < PROB_OCUPADO_INICIAL;
            pintarCajon(i, false);
        }
        elBitacora.innerHTML = "";
        actualizarDashboard();
    }

    // ----- Simulación automática -----
    function iniciarSimulacion() {
        detenerSimulacion();
        temporizador = setInterval(lecturaDeSensores, INTERVALO_MS);
    }

    function detenerSimulacion() {
        if (temporizador !== null) {
            clearInterval(temporizador);
            temporizador = null;
        }
    }

    function mostrarPausa() {
        elIndicador.classList.toggle("pausado", pausado);
        elIndicadorTexto.textContent = pausado ? "Simulación en pausa" : "Sensores activos";
        btnPausa.textContent = pausado ? "Reanudar simulación" : "Pausar simulación";
    }

    // ----- Construcción inicial -----
    function construirMapa() {
        CAJONES.forEach(function (cajon, i) {
            var fig = document.createElementNS(NS, "polygon");
            fig.setAttribute("points", cajon.puntos);
            fig.setAttribute("tabindex", "0");
            fig.setAttribute("role", "button");
            fig.appendChild(document.createElementNS(NS, "title"));

            fig.addEventListener("click", function () { cambiarEstado(i, "manual"); });
            fig.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    cambiarEstado(i, "manual");
                }
            });

            contenedor.appendChild(fig);
            figuras.push(fig);
            estados.push(false);
        });
    }

    btnPausa.addEventListener("click", function () {
        pausado = !pausado;
        if (pausado) { detenerSimulacion(); } else { iniciarSimulacion(); }
        mostrarPausa();
    });

    btnReiniciar.addEventListener("click", generarDatosIniciales);

    construirMapa();
    generarDatosIniciales();
    mostrarPausa();
    iniciarSimulacion();
})();
