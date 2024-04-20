import { WriteTransaction } from "./write-transaction";

import { Client } from "./types";

export const listClients = async (tx: WriteTransaction, key: string) => {
	const value: Client[] = (await tx.get(key)) || [];
	return value;
};

export const setClients = async (
	tx: WriteTransaction,
	key: string,
	value: Client[] | undefined,
) => {
	const prev: Client[] = (await tx.get(key)) || [];

	if (value === undefined) {
		return prev;
	}

	await tx.set(key, value);
	return value;
};

export const setClient = async (
	tx: WriteTransaction,
	key: string,
	value: Client,
) => {
	const prev: Client[] = (await tx.get(key)) || [];
	const next = [...prev, value];
	await tx.set(key, next);
	return next;
};

export const updateClient = async (
	tx: WriteTransaction,
	key: string,
	value: Partial<Client> & Required<Pick<Client, "id">>,
) => {
	const prev: Client[] = (await tx.get(key)) || [];
	const next = prev.map((client) =>
		client.id === value.id ? { ...client, ...value } : client,
	);
	await tx.set(key, next);
	return next;
};

export const deleteClient = async (
	tx: WriteTransaction,
	key: string,
	{ id }: Pick<Client, "id">,
) => {
	const prev: Client[] = (await tx.get(key)) || [];
	const next = prev.filter((client) => client.id !== id);
	await tx.set(key, next);
	return next;
};
