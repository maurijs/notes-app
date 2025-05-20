"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { authService, type LoginCredentials, type RegisterCredentials } from "../services/authService"

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [loginForm, setLoginForm] = useState<LoginCredentials>({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState<RegisterCredentials>({ username: "", password: "" })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loginErrors, setLoginErrors] = useState({ username: "", password: "", general: "" })
  const [registerErrors, setRegisterErrors] = useState({ username: "", password: "", confirmPassword: "", general: "" })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Verificar si el usuario está autenticado al cargar el componente
  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated())
  }, [])

  // Validación del formulario de login
  const validateLoginForm = () => {
    const errors = { username: "", password: "", general: "" }
    let isValid = true

    if (!loginForm.username.trim()) {
      errors.username = "Username is required"
      isValid = false
    }

    if (!loginForm.password) {
      errors.password = "Password is required"
      isValid = false
    } else if (loginForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
      isValid = false
    }

    setLoginErrors(errors)
    return isValid
  }

  // Validación del formulario de registro
  const validateRegisterForm = () => {
    const errors = { username: "", password: "", confirmPassword: "", general: "" }
    let isValid = true

    if (!registerForm.username.trim()) {
      errors.username = "Username is required"
      isValid = false
    } else if (registerForm.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
      isValid = false
    }

    if (!registerForm.password) {
      errors.password = "Password is required"
      isValid = false
    } else if (registerForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
      isValid = false
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (registerForm.password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setRegisterErrors(errors)
    return isValid
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateLoginForm()) {
      setIsLoading(true)
      try {
        const success = await authService.login(loginForm)
        if (success) {
          setIsAuthenticated(true)
          setShowLoginModal(false)
          // Recargar la página para actualizar el estado de autenticación en toda la app
          window.location.reload()
        } else {
          setLoginErrors({ ...loginErrors, general: "Invalid username or password" })
        }
      } catch (error) {
        setLoginErrors({ ...loginErrors, general: "An error occurred during login" })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateRegisterForm()) {
      setIsLoading(true)
      try {
        const success = await authService.register(registerForm)
        if (success) {
          // Mostrar mensaje de éxito y cambiar al formulario de login
          setShowRegisterModal(false)
          setShowLoginModal(true)
          setLoginForm({ username: registerForm.username, password: "" })
        } else {
          setRegisterErrors({ ...registerErrors, general: "Username already exists or registration failed" })
        }
      } catch (error) {
        setRegisterErrors({ ...registerErrors, general: "An error occurred during registration" })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleLogout = () => {
    authService.logout()
    setIsAuthenticated(false)
    // Recargar la página para actualizar el estado de autenticación en toda la app
    window.location.reload()
  }

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (name === "confirmPassword") {
      setConfirmPassword(value)
    } else {
      setRegisterForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  const openLoginModal = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const openRegisterModal = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
            {/* Icono de cuaderno personalizado y más distintivo */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
              <path d="M8 15h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block">
            Notes Manager
          </h1>
        </div>

        <div className="flex space-x-2">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-600 dark:text-slate-400"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Logout</span>
            </button>
          ) : (
            <>
              <button
                onClick={openLoginModal}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-md transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-slate-600 dark:text-slate-400"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Login</span>
              </button>

              <button
                onClick={openRegisterModal}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
                <span>Register</span>
              </button>
            </>
          )}
        </div>

        {/* Modal de Login */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Login</h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {loginErrors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <p>{loginErrors.general}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginForm.username}
                    onChange={handleLoginChange}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      loginErrors.username ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                    placeholder="Enter your username"
                    disabled={isLoading}
                  />
                  {loginErrors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.username}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      loginErrors.password ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {loginErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{loginErrors.password}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </button>
                </div>
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={openRegisterModal}
                    className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
                  >
                    Register here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Registro */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Create Account</h2>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              {registerErrors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <p>{registerErrors.general}</p>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="reg-username"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="reg-username"
                    name="username"
                    value={registerForm.username}
                    onChange={handleRegisterChange}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      registerErrors.username ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                    placeholder="Choose a username"
                    disabled={isLoading}
                  />
                  {registerErrors.username && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.username}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="reg-password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    name="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      registerErrors.password ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {registerErrors.password && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.password}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleRegisterChange}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 ${
                      registerErrors.confirmPassword ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                    }`}
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  {registerErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{registerErrors.confirmPassword}</p>
                  )}
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </button>
                </div>
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
                  >
                    Login here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
