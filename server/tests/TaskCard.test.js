describe('TaskCard', () => {
    test('renders task title and description', () => {
        const task = {
            id: 1,
            title: 'Test Task',
            description: 'Test Description',
            priority: 'high',
            progress: 50
        };

        const wrapper = mount(TaskCard, {
            props: { task }
        });

        expect(wrapper.text()).toContain('Test Task');
        expect(wrapper.text()).toContain('Test Description');
    }); 
});