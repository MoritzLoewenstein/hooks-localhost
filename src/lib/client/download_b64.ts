export async function downloadB64(
	mimeType: string,
	filename: string,
	data_b64: string
): Promise<void> {
	const blob = await fetch(`data:${mimeType};base64,${data_b64}`).then((r) => r.blob());
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
