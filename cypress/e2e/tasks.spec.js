describe('Task Manager', () => {
    it('logs in and shows the task list', () => {
        cy.visit('/');

        cy.get('button[type="button"]').click();

        // Assuming you have an email and password for login
        cy.get('input[name="email"]').type('test@example.com');
        cy.get('input[name="password"]').type('password');
        cy.get('button[type="submit"]').click();

        // Assert successful login
        cy.url().should('include', '/profile');
        cy.contains('Welcome').should('be.visible');

        cy.get('input[name="taskTitle"]').type('Test Task');
        cy.get('input[name="taskDescription"]').type('This is a test task.');
        cy.get('select[name="taskPriority"]').select('High');
        // Intercepting the add task request to wait for it
        cy.intercept('POST', '/api/tasks').as('addTask'); // Adjust the URL as needed
        cy.get('button').contains('Add Task').click();
        cy.wait('@addTask');

        // Verify that the task was added
        cy.get('.chakra-text').should('contain', 'Test Task');
        cy.get('.chakra-text').should('contain', 'This is a test task.');

        // Intercept the request to update the task status
        cy.intercept('PUT', '/api/tasks/*').as('updateTask');

        cy.contains('Mark as Completed').click();
        cy.wait('@updateTask'); // Wait for the update request to complete

        // Log the current HTML to debug the state after the click
        cy.get('body').then((body) => {
            console.log(body.html());
        });

        // Assert the task status is updated
        cy.contains('Status: completed', { timeout: 10000 }).should('be.visible');
    });
});
