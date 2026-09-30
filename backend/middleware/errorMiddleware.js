export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }
  const status = error.statusCode || 500;
  res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : error.message });
}
