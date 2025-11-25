"use client"

import useSWR from "swr"

interface User {
  full_name: string
  email: string
  avatar_url: string | null
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch user")
  const data = await res.json()
  return data.user as User
}

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<User>("/api/auth/user", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  return {
    user: data,
    isLoading,
    isError: error,
    mutate,
  }
}
