process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testBook;

beforeEach(async () =>{
    let result = await db.query('INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year) VALUES ("0691161518", "http://a.co/eobPtX2", "TestAuthor", "english", 457, "TestPublisher", "TestBook", 2005) RETURNING isbn, amazon_url, author, language, pages, publisher, title, year');
    testBook = result.rows[0];
});


describe("GET /books", () => {
    test("Gets a list of 1 book", async () => {
        const response = await request(app).get('/books');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            books: [testBook]
        });
    });
});

describe('GET /books/:isbn', () =>{
    test("Get a single book", async () => {
        const response = await request(app).get(`/books/${testBook.isbn}`)
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({book: testBook})
    });

    test('Responds w/ 404 if no book can be found', async () => {
        const response = await request(app).get('/books/69392023')
        expect(response.statusCode).toEqual(404);
    });
});

describe('POST /books', () => {
    test('create a new book', async () => {
        const response = await request(app).post('/books').send({
            isbn: "TestISBN",
            author: "TestAuthor",
            amazon_url: "TestURL",
            language: "english",
            pages: 200,
            publisher: "TestPublisher",
            title: "TestTitle",
            year: 2004
        });
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            book: {isbn: "TestISBN",
            author: "TestAuthor",
            amazon_url: "TestURL",
            language: "english",
            pages: 200,
            publisher: "TestPublisher",
            title: "TestTitle",
            year: 2004}
        });
    });
});

describe('PUT /books/:isbn', () => {
    test('updates a single book', async () => {
        const response = await request(app).put(`/books/${TestBook.isbn}`).send({
            amazon_url: "NewTestURL",
            author: "NewTestAuthor",
            language: "french",
            pages: 145,
            publisher: "NewTestPublisher",
            title:"NewTestTitle",
            year: 2014
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            book: {isbn: TestBook.isbn, 
            amazon_url: "NewTestURL",
            author: "NewTestAuthor",
            language: "french",
            pages: 145,
            publisher: "NewTestPublisher",
            title:"NewTestTitle",
            year: 2014}
        });
    });

    test('responds w/ 404 if no book found', async () => {
        const response =  await request(app).put('/books/4455533');
        expect(response.statusCode).toEqual(404);
    });
});

describe('DELETE /books/:isbn', () => {
    test('delete a single book', async () => {
        const response = await request(app).delete(`/books/${testBook.isbn}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({message: "Book deleted"});
    });
});

afterEach(async () => {
    await db.query('DELETE FROM books');
});

afterAll(async () => {
    await db.end();
});