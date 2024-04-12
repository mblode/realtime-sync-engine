import { WriteTransaction } from "./write-transaction";

export const getCounter = async (tx: WriteTransaction, key: string) => {
	const value: number = (await tx.get(key)) || 0;
	return value;
};

export const setCounter = async (
	tx: WriteTransaction,
	key: string,
	amount: number | undefined,
) => {
	const prev: number = (await tx.get(key)) || 0;

	if (amount === undefined) {
		return prev;
	}

	await tx.set(key, amount);
	return amount;
};

export const incrementCounter = async (
	tx: WriteTransaction,
	key: string,
	amount = 1,
) => {
	const prev: number = (await tx.get(key)) || 0;
	const next = prev + amount;
	await tx.set(key, next);
	return next;
};

export const decrementCounter = async (
	tx: WriteTransaction,
	key: string,
	amount = 1,
) => {
	const prev: number = (await tx.get(key)) || 0;
	const next = prev - amount;
	await tx.set(key, next);
	return next;
};
