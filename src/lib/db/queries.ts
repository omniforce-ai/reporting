import { prisma } from './prisma';
import type { Role } from '@prisma/client';

export async function getTenantBySubdomain(subdomain: string) {
  return await prisma.tenant.findUnique({
    where: { subdomain },
  });
}

export async function getAllTenants() {
  return await prisma.tenant.findMany({
    take: 1, // Just get first one for localhost fallback
    orderBy: { createdAt: 'asc' },
  });
}

export async function getTenantById(id: string) {
  return await prisma.tenant.findUnique({
    where: { id },
    include: {
      users: true,
      automations: {
        include: {
          metrics: {
            orderBy: { timestamp: 'desc' },
            take: 100,
          },
        },
      },
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: { tenant: true },
  });
}

export async function getMetricsByTenant(tenantId: string, limit = 100) {
  return await prisma.metric.findMany({
    where: {
      automation: {
        tenantId,
      },
    },
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: {
      automation: true,
    },
  });
}

export async function getAutomationsByTenant(tenantId: string) {
  return await prisma.automation.findMany({
    where: { tenantId },
    include: {
      metrics: {
        orderBy: { timestamp: 'desc' },
        take: 30,
      },
    },
  });
}

export async function createTenant(data: {
  name: string;
  subdomain: string;
  customDomain?: string;
  logoUrl?: string;
  primaryColor?: string;
}) {
  return await prisma.tenant.create({
    data,
  });
}

export async function createUser(data: {
  email: string;
  name?: string;
  passwordHash: string;
  role: Role;
  tenantId: string;
}) {
  return await prisma.user.create({
    data,
    include: { tenant: true },
  });
}

export async function createAutomation(data: {
  name: string;
  description?: string;
  type: string;
  status: string;
  tenantId: string;
}) {
  return await prisma.automation.create({
    data,
  });
}

export async function createMetric(data: {
  automationId: string;
  metricType: string;
  value: number;
  unit: string;
  timestamp?: Date;
}) {
  return await prisma.metric.create({
    data,
    include: {
      automation: true,
    },
  });
}

