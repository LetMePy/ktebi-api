import {Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';
import {Exclude} from "class-transformer";
import {UserRoleEnum} from 'src/enums/user-role.enum';

@Entity()
export class User {
    @ApiProperty({example: 1})
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({example: 'johndoe'})
    @Column()
    username: string;

    @ApiProperty({example: 'John'})
    @Column()
    firstName: string;

    @ApiProperty({example: 'Doe'})
    @Column()
    lastName: string;

    @ApiProperty({example: 'john.doe@example.com'})
    @Column()
    email: string;

    @ApiProperty()
    @Column()
    @Exclude()
    password: string;

    @ApiProperty()
    @Column()
    @Exclude()
    salt: string;

    @Column({
        type: 'enum',
        default: UserRoleEnum.USER,
        enum: UserRoleEnum,
    })
    role: string;

    @Exclude()
    @CreateDateColumn()
    createdAt: Date;

    @Exclude()
    @UpdateDateColumn()
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn()
    deletedAt: Date;
}
