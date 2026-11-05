let DATOS_APP = null

async function iniciarApp() {
  const app = document.getElementById('app')

  try {
    DATOS_APP = await cargarDatosBase()
    console.log('Datos cargados:', DATOS_APP)

    configurarEventosMenu()

    // Forzar vista inicial
    actualizarNavbar('dashboard')
    renderDashboard()

  } catch (error) {
    console.error(error)

    app.innerHTML = `
      <section class="error">
        <h2>Error al cargar datos</h2>
        <p>No se pudieron cargar los archivos JSON.</p>
      </section>
    `
  }
}

function configurarEventosMenu() {
  document.querySelectorAll('[data-view]').forEach((boton) => {
    boton.addEventListener('click', () => {
      mostrarVista(boton.dataset.view)
    })
  })
}

function actualizarNavbar(vista) {
  document.querySelectorAll('.nav button').forEach((boton) => {
    boton.classList.remove('activo')

    if (boton.dataset.view === vista) {
      boton.classList.add('activo')
    }
  })
}

function mostrarVista(vista) {
  actualizarNavbar(vista)

  if (vista === 'dashboard') renderDashboard()
  if (vista === 'areas') renderAreas()
  if (vista === 'treemap') renderTreemap()
}

document.addEventListener('DOMContentLoaded', iniciarApp)