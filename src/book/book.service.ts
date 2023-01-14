import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Book} from "./entities/book.entity";
import {CreateBookDto} from "./dto/create-book.dto";
import {AuthorService} from "../author/author.service";
import {UpdateBookDto} from "./dto/update-book.dto";

@Injectable()
export class BookService {
  constructor(
      @InjectRepository(Book)
      private readonly bookRepository: Repository<Book>,
      private readonly authorService: AuthorService,
  ) {}

  async findAll(): Promise<Book[]> {
    return await this.bookRepository.find();
  }

  async findById(id: number): Promise<Book> {
    return await this.bookRepository.findOneBy({id: id});
  }

  async findByTitle(title: string): Promise<Book[]> {
    return await this.bookRepository.find({ where: { title: title } });
  }

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = new Book();
    book.title = createBookDto.title;
    const author = await this.authorService.findById(createBookDto.authorId);
    book.authors = [author];
    book.price = createBookDto.price;
    return await this.bookRepository.save(book);
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findById(id);
    book.title = updateBookDto.title;
    book.price = updateBookDto.price;
    return await this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    await this.bookRepository.softDelete(id)
  }
}
