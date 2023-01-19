import {NestFactory} from '@nestjs/core';
import {AppModule} from '../app.module';
import {AuthorService} from "../author/author.service";
import {BookService} from "../book/book.service";


async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authorService = app.get(AuthorService);
    const bookService = app.get(BookService);

    const books = await bookService.findAll();
    const authors = await authorService.findAll();

    for (const book of books) {
        await bookService.remove(book.id);
    }
    for (const author of authors) {
        await authorService.remove(author.id);
    }
    await app.close();
}

bootstrap();
