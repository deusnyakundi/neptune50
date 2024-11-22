const authService = require('../../src/services/authService');
const { AuthenticationError } = require('../../src/utils/errors');

describe('AuthService', () => {
  describe('validatePasswordStrength', () => {
    it('should accept valid passwords', () => {
      expect(() => {
        authService.validatePasswordStrength('ValidPass123!');
      }).not.toThrow();
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short1!',
        'nouppercase123!',
        'NOLOWERCASE123!',
        'NoSpecialChar123',
        'NoNumber!@#abc',
      ];

      weakPasswords.forEach(password => {
        expect(() => {
          authService.validatePasswordStrength(password);
        }).toThrow(ValidationError);
      });
    });
  });
}); 