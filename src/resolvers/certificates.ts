import { Certificates } from '../entities';
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
class CertificateInput {
  @Field()
  title: string;
  @Field()
  issuer: string;
  @Field()
  companyImg: string;
  @Field()
  date: string;
  @Field()
  certId: string;
  @Field()
  certUrl: string;
}

@ObjectType()
class PaginatedCertificates {
  @Field(() => [Certificates])
  certificates: Certificates[];
  @Field()
  hasMore: boolean;
}

@Resolver(Certificates)
export class CertificateResolver {
  @Mutation(() => Certificates)
  @UseMiddleware(isAuth)
  async createCertificate(
    @Arg('input') input: CertificateInput
  ): Promise<Certificates> {
    const newInput = new Array({ ...input });

    const cool = newInput.map((data) => {
      data.issuer === 'Linkedin'
        ? (data.companyImg = data.companyImg =
            'https://res.cloudinary.com/bluecatencode/image/upload/v1613840696/linkedin-logo_yorqtv.png')
        : data.issuer === 'Udemy'
        ? (data.companyImg = data.companyImg =
            'https://res.cloudinary.com/bluecatencode/image/upload/v1613840356/udemy-logo.jpg')
        : '';

      return data;
    });

    return Certificates.create(cool[0]).save();
  }

  @Mutation(() => Certificates, { nullable: true })
  @UseMiddleware(isAuth)
  async updateCertificate(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('issuer') issuer: string,
    @Arg('companyImg') companyImg: string,
    @Arg('date') date: string,
    @Arg('certId') certId: string,
    @Arg('certUrl') certUrl: string
  ): Promise<Certificates | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Certificates)
      .set({ title, issuer, companyImg, date, certId, certUrl })
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return result.raw[0];
  }

  @Query(() => PaginatedCertificates)
  async certificates(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() {}: MyContext
  ): Promise<PaginatedCertificates> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const certificates = await getConnection().query(
      `
      select c.*
      from certificates c   
      ${cursor ? `where c."createdAt" < $2` : ''}
      order by c."createdAt" DESC
      limit $1
    `,
      replacements
    );

    return {
      certificates: certificates.slice(0, realLimit),
      hasMore: certificates.length === realLimitPlusOne,
    };
  }

  @Query(() => Certificates, { nullable: true })
  certificate(
    @Arg('id', () => Int) id: number
  ): Promise<Certificates | undefined> {
    return Certificates.findOne(id);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteCertificate(@Arg('id', () => Int) id: number): Promise<boolean> {
    await Certificates.delete({ id });
    return true;
  }
}
