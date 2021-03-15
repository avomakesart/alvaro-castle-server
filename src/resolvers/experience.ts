import { Experience } from '../entities';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';
import {
  Arg,
  Ctx,
  Field,
  //   FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  //   Root,
  UseMiddleware,
} from 'type-graphql';
import { getConnection } from 'typeorm';

@InputType()
class ExperienceInput {
  @Field()
  company: string;
  @Field()
  position: string;
  @Field()
  period: string;
}

@ObjectType()
class PaginatedExperience {
  @Field(() => [Experience])
  experience: Experience[];
  @Field()
  hasMore: boolean;
}

@Resolver(Experience)
export class ExperienceResolver {
  @Mutation(() => Experience)
  @UseMiddleware(isAuth)
  async createExperience(
    @Arg('input') input: ExperienceInput
  ): Promise<Experience> {
    const skillFind = Experience.findOne(input.company);

    if (skillFind) {
      throw new Error('Ups! experience already created');
    }

    return Experience.create({ ...input }).save();
  }

  @Mutation(() => Experience, { nullable: true })
  @UseMiddleware(isAuth)
  async updateExperience(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: ExperienceInput
  ): Promise<Experience | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Experience)
      .set({ ...input })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Query(() => PaginatedExperience)
  async experiences(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedExperience> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const experience = await getConnection().query(
      `
      select e.*
      from experience e   
      ${cursor ? `where e."createdAt" < $2` : ''}
      order by e."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      experience: experience.slice(0, realLimit),
      hasMore: experience.length === realLimitPlusOne,
    };
  }

  @Query(() => Experience, { nullable: true })
  experience(
    @Arg('id', () => Int) id: number
  ): Promise<Experience | undefined> {
    return Experience.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteExperience(@Arg('id', () => Int) id: number): Promise<boolean> {
    await Experience.delete({ id });
    return true;
  }
}
