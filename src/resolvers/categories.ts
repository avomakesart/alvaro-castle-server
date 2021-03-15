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
  UseMiddleware
} from 'type-graphql';
import { getConnection } from 'typeorm';
import { Categories } from '../entities';
import { isAuth } from '../middleware/isAuth';
import { MyContext } from '../types';

@InputType()
class CategoryInput {
  @Field()
  title: string;
}

@ObjectType()
class PaginatedCategories {
  @Field(() => [Categories])
  categories: Categories[];
  @Field()
  hasMore: boolean;
}

@Resolver(Categories)
export class CategoryResolver {
  @Mutation(() => Categories)
  @UseMiddleware(isAuth)
  async createCategory(
    @Arg('input') input: CategoryInput
  ): Promise<Categories> {
    return Categories.create({ ...input }).save();
  }

  @Mutation(() => Categories, { nullable: true })
  @UseMiddleware(isAuth)
  async updateCategory(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string
  ): Promise<Categories | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Categories)
      .set({ title })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Query(() => PaginatedCategories)
  async categories(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedCategories> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const categories = await getConnection().query(
      `
      select c.*
      from categories c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      categories: categories.slice(0, realLimit),
      hasMore: categories.length === realLimitPlusOne,
    };
  }

  @Query(() => Categories, { nullable: true })
  category(@Arg('id', () => Int) id: number): Promise<Categories | undefined> {
    return Categories.findOne(id);
  }
}
