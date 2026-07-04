import { createApiClient } from "./httpClient"

const authApi = createApiClient("/api/auth", { withAuth: false })

export default authApi
