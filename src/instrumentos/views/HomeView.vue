<template>
  <div class="home-container">
    <div class="panel-izquierdo">
      <img
        src="../../assets/cmp-logo.png"
        alt="CMP"
        class="logo-cmp"
      />

      <div class="login-box">
        <h1 class="titulo-login">Ingreso al sistema</h1>

        <input
          v-model="usuario"
          type="text"
          placeholder="Usuario"
          class="input-login"
          @keyup.enter="ingresar"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          class="input-login"
          @keyup.enter="ingresar"
        />

        <button
          class="btn-acceder"
          :disabled="cargando"
          @click="ingresar"
        >
          {{ cargando ? 'INGRESANDO...' : 'INGRESAR' }}
        </button>

        <p v-if="error" class="error">
          Usuario o contraseña incorrectos
        </p>
      </div>
    </div>

    <div class="panel-derecho">
      <img
        src="../../assets/mineria.jpeg"
        alt="Minería"
        class="imagen-mineria"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUsuario } from '../service/authService'

const router = useRouter()

const usuario = ref('')
const password = ref('')
const error = ref(false)
const cargando = ref(false)

async function ingresar() {
  try {
    error.value = false
    cargando.value = true

    const data = await loginUsuario({
      username: usuario.value,
      password: password.value
    })

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token_type', data.token_type)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))
    localStorage.setItem('rol', data.usuario.rol)

    router.push('/areas')
  } catch (e) {
    console.error(e)
    error.value = true
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.home-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background: #d9d9d9;
}

.panel-izquierdo {
  width: 50%;
  background: #d9d9d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40px;
}

.logo-cmp {
  width: 80%;
  max-width: 520px;
  object-fit: contain;
}

.login-box {
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.titulo-login {
  color: #005494;
  font-size: 28px;
  margin-bottom: 12px;
}

.input-login {
  width: 280px;
  height: 44px;
  padding: 0 12px;
  border: 2px solid #333;
  font-size: 15px;
}

.btn-acceder {
  width: 280px;
  height: 50px;
  cursor: pointer;
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  background: #0057a8;
  color: white;
  border: 2px solid black;
}

.btn-acceder:hover {
  background: #0069c9;
}

.btn-acceder:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error {
  color: #b00020;
  font-weight: bold;
}

.panel-derecho {
  width: 50%;
  overflow: hidden;
}

.imagen-mineria {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 900px) {
  .home-container {
    flex-direction: column;
  }

  .panel-izquierdo,
  .panel-derecho {
    width: 100%;
  }

  .panel-derecho {
    height: 40vh;
  }

  .logo-cmp {
    width: 70%;
  }

  .login-box {
    margin-top: 60px;
  }
}
</style>