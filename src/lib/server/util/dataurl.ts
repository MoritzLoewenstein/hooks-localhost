interface DataUrlParseResult {
	mimeType: string | null;
	mimeParam: { key: string; value: string } | null;
	encoding: string | null;
	body: ArrayBufferLike | string;
}

interface ParseDataUrlOptions {
	asText?: boolean;
}

export function parseDataUrl(
	dataUrlStr: string,
	options: ParseDataUrlOptions = { asText: true }
): DataUrlParseResult | null {
	if (!dataUrlStr.startsWith('data:')) {
		return null;
	}

	const metaEnd = dataUrlStr.indexOf(',');
	const meta = dataUrlStr.slice(5, metaEnd);
	let body: string | ArrayBufferLike = dataUrlStr.slice(metaEnd + 1);

	const parts = meta.split(';');
	if (parts.length > 3) {
		return null;
	}

	let mimeType: string | null = null;
	let mimeParam: { key: string; value: string } | null = null;
	let encoding: string | null = null;

	if (parts.length === 1) {
		if (parts[0].includes('/')) {
			mimeType = parts[0];
		} else {
			encoding = validateEncoding(parts[0]);
		}
	} else if (parts.length === 2) {
		if (parts[0].includes('/')) {
			mimeType = parts[0];
			if (parts[1].includes('=')) {
				const [key, value] = parts[1].split('=');
				mimeParam = {
					key,
					value
				};
			} else {
				encoding = validateEncoding(parts[1]);
			}
		}
	} else {
		if (parts[0].includes('/')) {
			mimeType = parts[0];
			if (parts[1].includes('=')) {
				const [key, value] = parts[1].split('=');
				mimeParam = {
					key,
					value
				};
			}
			encoding = validateEncoding(parts[2]);
		}
	}

	if (options.asText) {
		if (encoding === 'base64') {
			body = Buffer.from(body as string, encoding).toString('utf8');
		} else {
			body = decodeURIComponent(body as string);
		}
	} else {
		body = Buffer.from(body as string, encoding as BufferEncoding).buffer;
	}

	return { mimeType, mimeParam, encoding, body };
}

export function formatDataUrl(mimeType: string, data: ArrayBuffer | string): string {
	const encoding = data instanceof ArrayBuffer ? 'base64' : 'utf8';
	let body: string;
	if (data instanceof ArrayBuffer) {
		body = Buffer.from(data).toString(encoding);
	} else {
		body = encodeURIComponent(data);
	}

	return `data:${mimeType};${encoding},${body}`;
}

function validateEncoding(encodingStr: string): string | null {
	const encoding = encodingStr.toLowerCase();
	if (encoding !== 'base64' && encoding !== 'utf8' && encoding !== 'utf-8') {
		return null;
	}
	return encoding;
}
