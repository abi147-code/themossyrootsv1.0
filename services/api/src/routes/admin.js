const express = require('express');
const ExcelJS = require('exceljs');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

async function fetchUsersWithOrganization(prisma) {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      email: true,
      organization: {
        select: {
          name: true,
        },
      },
    },
  });
}

router.get('/users/summary', requireAdmin, async (req, res) => {
  const prisma = req.prisma;

  try {
    const [totalUsers, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          email: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({
      totalUsers,
      recentUsers: recentUsers.map((user) => ({
        email: user.email,
        signedUpAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch admin user summary', error);
    res.status(500).json({ message: 'Failed to fetch user summary.' });
  }
});

router.get('/users/export', requireAdmin, async (req, res) => {
  const prisma = req.prisma;

  try {
    const users = await fetchUsersWithOrganization(prisma);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Users');

    worksheet.columns = [
      { header: 'Full Name', key: 'name', width: 30 },
      { header: 'Organization', key: 'organization', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        name: user.name || '',
        organization: user.organization?.name || '',
        email: user.email,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tmr-users-${timestamp}.xlsx"`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Failed to export users', error);
    return res.status(500).json({ message: 'Failed to export users.' });
  }
});

router.get('/users/export.csv', requireAdmin, async (req, res) => {
  const prisma = req.prisma;

  try {
    const users = await fetchUsersWithOrganization(prisma);

    const escapeCsvValue = (value) => {
      if (value === null || value === undefined) {
        return '';
      }
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [
      ['Full Name', 'Organization', 'Email'],
      ...users.map((user) => [
        user.name || '',
        user.organization?.name || '',
        user.email || '',
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tmr-users-${timestamp}.csv"`
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');

    return res.send(`\ufeff${csv}`);
  } catch (error) {
    console.error('Failed to export users CSV', error);
    return res.status(500).json({ message: 'Failed to export users.' });
  }
});

module.exports = router;
