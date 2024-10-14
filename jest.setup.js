jest.mock('next-auth/react', () => ({
    getSession: jest.fn(),
}));
