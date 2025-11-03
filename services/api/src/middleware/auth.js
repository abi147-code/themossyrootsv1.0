const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.replace('Bearer ', '');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed', error);
    return res.status(401).json({ message: 'Invalid token' });
  }

  if (!req.prisma) {
    console.error('Prisma client missing on request in auth middleware');
    return res.status(500).json({ message: 'Authentication service unavailable.' });
  }

  try {
    const user = await req.prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error('User lookup failed during authentication', error);
    return res.status(500).json({ message: 'Authentication service unavailable.' });
  }
};
