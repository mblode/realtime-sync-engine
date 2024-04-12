"use client";
import { createContext } from "react";

import { PublicStore } from "./public-store";

export class RootStore {
	publicStore: PublicStore;

	constructor() {
		this.publicStore = new PublicStore(this);
	}
}

export const rootStore = new RootStore();

export const RootStoreContext = createContext(rootStore);
