/* eslint-disable @typescript-eslint/no-explicit-any */
import { Storage } from "../../../shared/write-transaction";

export class MobxStorage implements Storage {
	private store: Record<string, any>;

	constructor(store: Record<string, any>) {
		this.store = store;
	}

	async get<T>(key: string): Promise<T | undefined> {
		return this.store[key];
	}

	async set<T>(key: string, value: T): Promise<void> {
		this.store[key] = value;
	}
}
