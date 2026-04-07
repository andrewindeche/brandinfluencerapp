describe('HomePage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays main branding', () => {
    cy.contains('AFFLUENCER').should('be.visible');
    cy.contains('Influencer MarketPlace').should('be.visible');
  });

  it('shows Get Started button', () => {
    cy.contains('Get Started').should('be.visible');
  });

  it('shows modal with login and signup buttons when Get Started is clicked', () => {
    cy.contains('Get Started').click();
    cy.contains('Log In').should('be.visible');
    cy.contains('Sign Up').should('be.visible');
  });

  it('navigates to login when clicking Log In in modal', () => {
    cy.contains('Get Started').click();
    cy.contains('Log In').click();
    cy.url().should('include', '/login');
  });

  it('navigates to signup when clicking Sign Up in modal', () => {
    cy.contains('Get Started').click();
    cy.contains('Sign Up').click();
    cy.url().should('include', '/signup');
  });

  it('displays influencer showcase section', () => {
    cy.contains('Our Influencers').should('be.visible');
  });

  it('shows influencer cards with platform labels', () => {
    cy.contains('AMY - TIK TOK').should('be.visible');
    cy.contains('BRAD - YOU TUBER').should('be.visible');
    cy.contains('LIZZIE - INSTAGRAM').should('be.visible');
  });

  it('displays Call to Action section', () => {
    cy.contains('Ready to take your brand to the next level?').should('be.visible');
    cy.contains('Join Now').should('be.visible');
  });

  it('navigates to signup from Join Now CTA', () => {
    cy.contains('Join Now').click();
    cy.url().should('include', '/signup');
  });
});

describe('Unauthorized Page', () => {
  it('displays unauthorized message', () => {
    cy.visit('/unauthorized');
    cy.contains('Unauthorized Access').should('exist');
  });

  it('shows Go Back button', () => {
    cy.visit('/unauthorized');
    cy.contains('Go Back').should('exist');
  });

  it('navigates back when Go Back is clicked', () => {
    cy.visit('/unauthorized');
    cy.contains('Go Back').click();
    cy.url().should('not.include', '/unauthorized');
  });
});
