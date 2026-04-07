describe('LoginForm', () => {
  beforeEach(() => {
    cy.fixture('loginCredentials').as('creds');
    cy.visit('/login');
  });

  it('renders login form with default content', () => {
    cy.contains('Log In').should('be.visible');
    cy.get('#email').should('exist');
    cy.get('#password').should('exist');
    cy.contains("Don't have an account?");
    cy.contains('Forgot your password?');
    cy.get('button[type="submit"]').should('contain', 'Log In');
  });

  it('shows validation errors for empty form submission', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('shows validation error for invalid email format', () => {
    cy.get('#email').type('invalid-email');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email format').should('be.visible');
  });

  it('shows validation error for email without password', () => {
    cy.get('#email').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Password is required').should('be.visible');
    cy.contains('Email is required').should('not.exist');
  });

  it('shows validation error for password without email', () => {
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
  });

  it('navigates to signup when clicking Sign Up link', () => {
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('navigates to forgot password when clicking Forgot your password', () => {
    cy.contains('Forgot your password?').click();
    cy.url().should('include', '/forgotpassword');
  });

  it('updates user type banner when entering email', function () {
    cy.get('#email').type(this.creds.validInfluencer.email);
    cy.get('h3').should('contain.text', 'Log in as an Influencer!');
  });

  it('shows different banner for brand email', function () {
    cy.get('#email').type(this.creds.validBrand.email);
    cy.get('h3').should('contain.text', 'Log in as a Brand!');
  });

  it('can login with correct influencer credentials', function () {
    cy.intercept('POST', '**/auth/influencer/login', {
      statusCode: 200,
      body: { 
        success: true, 
        access_token: 'fake-token',
        user: { id: '123', role: 'influencer', username: 'testuser' }
      },
    }).as('loginRequest');

    cy.get('#email').type(this.creds.validInfluencer.email);
    cy.get('#password').type(this.creds.validInfluencer.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/influencer');
  });

  it('can login with correct brand credentials', function () {
    cy.intercept('POST', '**/auth/brand/login', {
      statusCode: 200,
      body: { 
        success: true, 
        access_token: 'fake-token',
        user: { id: '123', role: 'brand', username: 'testbrand' }
      },
    }).as('loginRequest');

    cy.get('#email').type(this.creds.validBrand.email);
    cy.get('#password').type(this.creds.validBrand.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/brand');
  });

  it('shows error message for wrong password', function () {
    cy.intercept('POST', '**/auth/influencer/login', {
      statusCode: 401,
      body: { message: 'Invalid password', code: 'INVALID_PASSWORD' },
    }).as('loginFail');

    cy.get('#email').type(this.creds.validInfluencer.email);
    cy.get('#password').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('Incorrect password').should('be.visible');
  });

  it('shows error message for non-existent user', function () {
    cy.intercept('POST', '**/auth/influencer/login', {
      statusCode: 401,
      body: { message: 'User not found', code: 'USER_NOT_FOUND' },
    }).as('loginFail');

    cy.get('#email').type('nonexistent@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('No account found with this email address').should('be.visible');
  });

  it('shows error for role mismatch', function () {
    cy.intercept('POST', '**/auth/brand/login', {
      statusCode: 401,
      body: { message: 'User not found for this role', code: 'ROLE_MISMATCH' },
    }).as('loginFail');

    cy.get('#email').type(this.creds.validInfluencer.email);
    cy.get('#password').type(this.creds.validInfluencer.password);
    cy.get('button[type="submit"]').click();

    cy.wait('@loginFail');
    cy.contains('No brand account found with this email').should('be.visible');
  });

  it('displays signup success dialog when redirected with signup=success', () => {
    cy.visit('/login?signup=success');
    cy.contains('User Created Successfully!').should('be.visible');
    cy.contains('Close').click();
    cy.contains('User Created Successfully!').should('not.exist');
  });

  it('resets form fields on navigation away and back', function () {
    cy.get('#email').type(this.creds.genericEmail);
    cy.get('#password').type(this.creds.genericPassword);

    cy.visit('/signup');
    cy.visit('/login');

    cy.get('#email').should('have.value', '');
    cy.get('#password').should('have.value', '');
  });

  it('button shows loading state during submission', function () {
    cy.intercept('POST', '**/auth/influencer/login', {
      statusCode: 200,
      delay: 1000,
      body: { 
        success: true, 
        access_token: 'fake-token',
        user: { id: '123', role: 'influencer', username: 'testuser' }
      },
    }).as('loginRequest');

    cy.get('#email').type(this.creds.validInfluencer.email);
    cy.get('#password').type(this.creds.validInfluencer.password);
    cy.get('button[type="submit"]').click();

    cy.get('button[type="submit"]').should('contain', 'Loading');
  });
});
