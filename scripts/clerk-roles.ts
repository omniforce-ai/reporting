#!/usr/bin/env tsx

import { Clerk } from '@clerk/clerk-sdk-node';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error('❌ CLERK_SECRET_KEY environment variable is required');
  process.exit(1);
}

const clerk = new Clerk({ secretKey: clerkSecretKey });

async function setUserRole(userIdOrEmail: string, role: 'admin' | 'client') {
  try {
    let userId = userIdOrEmail;
    
    // If it looks like an email, find the user by email
    if (userIdOrEmail.includes('@')) {
      const users = await clerk.users.getUserList({ emailAddress: [userIdOrEmail] });
      if (users.length === 0) {
        console.error(`❌ User with email ${userIdOrEmail} not found`);
        process.exit(1);
      }
      userId = users[0].id;
      console.log(`📧 Found user: ${users[0].emailAddresses[0]?.emailAddress} (${userId})`);
    }

    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });

    const user = await clerk.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress || 'N/A';
    
    console.log(`✅ Role '${role}' set for user: ${email} (${userId})`);
  } catch (error: any) {
    console.error('❌ Error setting user role:', error.message);
    process.exit(1);
  }
}

async function getUserRole(userIdOrEmail: string) {
  try {
    let user;
    
    if (userIdOrEmail.includes('@')) {
      const users = await clerk.users.getUserList({ emailAddress: [userIdOrEmail] });
      if (users.length === 0) {
        console.error(`❌ User with email ${userIdOrEmail} not found`);
        process.exit(1);
      }
      user = users[0];
    } else {
      user = await clerk.users.getUser(userIdOrEmail);
    }

    const email = user.emailAddresses[0]?.emailAddress || 'N/A';
    const role = (user.publicMetadata as any)?.role || 'not set';
    
    console.log(`\n👤 User: ${email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`👑 Role: ${role}`);
  } catch (error: any) {
    console.error('❌ Error getting user role:', error.message);
    process.exit(1);
  }
}

async function listAllUsers() {
  try {
    const users = await clerk.users.getUserList({ limit: 100 });
    
    console.log(`\n📋 Found ${users.length} users:\n`);
    
    for (const user of users) {
      const email = user.emailAddresses[0]?.emailAddress || 'N/A';
      const role = (user.publicMetadata as any)?.role || 'not set';
      const roleIcon = role === 'admin' ? '👑' : role === 'client' ? '👤' : '❓';
      
      console.log(`${roleIcon} ${email.padEnd(40)} - ${role}`);
    }
  } catch (error: any) {
    console.error('❌ Error listing users:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.log(`
🔐 Clerk Role Management CLI

Usage:
  npm run clerk:set <userId|email> <role>     Set user role (admin or client)
  npm run clerk:get <userId|email>            Get user role
  npm run clerk:list                           List all users with roles

Examples:
  npm run clerk:set user_abc123 admin
  npm run clerk:set user@example.com client
  npm run clerk:get user@example.com
  npm run clerk:list
`);
  process.exit(0);
}

if (command === 'set') {
  const userIdOrEmail = args[1];
  const role = args[2] as 'admin' | 'client';
  
  if (!userIdOrEmail || !role) {
    console.error('❌ Usage: npm run clerk:set <userId|email> <role>');
    process.exit(1);
  }
  
  if (role !== 'admin' && role !== 'client') {
    console.error('❌ Role must be either "admin" or "client"');
    process.exit(1);
  }
  
  setUserRole(userIdOrEmail, role);
} else if (command === 'get') {
  const userIdOrEmail = args[1];
  
  if (!userIdOrEmail) {
    console.error('❌ Usage: npm run clerk:get <userId|email>');
    process.exit(1);
  }
  
  getUserRole(userIdOrEmail);
} else if (command === 'list') {
  listAllUsers();
} else {
  console.error(`❌ Unknown command: ${command}`);
  console.log('Available commands: set, get, list');
  process.exit(1);
}

