import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Updoot, Users, Projects, Categories } from '../entities';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class ProjectInput {
  @Field()
  title: string;
  @Field()
  description: string;
  @Field()
  featuredImage: string;
}

@ObjectType()
class PaginatedProjects {
  @Field(() => [Projects])
  projects: Projects[];
  @Field()
  hasMore: boolean;
}

@Resolver(Projects)
export class ProjectResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() project: Projects) {
    return project.description.slice(0, 50);
  }

  @FieldResolver(() => Users)
  creator(@Root() project: Projects, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(project.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(
    @Root() project: Projects,
    @Ctx() { updootLoader, req }: MyContext
  ) {
    if (!req.session.userId) return null;

    const updoot = await updootLoader.load({
      projectId: project.id,
      userId: req.session.userId,
    });

    return updoot ? updoot.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg('projectId', () => Int) projectId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpdoot = value !== -1;
    const realValue = isUpdoot ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { projectId, userId } });

    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `  update updoot 
          set value = $1
        where "projectId" = $2 and "userId" = $3`,
          [realValue, projectId, userId]
        );

        await tm.query(
          `   update projects 
      set points = points + $1
      where id = $2
  `,
          [2 * realValue, projectId]
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `  insert into updoot ("userId", "projectId", value)
       values ($1, $2, $3);`,
          [userId, projectId, realValue]
        );

        await tm.query(
          `   update projects 
      set points = points + $1
      where id = $2
  `,
          [realValue, projectId]
        );
      });
    }
    return true;
  }

  @Mutation(() => String)
  @UseMiddleware(isAuth)
  async addCategory(
    @Arg('projectId', () => Int) projectId: number,
    @Arg('title', () => String) title: string,
    @Ctx() { req }: MyContext
  ) {
    const hasCategory = title !== '';
    const realValue = hasCategory ? title : '';
    const { userId } = req.session;

    const category = await Categories.findOne({ where: { projectId, userId } });

    if (category && category.title !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `  update categories 
          set value = $1
        where "projectId" = $2`,
          [realValue, projectId]
        );

        await tm.query(
          `   update projects 
      set categories = categories + $1
      where id = $2
  `,
          [realValue, projectId]
        );
      });
    } else if (!category) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `  insert into categories ("projectId", title)
       values ($1, $2);`,
          [projectId, realValue]
        );

        await tm.query(
          `   update projects 
      set categories = categories + $1
      where id = $2
  `,
          [realValue, projectId]
        );
      });
    }
    return true;
  }

  @Query(() => PaginatedProjects)
  async projects(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedProjects> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const projects = await getConnection().query(
      `
      select p.*
      from projects p    
      ${cursor ? `where p."createdAt" < $2` : ''}
      order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      projects: projects.slice(0, realLimit),
      hasMore: projects.length === realLimitPlusOne,
    };
  }

  @Query(() => Projects, { nullable: true })
  project(@Arg('id', () => Int) id: number): Promise<Projects | undefined> {
    return Projects.findOne(id);
  }

  @Mutation(() => Projects)
  @UseMiddleware(isAuth)
  async createProject(
    @Arg('input') input: ProjectInput,
    @Ctx() { req }: MyContext
  ): Promise<Projects> {
    return Projects.create({ ...input, creatorId: req.session.userId }).save();
  }

  @Mutation(() => Projects, { nullable: true })
  @UseMiddleware(isAuth)
  async updateProject(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('description') description: string,
    @Arg('featuredImage') featuredImage: string,
    @Ctx() { req }: MyContext
  ): Promise<Projects | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Projects)
      .set({ title, description, featuredImage })
      .where('id = :id  and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteProject(
    @Arg('id', () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Projects.delete({ id, creatorId: req.session.userId });
    return true;
  }
}
