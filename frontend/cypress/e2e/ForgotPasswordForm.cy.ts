describe('Forgot Password Form', () => {
  beforeEach(() => {
    cy.visit('/forgot-password');
  });

  it('sends reset email and opens preview link', () => {
    cy.fixture('forgotPassword').then((data) => {
      cy.intercept('POST', '/auth/forgot-password', {
        statusCode: 200,
        body: { previewLink: data.previewLink },
      }).as('forgotPassword');

      cy.window().then((win) => cy.stub(win, 'open').as('windowOpen'));

      cy.get('#email').type(data.email);
      cy.get('button[type="submit"]').click();

      cy.wait('@forgotPassword');
      cy.get('@windowOpen').should('have.been.calledWith', data.previewLink);
    });
  });
});

describe('Reset Password Form', () => {
  beforeEach(() => {
    cy.visit('/forgot-password?token=test-token');
  });

  it('successfully resets password', () => {
    cy.fixture('resetPassword').then(({ newPassword, token }) => {
      cy.intercept('POST', `/auth/reset-password/${token}`, {
        statusCode: 200,
      }).as('resetPassword');

      cy.get('#password').type(newPassword);
      cy.get('#confirmPassword').type(newPassword);
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPassword');
      cy.contains('Password reset successful').should('exist');
      cy.url().should('include', '/login');
    });
  });
});
