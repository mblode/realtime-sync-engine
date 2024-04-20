import { Page } from "./types";
import { WriteTransaction } from "./write-transaction";

export const initPage = async (tx: WriteTransaction, key: string) => {
	if (await tx.has(key)) {
		return;
	}
	await tx.set(key, true);
};

export const getPage = async (tx: WriteTransaction, key: string) => {
	return await tx.get<Page>(key);
};

export const updatePage = async (
	tx: WriteTransaction,
	key: string,
	newValue: Partial<Page>,
) => {
	const oldValue = await tx.get<Page>(key);
	await tx.set(key, {
		...oldValue,
		...newValue,
	});
};
