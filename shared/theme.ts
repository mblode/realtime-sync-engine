import { Theme } from "./types";
import { WriteTransaction } from "./write-transaction";

export const initTheme = async (tx: WriteTransaction, key: string) => {
	if (await tx.has(key)) {
		return;
	}
	await tx.set(key, true);
};

export const getTheme = async (tx: WriteTransaction, key: string) => {
	return await tx.get<Theme>(key);
};

export const updateTheme = async (
	tx: WriteTransaction,
	key: string,
	newValue: Partial<Theme>,
) => {
	const oldValue = await tx.get<Theme>(key);
	await tx.set(key, {
		...oldValue,
		...newValue,
	});
};
