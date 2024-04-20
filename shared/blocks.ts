import { Block } from "./types";
import { WriteTransaction } from "./write-transaction";

export const listBlocks = async (tx: WriteTransaction, key: string) => {
	const value: Block[] = (await tx.get(key)) || [];
	return value;
};

export const setBlocks = async (
	tx: WriteTransaction,
	key: string,
	value: Block[] | undefined,
) => {
	const prev: Block[] = (await tx.get(key)) || [];

	if (value === undefined) {
		return prev;
	}

	await tx.set(key, value);
	return value;
};

export const setBlock = async (
	tx: WriteTransaction,
	key: string,
	value: Block,
) => {
	const prev: Block[] = (await tx.get(key)) || [];
	const next = [...prev, value];
	await tx.set(key, next);
	return next;
};

export const updateBlock = async (
	tx: WriteTransaction,
	key: string,
	value: Partial<Block> & Required<Pick<Block, "id">>,
) => {
	const prev: Block[] = (await tx.get(key)) || [];
	const next = prev.map((block) =>
		block.id === value.id ? { ...block, ...value } : block,
	);
	await tx.set(key, next);
	return next;
};

export const deleteBlock = async (
	tx: WriteTransaction,
	key: string,
	{ id }: Pick<Block, "id">,
) => {
	const prev: Block[] = (await tx.get(key)) || [];
	const next = prev.filter((block) => block.id !== id);
	await tx.set(key, next);
	return next;
};
