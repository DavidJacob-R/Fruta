import React, { createContext, useContext } from "react"

type UiState = {
  darkMode: boolean
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const UiContext = createContext<UiState | undefined>(undefined)

export function UiProvider({ children, value }: { children: React.ReactNode; value: UiState }) {
  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) {
    throw new Error("useUi debe usarse dentro de UiProvider")
  }
  return ctx
}
