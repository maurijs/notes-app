import { API_BASE_URL } from "../api"

// Tipos para los datos de autenticación
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
}

// Clase para manejar la autenticación
class AuthService {
  // Clave para almacenar el token en localStorage
  private tokenKey = "auth_token"

  // Obtener el token almacenado
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  // Guardar el token
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token)
  }

  // Eliminar el token (logout)
  removeToken(): void {
    localStorage.removeItem(this.tokenKey)
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Iniciar sesión
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/Note", "")}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to login")
      }

      const data: AuthResponse = await response.json()
      this.setToken(data.token)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  // Registrar un nuevo usuario
  async register(credentials: RegisterCredentials): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/Note", "")}/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Failed to register")
      }

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  // Cerrar sesión
  logout(): void {
    this.removeToken()
  }

  // Obtener los headers de autenticación para las peticiones API
  getAuthHeaders(): HeadersInit {
    const token = this.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService()
