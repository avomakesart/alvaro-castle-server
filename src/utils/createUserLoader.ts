import DataLoader from 'dataloader';
import { Users } from '../entities/User';

export const createUserLoader = () =>
  new DataLoader<number, Users>(async (userIds) => {
    const users = await Users.findByIds(userIds as number[]);
    const userIdToUser: Record<number, Users> = {};

    users.forEach((u) => (userIdToUser[u.id] = u));
    return userIds.map((userId) => userIdToUser[userId]);
  });
