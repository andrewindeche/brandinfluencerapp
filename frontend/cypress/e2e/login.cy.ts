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

  it('shows validation errors when submitting empty form', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please fix the errors in the form.');
    cy.get('p').should('contain.text', 'Email');
    cy.get('p').should('contain.text', 'Password');
  });

  it('updates user type based on detected role', () => {
    cy.get('input[type="email"]').type('influencer@example.com');
    cy.wait(300); // wait for debounce + role detection logic
    cy.get('h3').should('contain.text', 'Log in as an Influencer!');
  });

  it('can login with correct credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: { success: true, role: 'influencer' },
    }).as('loginRequest');

    cy.get('input[type="email"]').type('influencer@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/influencer');
  });

  it('shows toast on failed login attempt', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { success: false, message: 'Invalid credentials' },
    }).as('loginFail');

    cy.get('input[type="email"]').type('wrong@example.com');
    cy.get('input[type="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('Login failed').should('be.visible');
  });

  it('displays signup success dialog if redirected with signup=success', () => {
    cy.visit('/login?signup=success');
    cy.contains('User Created Successfully!');
    cy.contains('Close').click();
    cy.contains('User Created Successfully!').should('not.exist');
  });

  it('disables submit if userType is unknown', () => {
    cy.get('input[type="email"]').type('unrelated@example.com');
    cy.wait(300);
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('resets form on route change', () => {
    cy.get('input[type="email"]').type('email@example.com');
    cy.get('input[type="password"]').type('password');
    cy.window().then((win) => {
      win.dispatchEvent(new Event('popstate')); // simulate route change
    });
    cy.get('input[type="email"]').should('have.value', '');
    cy.get('input[type="password"]').should('have.value', '');
  });
});
