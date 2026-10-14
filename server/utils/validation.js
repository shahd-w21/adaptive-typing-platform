const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordError(password) {
  if (!password || password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain letters and numbers";
  }
  return null;
}

module.exports = { EMAIL_REGEX, passwordError };