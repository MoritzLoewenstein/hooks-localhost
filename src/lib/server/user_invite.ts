import { env } from '$env/dynamic/private';
import { prisma } from './db.js';
import { ulid } from 'ulid';

const INVITE_TOKEN_TIMEOUT = 60 * 60 * 24 * 14;

export interface UserInvite {
	token: string;
	email: string;
	link: string;
	valid_until: number;
}

function inviteLink(invite_token: string): string {
	return `${env.ORIGIN}/?invite_token=${invite_token}`;
}

export async function createInvite(user_id: string, email: string): Promise<UserInvite> {
	const invite_token = ulid();
	const now = new Date();
	const valid_until = Math.floor(now.getTime() / 1000) + INVITE_TOKEN_TIMEOUT;

	await prisma.userInvite.create({
		data: {
			userId: user_id,
			token: invite_token,
			email
		}
	});

	return {
		token: invite_token,
		link: inviteLink(invite_token),
		email,
		valid_until
	};
}

export async function getUserInvites(user_id: string): Promise<UserInvite[]> {
	const absoluteTimeout = new Date(Date.now() - INVITE_TOKEN_TIMEOUT * 1000);

	const invites = await prisma.userInvite.findMany({
		where: {
			userId: user_id,
			createdAt: { gt: absoluteTimeout }
		},
		select: { token: true, email: true, createdAt: true }
	});

	return invites.map((invite) => ({
		token: invite.token,
		email: invite.email,
		link: inviteLink(invite.token),
		valid_until: Math.floor((invite.createdAt.getTime() + INVITE_TOKEN_TIMEOUT * 1000) / 1000)
	}));
}

export async function getInvite(invite_token: string): Promise<string | false> {
	const absoluteTimeout = new Date(Date.now() - INVITE_TOKEN_TIMEOUT * 1000);

	const invite = await prisma.userInvite.findUnique({
		where: {
			token: invite_token,
			createdAt: { gt: absoluteTimeout }
		},
		select: { email: true }
	});

	if (!invite) {
		return false;
	}
	return invite.email;
}

export async function verifyInvite(invite_token: string): Promise<string | false> {
	const absoluteTimeout = new Date(Date.now() - INVITE_TOKEN_TIMEOUT * 1000);

	const invite = await prisma.userInvite.findUnique({
		where: {
			token: invite_token,
			createdAt: { gt: absoluteTimeout }
		},
		select: { email: true }
	});

	if (!invite) {
		return false;
	}

	await prisma.userInvite.delete({
		where: { token: invite_token }
	});

	return invite.email;
}
