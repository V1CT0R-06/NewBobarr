import { Field, Int, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Movie } from './movie.entity';
import { TVEpisode } from './tvepisode.entity';

@Entity()
@ObjectType()
export class File {
  @Field()
  @PrimaryGeneratedColumn()
  public id!: number;

  @Field()
  @Column('varchar', { unique: true })
  public path!: string;

  @Field((_type) => Int, { nullable: true })
  @Column('int', { nullable: true })
  public tvEpisodeId!: number | null;

  @Field((_type) => Int, { nullable: true })
  @Column('int', { nullable: true })
  public movieId!: number | null;

  @ManyToOne((_type) => Movie, (movie) => movie.files)
  public movie!: Movie;

  @ManyToOne((_type) => TVEpisode, (tvEpisode) => tvEpisode.files)
  public tvEpisode!: TVEpisode;

  @Field()
  @CreateDateColumn()
  public createdAt!: Date;

  @Field()
  @UpdateDateColumn()
  public updatedAt!: Date;
}
