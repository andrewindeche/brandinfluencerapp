describe('LoginForm', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders login form with default content', () => {
    cy.contains('Log In');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains("Don't have an account?");
    cy.contains('Forgot your password?');
  });

  it('disables submit and shows only password error on empty form submission', () => {
    cy.fixture('loginCredentials').then(({ genericEmail, genericPassword }) => {
      cy.get('input#email').clear();
      cy.get('input#password').clear();
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('input#email').type(genericEmail);
      cy.get('button[type="submit"]').should('be.disabled');

      cy.get('input#password').type(genericPassword);
      cy.get('button[type="submit"]').should('not.be.disabled');

      cy.get('input#password').clear();
      cy.get('form').submit();

      cy.contains('Password is required').should('be.visible');
      cy.contains('Email is required').should('not.exist');
    });
  });

  it('updates user type based on detected role', () => {
    cy.fixture('loginCredentials').then(({ validInfluencer }) => {
      cy.get('input[type="email"]').type(validInfluencer.email);
      cy.wait(300);
      cy.get('h3').should('contain.text', 'Log in as an Influencer!');
    });
  });

  it('can login with correct credentials', () => {
    cy.fixture('loginCredentials').then(({ validInfluencer }) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 200,
        body: { success: true, role: 'influencer' },
      }).as('loginRequest');

      cy.get('input[type="email"]').type(validInfluencer.email);
      cy.get('input[type="password"]').type(validInfluencer.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/influencer');
    });
  });

  it('shows toast on failed login attempt', () => {
    cy.fixture('loginCredentials').then(({ invalidUser }) => {
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 401,
        body: { success: false, message: 'Invalid credentials' },
      }).as('loginFail');

      cy.get('input[type="email"]').type(invalidUser.email);
      cy.get('input[type="password"]').type(invalidUser.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@loginFail');
      cy.contains('Login failed').should('be.visible');
    });
  });

  it('displays signup success dialog if redirected with signup=success', () => {
    cy.visit('/login?signup=success');
    cy.contains('User Created Successfully!');
    cy.contains('Close').click();
    cy.contains('User Created Successfully!').should('not.exist');
  });

  it('disables submit if userType is unknown', () => {
    cy.fixture('loginCredentials').then(({ unrelatedUser }) => {
      cy.get('input[type="email"]').type(unrelatedUser.email);
      cy.wait(300);
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  it('resets form on route change', () => {
    cy.fixture('loginCredentials').then(({ genericEmail, genericPassword }) => {
      cy.get('input[type="email"]').type(genericEmail);
      cy.get('input[type="password"]').type(genericPassword);
      cy.window().then((win) => {
        win.dispatchEvent(new Event('popstate'));
      });
      cy.get('input[type="email"]').should('have.value', '');
      cy.get('input[type="password"]').should('have.value', '');
    });
  });
});
