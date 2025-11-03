const bcrypt = require('bcryptjs');

/**
 * Ensure the default admin account exists so QA/staging credentials stay consistent.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {Promise<string | null>}
 */
async function ensureAdminUser(prisma) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('[bootstrap] ADMIN_EMAIL or ADMIN_PASSWORD missing – skipping admin seeding.');
    return null;
  }

  const displayName = process.env.ADMIN_NAME || 'TMR Admin';
  const organizationName = process.env.ADMIN_ORG_NAME || `${displayName} Organization`;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        name: displayName,
        organization: {
          create: {
            name: organizationName,
          },
        },
      },
    });

    return `[bootstrap] Created default admin user for ${email}.`;
  }

  const updates = {};

  if (existing.role !== 'ADMIN') {
    updates.role = 'ADMIN';
  }

  const passwordMatches = await bcrypt.compare(password, existing.password);
  if (!passwordMatches) {
    updates.password = hashedPassword;
  }

  if (Object.keys(updates).length > 0) {
    await prisma.user.update({
      where: { email },
      data: updates,
    });
    return `[bootstrap] Updated admin user ${email}.`;
  }

  return `[bootstrap] Admin user ${email} already provisioned.`;
}

module.exports = ensureAdminUser;
