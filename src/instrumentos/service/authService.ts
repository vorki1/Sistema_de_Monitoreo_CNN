import { api } from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface Usuario {
  id: number
  username: string
  nombre: string
  rol: string
  activo: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  usuario: Usuario
}

export async function loginUsuario(datos: LoginRequest) {
  const response = await api.post<LoginResponse>('/auth/login', datos)
  return response.data
}

export async function obtenerUsuarioActual() {
  const response = await api.get('/auth/me')
  return response.data
}