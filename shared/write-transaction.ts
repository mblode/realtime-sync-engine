export interface Storage {
	get<T>(key: string): Promise<T | undefined>;
	set<T>(key: string, value: T): Promise<void>;
}

export class WriteTransaction {
	private storage: Storage;

	constructor(storage: Storage) {
		this.storage = storage;
	}

	async get<T>(key: string): Promise<T | undefined> {
		return this.storage.get<T>(key);
	}

	async set<T>(key: string, value: T): Promise<void> {
		await this.storage.set<T>(key, value);
	}
}
