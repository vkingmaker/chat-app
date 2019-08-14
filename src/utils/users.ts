interface User {
  id: number;
  username: string;
  room: string;
}
const users: User[] = [];

export const addUser = ({ id, username, room }: User) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    };
  }

  // Check for existing user
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

export const removeUser = (id: number): User | undefined => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

export const getUser = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUsersInRoom = (room: string): User[] => {
  room = room.trim().toLowerCase();
  return users.filter(user => user.room === room);
};
