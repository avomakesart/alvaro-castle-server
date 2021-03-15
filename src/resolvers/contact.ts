import { Contact } from '../entities';
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
class ContactInput {
  @Field()
  fullname: string;
  @Field()
  subject: string;
  @Field()
  phone: string;
  @Field()
  message: string;
}

@ObjectType()
class PaginatedContact {
  @Field(() => [Contact])
  contact: Contact[];
  @Field()
  hasMore: boolean;
}

@Resolver(Contact)
export class ContactResolver {
  @Mutation(() => Contact)
  @UseMiddleware(isAuth)
  async createContact(@Arg('input') input: ContactInput): Promise<Contact> {
    const skillFind = Contact.findOne(input.subject);

    if (skillFind) {
      throw new Error('Ups! experience already created');
    }

    return Contact.create({ ...input }).save();
  }

  @Mutation(() => Contact, { nullable: true })
  @UseMiddleware(isAuth)
  async updateContact(
    @Arg('id', () => Int) id: number,
    @Arg('input') input: ContactInput
  ): Promise<Contact | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Contact)
      .set({ ...input })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Query(() => PaginatedContact)
  async contacts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedContact> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const contact = await getConnection().query(
      `
      select c.*
      from contact c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      contact: contact.slice(0, realLimit),
      hasMore: contact.length === realLimitPlusOne,
    };
  }

  @Query(() => Contact, { nullable: true })
  contact(@Arg('id', () => Int) id: number): Promise<Contact | undefined> {
    return Contact.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteContact(@Arg('id', () => Int) id: number): Promise<boolean> {
    await Contact.delete({ id });
    return true;
  }
}
