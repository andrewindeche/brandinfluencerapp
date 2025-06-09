describe('HomePage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays main headings', () => {
    cy.contains('AFFLUENCER').should('be.visible');
    cy.contains('Influencer MarketPlace').should('be.visible');
    cy.contains('Our Influencers').should('be.visible');
  });

  it('shows the modal when "Get Started" is clicked', () => {
    cy.contains('Get Started').click();
    cy.contains('Log In').should('be.visible');
    cy.contains('Sign Up').should('be.visible');
  });

  it('navigates to login page when "Log In" is clicked', () => {
    cy.contains('Get Started').click();
    cy.contains('Log In').should('be.visible').click();
    cy.url().should('include', '/login');
  });

  it('navigates to signup page when "Sign Up" is clicked', () => {
    cy.contains('Get Started').click();
    cy.contains('Sign Up').should('be.visible').click();
    cy.url().should('include', '/signup');
  });

  it('renders influencer cards with correct names', () => {
    cy.contains('AMY - TIK TOK').should('be.visible');
    cy.contains('BRAD - YOU TUBER').should('be.visible');
    cy.contains('LIZZIE - INSTAGRAM').should('be.visible');
  });
});
