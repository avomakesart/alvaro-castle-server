import { Skills } from '../entities';
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
class SkillInput {
  @Field()
  title: string;
  @Field()
  image: string;
}

@ObjectType()
class PaginatedSkills {
  @Field(() => [Skills])
  skills: Skills[];
  @Field()
  hasMore: boolean;
}

@Resolver(Skills)
export class SkillResolver {
  @Mutation(() => Skills)
  @UseMiddleware(isAuth)
  async createSkill(@Arg('input') input: SkillInput): Promise<Skills> {
    const skillFind = Skills.findOne(input.title);

    if (skillFind) {
      throw new Error('Ups! skill already created');
    }

    return Skills.create({ ...input }).save();
  }

  @Mutation(() => Skills, { nullable: true })
  @UseMiddleware(isAuth)
  async updateSkill(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: SkillInput
  ): Promise<Skills | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Skills)
      .set({ ...input })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Query(() => PaginatedSkills)
  async skills(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedSkills> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const skills = await getConnection().query(
      `
      select s.*
      from skills s   
      ${cursor ? `where s."createdAt" < $2` : ''}
      order by s."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      skills: skills.slice(0, realLimit),
      hasMore: skills.length === realLimitPlusOne,
    };
  }

  @Query(() => Skills, { nullable: true })
  skill(@Arg('id', () => Int) id: number): Promise<Skills | undefined> {
    return Skills.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteSkill(@Arg('id', () => Int) id: number): Promise<boolean> {
    await Skills.delete({ id });
    return true;
  }
}
