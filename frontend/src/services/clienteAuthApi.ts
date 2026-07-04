/// <reference types="vite/client" />
import axios from "axios"

const clienteAuthApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/cliente-auth`
    : "/api/cliente-auth",
})

export default clienteAuthApi
