export function token(): string {
	const rawBytes = crypto.getRandomValues(new Uint8Array(16));
	const base62Alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

	let num = BigInt(0);
	for (let i = 0; i < 16; i++) {
		num = (num << 8n) | BigInt(rawBytes[i]);
	}

	const chars = [];
	while (num > 0n) {
		const remainder = num % 62n;
		chars.push(base62Alphabet[Number(remainder)]);
		num = num / 62n;
	}

	while (chars.length < 22) {
		chars.push('0');
	}

	return chars.reverse().join('');
}
