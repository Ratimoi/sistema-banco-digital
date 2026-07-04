import bcrypt from "bcryptjs"

const SALT_ROUNDS = 10

export const hashPassword = (senha: string) => bcrypt.hash(senha, SALT_ROUNDS)
