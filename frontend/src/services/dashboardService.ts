import api from "./api"
import { DashboardStats } from "../types"

export const getDashboardStats = () => api.get<DashboardStats>("/dashboard/stats")
