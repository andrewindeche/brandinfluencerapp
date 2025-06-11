describe('SignUp Form', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('submits successfully with valid data', () => {
    cy.fixture('signupUser').then((user) => {
      cy.intercept('POST', '/auth/register', {
        statusCode: 201,
        body: { serverMessage: 'Registration successful' },
      }).as('register');

      cy.get('#email').type(user.email);
      cy.get('#username').type(user.username);
      cy.get('#role').select(user.role);
      cy.get('#password').type(user.password);
      cy.get('#confirmPassword').type(user.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@register');
      cy.contains('Registration successful').should('exist');
      cy.url().should('include', '/login?signup=success');
    });
  });
});
