describe('Unauthorized Page', () => {
  it('displays unauthorized message and navigates back', () => {
    cy.visit('/unauthorized');
    cy.contains('🚫 Unauthorized Access').should('exist');
    cy.contains('Go Back').click();
    cy.go('back');
  });
});
