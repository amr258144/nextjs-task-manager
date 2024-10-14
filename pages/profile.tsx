import { Button, Flex, Text, Box, Input, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { getSession, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: number; // 1: High, 2: Medium, 3: Low
  status: string;
  createdAt: string;
}

export default function Profile() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 3 });
  const [sortByPriority, setSortByPriority] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    };

    fetchTasks();
  }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.description) return;

    const response = await axios.post('/api/tasks', newTask);
    setTasks([...tasks, response.data]);
    setNewTask({ title: '', description: '', priority: 3 });
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    const response = await axios.put(`/api/tasks/${id}`, updatedTask);
    setTasks(
        tasks.map((task) => (task._id === id ? { ...task, ...response.data } : task))
    );
  };

  const deleteTask = async (id: string) => {
    await axios.delete(`/api/tasks/${id}`);
    setTasks(tasks.filter(task => task._id !== id)); // Remove the task from the list
  };

  const sortedTasks = tasks.sort((a, b) => {
    if (sortByPriority) {
      return a.priority - b.priority; // Sort by priority (1: High, 2: Medium, 3: Low)
    } else {
      return a.createdAt < b.createdAt ? 1 : -1; // Sort by descending creation order (_id)
    }
  });

  return (
      <Flex
          w={'50%'}
          mx={'auto'}
          flexDirection={'column'}
          justifyContent={'center'}
          my={5}
          fontFamily={'monospace'}
      >
        {/* Top bar with sign out button */}
        <Flex justifyContent="space-between" alignItems="center" mb={5}>
          <Text>Welcome {session?.user?.name}</Text>
          <Button
              borderRadius={'full'}
              bgColor={'teal'}
              fontFamily={'monospace'}
              color={'white'}
              _hover={{
                bgColor: 'transparent',
                color: 'teal',
                border: '2px solid teal',
              }}
              onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </Flex>

        {/* Task Form */}
        <Box mb={5}>
          <form onSubmit={createTask}>
            <FormControl mb={3}>
              <FormLabel>Title</FormLabel>
              <Input
                  value={newTask.title}
                  name={'taskTitle'}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task Title"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Description</FormLabel>
              <Input
                  value={newTask.description}
                  name={'taskDescription'}
                  onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Task Description"
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Priority</FormLabel>
              <Select
                  value={newTask.priority}
                  name={'taskPriority'}
                  onChange={(e) => setNewTask({ ...newTask, priority: Number(e.target.value) })}
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </Select>
            </FormControl>
            <Button type="submit" colorScheme="teal">
              Add Task
            </Button>
          </form>
        </Box>

        {/* Task List */}
        <Box mb={5}>
          <Button onClick={() => setSortByPriority(!sortByPriority)}>
            Sort by {sortByPriority ? 'Creation Order' : 'Priority'}
          </Button>
        </Box>
        <Box>
          {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => (
                  <Box key={task._id} mb={4} p={4} border="1px solid teal" borderRadius="md">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Box>
                        <Text fontWeight="bold">{task.title}</Text>
                        <Text>{task.description}</Text>
                        <Text>Priority: {task.priority === 1 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}</Text>
                        <Text>Status: {task.status}</Text>
                      </Box>
                      <Box>
                        <Button colorScheme="blue" onClick={() => updateTask(task._id, { status: 'completed' })}>
                          Mark as Completed
                        </Button>
                        <Button colorScheme="red" onClick={() => deleteTask(task._id)}>
                          Delete
                        </Button>
                      </Box>
                    </Flex>
                  </Box>
              ))
          ) : (
              <Text>No tasks available. Please add some tasks.</Text>
          )}
        </Box>
      </Flex>
  );
}

//@ts-ignore
export const getServerSideProps: GetServerSideProps = async (
    context: GetServerSidePropsContext
) => {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};
