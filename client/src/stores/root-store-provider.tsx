'use client'
import React from 'react'

import { RootStore, RootStoreContext } from './root-store'

export const RootStoreProvider = ({ children }: React.PropsWithChildren) => {
  return (
    <RootStoreContext.Provider value={new RootStore()}>
      {children}
    </RootStoreContext.Provider>
  )
}
