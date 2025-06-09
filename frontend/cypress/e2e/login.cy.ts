describe('LoginForm', () => {
  beforeEach(() => {
    cy.fixture('loginCredentials').as('creds');
    cy.visit('/login');
  });

  it('renders login form with default content', () => {
    cy.contains('Log In');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.contains("Don't have an account?");
    cy.contains('Forgot your password?');
  });

  it('disables submit and shows only password error on empty form submission', function () {
    cy.get('input#email').clear();
    cy.get('input#password').clear();

    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input#email').type(this.creds.genericEmail);
    cy.get('button[type="submit"]').should('be.disabled');

    cy.get('input#password').type(this.creds.genericPassword);
    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('input#password').clear();
    cy.get('form').submit();

    cy.contains('Password is required').should('be.visible');
    cy.contains('Email is required').should('not.exist');
  });

  it('updates user type based on detected role', function () {
    cy.get('input[type="email"]').type(this.creds.validInfluencer.email);

    cy.get('h3', { timeout: 2000 }).should(
      'contain.text',
      'Log in as an Influencer!',
    );
  });

  it('can login with correct credentials', function () {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { success: true, role: 'influencer' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type(this.creds.validInfluencer.email);
    cy.get('input[type="password"]').type(this.creds.validInfluencer.password);
    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/influencer');
  });

  it('shows toast on failed login attempt', function () {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { success: false, message: 'Invalid credentials' },
    }).as('loginFail');

    cy.get('input[type="email"]').type(this.creds.invalidUser.email);
    cy.get('input[type="password"]').type(this.creds.invalidUser.password);
    cy.get('button[type="submit"]').should('not.be.disabled').click();

    cy.wait('@loginFail');
    cy.contains('Login failed').should('be.visible');
  });

  it('displays signup success dialog if redirected with signup=success', () => {
    cy.visit('/login?signup=success');
    cy.contains('User Created Successfully!');
    cy.contains('Close').click();
    cy.contains('User Created Successfully!').should('not.exist');
  });

  it('disables submit if userType is unknown', function () {
    cy.get('input[type="email"]').type(this.creds.unrelatedUser.email);
    cy.get('button[type="submit"]', { timeout: 2000 }).should('be.disabled');
  });

  it('resets form on route change', function () {
    cy.get('input[type="email"]').type(this.creds.genericEmail);
    cy.get('input[type="password"]').type(this.creds.genericPassword);

    cy.window().then((win) => {
      win.history.pushState({}, '', '/some-other-route');
      win.history.back();
    });

    cy.get('input[type="email"]').should('have.value', '');
    cy.get('input[type="password"]').should('have.value', '');
  });
});
