import { PaginationQuery } from "../schemas/common"

export interface PaginatedResult<T> {
  dados: T[]
  total: number
  pagina: number
  totalPaginas: number
}

export const paginar = async <T>(
  count: () => Promise<number>,
  findMany: (skip: number, take: number) => Promise<T[]>,
  { page, limit }: PaginationQuery,
): Promise<PaginatedResult<T>> => {
  const skip = (page - 1) * limit
  const [total, dados] = await Promise.all([count(), findMany(skip, limit)])
  return { dados, total, pagina: page, totalPaginas: Math.max(1, Math.ceil(total / limit)) }
}
