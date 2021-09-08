export const asyncSome = async <T>(arr: T[], predicate: (e: T) => Promise<boolean>) => {
	for (let e of arr) {
		if (await predicate(e)) return true;
	}
	return false;
};