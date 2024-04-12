import { Storage } from '../../shared/write-transaction'

export class CloudflareStorage implements Storage {
	private ctx: DurableObjectState

	constructor(ctx: DurableObjectState) {
		this.ctx = ctx
	}

	async get<T>(key: string): Promise<T | undefined> {
		return this.ctx.storage.get<T>(key)
	}

	async set<T>(key: string, value: T): Promise<void> {
		await this.ctx.storage.put(key, value)
	}
}
