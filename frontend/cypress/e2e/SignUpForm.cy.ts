describe('SignUp Form', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('renders signup form with correct elements', () => {
    cy.contains('Sign Up').should('be.visible');
    cy.get('#email').should('exist');
    cy.get('#username').should('exist');
    cy.get('#role').should('exist');
    cy.get('#password').should('exist');
    cy.get('#confirmPassword').should('exist');
    cy.get('button[type="submit"]').should('contain', 'Sign Up');
    cy.contains('Already have an account?').should('exist');
    cy.contains('Log In').should('exist');
  });

  it('shows validation errors for empty form submission', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required').should('be.visible');
    cy.contains('Username is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('shows validation error for invalid email', () => {
    cy.get('#email').type('invalid-email');
    cy.get('#username').type('testuser');
    cy.get('#role').select('brand');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email format').should('be.visible');
  });

  it('shows validation error for short username', () => {
    cy.get('#email').type('test@example.com');
    cy.get('#username').type('ab');
    cy.get('#role').select('brand');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Username must be at least 3 characters').should('be.visible');
  });

  it('shows validation error for short password', () => {
    cy.get('#email').type('test@example.com');
    cy.get('#username').type('testuser');
    cy.get('#role').select('brand');
    cy.get('#password').type('short');
    cy.get('#confirmPassword').type('short');
    cy.get('button[type="submit"]').click();
    cy.contains('Password must be at least 8 characters').should('be.visible');
  });

  it('shows validation error for mismatched passwords', () => {
    cy.get('#email').type('test@example.com');
    cy.get('#username').type('testuser');
    cy.get('#role').select('brand');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('differentpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Passwords do not match').should('be.visible');
  });

  it('navigates to login when clicking Log In link', () => {
    cy.contains('Log In').click();
    cy.url().should('include', '/login');
  });

  it('submits successfully with valid data', () => {
    cy.fixture('signupUser').then((user) => {
      cy.intercept('POST', '**/auth/brand/register', {
        statusCode: 201,
        body: { message: 'Registration successful' },
      }).as('register');

      cy.get('#email').type(user.email);
      cy.get('#username').type(user.username);
      cy.get('#role').select(user.role);
      cy.get('#password').type(user.password);
      cy.get('#confirmPassword').type(user.password);
      cy.get('button[type="submit"]').click();

      cy.wait('@register');
      cy.url().should('include', '/login?signup=success');
    });
  });

  it('shows error for duplicate email/username', () => {
    cy.intercept('POST', '**/auth/brand/register', {
      statusCode: 409,
      body: { message: 'Username or email already exists' },
    }).as('registerFail');

    cy.get('#email').type('existing@example.com');
    cy.get('#username').type('existinguser');
    cy.get('#role').select('brand');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerFail');
    cy.contains('Username or email already exists').should('be.visible');
  });

  it('can register as influencer', () => {
    cy.intercept('POST', '**/auth/influencer/register', {
      statusCode: 201,
      body: { message: 'Registration successful' },
    }).as('registerInfluencer');

    cy.get('#email').type('influencer@test.com');
    cy.get('#username').type('newinfluencer');
    cy.get('#role').select('influencer');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerInfluencer');
    cy.url().should('include', '/login?signup=success');
  });

  it('clears form errors after correction', () => {
    cy.get('#email').type('invalid');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email format').should('be.visible');

    cy.get('#email').clear().type('valid@email.com');
    cy.contains('Invalid email format').should('not.exist');
  });
});
