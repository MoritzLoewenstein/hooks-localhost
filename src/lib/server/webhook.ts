import { ulid } from 'ulid';
import { prisma as db } from './db';
import { env } from '$env/dynamic/private';
import { HTTP_METHODS } from '../constants';
import type { ArrayElement } from '$lib/shared/types';
import type { WebhookEndpointModel } from '../../../generated/prisma/models';

type HttpMethod = ArrayElement<typeof HTTP_METHODS>;

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

function validateEndpoint(
	target: string,
	methods: string[]
): { target: string; methods: HttpMethod[] } {
	const targetUrl = validateLocalhostTarget(target);
	if (targetUrl === null) {
		throw new Error('Target must be http://localhost URL');
	}

	if (!Array.isArray(methods) || methods.length === 0) {
		throw new Error('At least one HTTP method must be selected');
	}

	const normalized: HttpMethod[] = [];
	for (const method of methods) {
		const METHOD = method.toUpperCase() as HttpMethod;
		if (!HTTP_METHODS.includes(METHOD)) {
			throw new Error('Invalid HTTP method');
		}
		if (!normalized.includes(METHOD)) {
			normalized.push(METHOD);
		}
	}

	return {
		target: targetUrl.href,
		methods: normalized
	};
}

function serializeEndpoint(endpoint: WebhookEndpointModel) {
	return {
		id: endpoint.id,
		userId: endpoint.userId,
		target: endpoint.target,
		methods: endpoint.methods,
		url: `${env.ORIGIN}/hook/${endpoint.id}`,
		createdAt: endpoint.createdAt.toISOString()
	};
}

export async function createWebhookEndpoint(userId: string, target: string, methods: string[]) {
	const { target: targetValid, methods: methodsValid } = validateEndpoint(target, methods);

	const created = await db.webhookEndpoint.create({
		data: {
			id: ulid(),
			userId,
			target: targetValid,
			methods: methodsValid
		}
	});
	return serializeEndpoint(created);
}

export async function getWebhookEndpoints(userId: string) {
	const endpoints = await db.webhookEndpoint.findMany({
		where: { userId },
		orderBy: { createdAt: 'desc' }
	});
	return endpoints.map(serializeEndpoint);
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
	methods: string[]
) {
	const { target: targetValid, methods: methodsValid } = validateEndpoint(target, methods);

	const updated = await db.webhookEndpoint.update({
		where: { id, userId },
		data: {
			target: targetValid,
			methods: methodsValid
		}
	});
	return serializeEndpoint(updated);
}

export async function deleteWebhookEndpoint(userId: string, id: string) {
	return await db.webhookEndpoint.delete({
		where: { id, userId }
	});
}
