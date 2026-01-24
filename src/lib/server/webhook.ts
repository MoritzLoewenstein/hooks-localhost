import { ulid } from 'ulid';
import { prisma as db } from './db';
import { env } from '$env/dynamic/private';
import { HTTP_METHODS } from '../constants';
import type { ArrayElement } from '$lib/shared/types';

function validateLocalhostTarget(target: string): URL | null {
	try {
		const url = new URL(target);
		if (url.protocol !== 'http:' || url.hostname !== 'localhost') {
			return null;
		}

		return url;
	} catch {
		return null;
	}
}

function validateEndpoint(target: string, method: string): { target: string; method: string } {
	const targetUrl = validateLocalhostTarget(target);
	if (targetUrl === null) {
		throw new Error('Target must be http://localhost URL');
	}

	const METHOD = method.toUpperCase();
	if (!HTTP_METHODS.includes(METHOD as ArrayElement<typeof HTTP_METHODS>)) {
		throw new Error('Invalid HTTP method');
	}

	return {
		target: targetUrl.href,
		method: METHOD
	};
}

export async function createWebhookEndpoint(userId: string, target: string, method: string) {
	const { target: targetValid, method: methodValid } = validateEndpoint(target, method);

	return await db.webhookEndpoint.create({
		data: {
			id: ulid(),
			userId,
			target: targetValid,
			method: methodValid
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

export async function updateWebhookEndpoint(
	userId: string,
	id: string,
	target: string,
	method: string
) {
	const { target: targetValid, method: methodValid } = validateEndpoint(target, method);

	return await db.webhookEndpoint.update({
		where: { id, userId },
		data: {
			target: targetValid,
			method: methodValid
		}
	});
}

export async function deleteWebhookEndpoint(userId: string, id: string) {
	return await db.webhookEndpoint.delete({
		where: { id, userId }
	});
}
