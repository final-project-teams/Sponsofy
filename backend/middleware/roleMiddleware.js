const isContentCreator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'content_creator') {
    return res.status(403).json({ message: 'Access denied. Content Creator role required.' });
  }

  next();
};

const isCompany = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Access denied. Company role required.' });
  }

  next();
};

module.exports = {
  isContentCreator,
  isCompany
}; 