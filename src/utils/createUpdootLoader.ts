import DataLoader from 'dataloader';
import { Updoot } from '../entities';

export const createUpdootLoader = () =>
  new DataLoader<{ projectId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootIdToUpdoot: Record<string, Updoot> = {};

      updoots.forEach(
        (updoot) =>
          (updootIdToUpdoot[`${updoot.userId}|${updoot.projectId}`] = updoot)
      );
      return keys.map((key) => updootIdToUpdoot[`${key.userId}|${key.projectId}`]);
    }
  );
