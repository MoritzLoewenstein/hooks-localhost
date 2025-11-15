import { ulid } from 'ulid';
import { prisma as db } from './db';
import { env } from '$env/dynamic/private';

export function validateLocalhostTarget(target: string): boolean {
	try {
		const url = new URL(target);
		return url.protocol === 'http:' && url.hostname === 'localhost';
	} catch {
		return false;
	}
}

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export async function createWebhookEndpoint(userId: string, target: string, method: string) {
	if (!validateLocalhostTarget(target)) {
		throw new Error('Target must be http://localhost URL');
	}

	if (!ALLOWED_METHODS.includes(method.toUpperCase())) {
		throw new Error('Invalid HTTP method');
	}

	return await db.webhookEndpoint.create({
		data: {
			id: ulid(),
			userId,
			target,
			method: method.toUpperCase()
		}
	});
}

export async function getWebhookEndpoints(userId: string) {
	const endpoints = await db.webhookEndpoint.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' }
	});
	return endpoints.map((e) => ({
		...e,
		url: `${env.ORIGIN}/hook/${e.id}`,
		createdAt: e.createdAt.toISOString()
	}));
}

export async function getWebhookEndpointById(id: string) {
	return await db.webhookEndpoint.findUnique({
		where: { id }
	});
}

export async function deleteWebhookEndpoint(userId: string, id: string) {
	return await db.webhookEndpoint.delete({
		where: { id, userId }
	});
}
