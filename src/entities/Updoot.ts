import { ObjectType } from 'type-graphql';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Projects, Users } from '.';

@ObjectType()
@Entity()
export class Updoot extends BaseEntity {
  @Column({ type: 'int' })
  value: number;

  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => Users, (user) => user.updoots)
  user: Users;

  @PrimaryColumn()
  projectId: number;

  @ManyToOne(() => Projects, (project) => project.updoots, {
    onDelete: 'CASCADE',
  })
  project: Projects;
}
