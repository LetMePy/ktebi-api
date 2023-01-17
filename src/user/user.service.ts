import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserSubscribeDto } from './dto/subscribe-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    if ((await this.search({ username: createUserDto.username })).length > 0) {
      throw new BadRequestException(
        `User with username ${createUserDto.username} already exists`,
      );
    }
    if ((await this.search({ username: createUserDto.email })).length > 0) {
      throw new BadRequestException(
        `User with email ${createUserDto.email} already exists`,
      );
    }

    const user = new User();
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.password = createUserDto.password;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id: id });
    if (user == null) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async search(options: {
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    if (options.username) {
      queryBuilder.andWhere('user.username LIKE :username', {
        username: `%${options.username}%`,
      });
    }
    if (options.firstName) {
      queryBuilder.andWhere('user.firstName LIKE :firstName', {
        firstName: `%${options.firstName}%`,
      });
    }
    if (options.lastName) {
      queryBuilder.andWhere('user.lastName LIKE :lastName', {
        lastName: `%${options.lastName}%`,
      });
    }
    if (options.email) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${options.email}%`,
      });
    }
    return queryBuilder.getMany();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      user.password = updateUserDto.password;
    }
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    await this.userRepository.save(user);
    return await this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async register(userData: UserSubscribeDto): Promise<Partial<User>> {
    const user = this.userRepository.create({ ...userData });
    user.salt = await bcrypt.gensalt();
    user.password = await bcrypt.hash(user.password, user.salt);
    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new ConflictException();
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
    };
  }

  async login(credentials: LoginCredentialsDto): Promise<Partial<User>> {
    {
      const { username, password } = credentials;
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.username= :username or user.email= :email', {
          username,
        })
        .getOne();

      if (!user) throw new NotFoundException();

      const hashedPassword = await bcrypt.hash(password, user.salt);
      if (hashedPassword === user.password)
        return {
          username,
          email: user.email,
          role: user.role,
        };
    }
  }
}
