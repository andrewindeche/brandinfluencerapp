describe('Forgot Password Form', () => {
  beforeEach(() => {
    cy.visit('/forgotpassword');
  });

  it('renders forgot password form with correct elements', () => {
    cy.get('#email').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Reset Password');
    cy.contains('Back to Login').should('exist');
  });

  it('shows validation error for empty email', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
  });

  it('shows validation error for invalid email format', () => {
    cy.get('#email').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email format').should('be.visible');
  });

  it('navigates back to login when clicking Back to Login', () => {
    cy.contains('Back to Login').click();
    cy.url().should('include', '/login');
  });

  it('sends reset email successfully', () => {
    cy.fixture('forgotPassword').then((data) => {
      cy.intercept('POST', '**/auth/forgot-password', {
        statusCode: 200,
        body: { message: 'Reset email sent', previewLink: data.previewLink },
      }).as('forgotPassword');

      cy.get('#email').type(data.email);
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPassword');
      cy.contains('Reset email sent! Please check your inbox').should('be.visible');
    });
  });

  it('shows error message on API failure', () => {
    cy.intercept('POST', '**/auth/forgot-password', {
      statusCode: 404,
      body: { message: 'User not found' },
    }).as('forgotPasswordFail');

    cy.get('#email').type('nonexistent@example.com');
    cy.get('button[type="submit"]').click();

    cy.wait('@forgotPasswordFail');
  });
});

describe('Reset Password Form', () => {
  beforeEach(() => {
    cy.visit('/forgotpassword?token=test-token-12345');
  });

  it('renders reset password form with correct elements', () => {
    cy.get('#password').should('exist');
    cy.get('#confirmPassword').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Reset Password');
  });

  it('shows validation error for empty password', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Password is required').should('be.visible');
  });

  it('shows validation error for short password', () => {
    cy.get('#password').type('short');
    cy.get('#confirmPassword').type('short');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('shows validation error for mismatched passwords', () => {
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('differentpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('successfully resets password', () => {
    cy.fixture('resetPassword').then(({ newPassword }) => {
      cy.intercept('POST', '**/auth/reset-password/*', {
        statusCode: 200,
        body: { message: 'Password reset successful' },
      }).as('resetPassword');

      cy.get('#password').type(newPassword);
      cy.get('#confirmPassword').type(newPassword);
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPassword');
      cy.contains('Password reset successful').should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  it('shows error on invalid token', () => {
    cy.intercept('POST', '**/auth/reset-password/*', {
      statusCode: 400,
      body: { message: 'Invalid or expired token' },
    }).as('resetPasswordFail');

    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@resetPasswordFail');
  });
});
