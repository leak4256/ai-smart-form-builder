const isValidEmail = (email) => {
  if (typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
};

module.exports = { isValidEmail };
