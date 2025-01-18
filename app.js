const express = require("express");

const app = express();

app.use(express.json());

class Book {
    constructor(id, name, title) {
        this.id = id;
        this.name = name;
        this.title = title;
    }

    ChangeTranslation(language) {
        this.title = `${this.title} - (${language})`;
    }

    static validate(book) {
        if (!(book instanceof Book)) return "Book must be an instance of the Book class";
        if (!book.id || typeof book.id !== "number") return "Invalid or missing ID";
        if (!book.name || typeof book.name !== "string") return "Invalid or missing Name";
        if (!book.title || typeof book.title !== "string") return "Invalid or missing Title";

        return null;
    }
}

let books = [];

app.post("/books", (req, res) => {
    const { id, name, title } = req.body;

    if (books.some((book) => book.id === id)) {
        return res.status(400).json({ error: "This book already exists" });
    }

    const newBook = new Book(id, name, title);

    const error = Book.validate(newBook);

    if (error) return res.status(400).json({ error });

    books.push(newBook);
    res.status(201).json({ message: "Book has been added", book: newBook });
});

app.get("/books", (req, res) => {
    res.json(books);
});

app.get("/books/:id", (req, res) => {
    const bookID = parseInt(req.params.id, 10);

    const book = books.find((b) => b.id === bookID);

    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json(book);
});

app.put("/books/:id", (req, res) => {
    const bookID = parseInt(req.params.id, 10);

    const bookIndex = books.findIndex((book) => book.id === bookID);

    if (bookIndex === -1) {
        return res.status(400).json({ error: "Sorry, book not found. Unable to update the book." });
    }

    const { name, title } = req.body;

    if (name) books[bookIndex].name = name;
    if (title) books[bookIndex].title = title;

    res.status(200).json({ message: "Book has been updated", book: books[bookIndex] });
});

app.delete("/books/:id", (req, res) => {
    const bookID = parseInt(req.params.id, 10);

    const bookIndex = books.findIndex((book) => book.id === bookID);

    if (bookIndex === -1) {
        return res.status(400).json({ error: "Sorry, book not found. Unable to delete the book." });
    }

    books.splice(bookIndex, 1);

    return res.status(200).json({ message: "Book has been removed" });
});

app.patch("/books/:id/translation", (req, res) => {
    const bookID = parseInt(req.params.id, 10);
    const { language } = req.body;

    if (!language || typeof language !== "string") {
        return res.status(400).json({ error: "Invalid or missing language" });
    }

    const book = books.find((b) => b.id === bookID);

    if (!book) return res.status(404).json({ error: "Book not found" });

    book.ChangeTranslation(language);

    res.status(200).json({ message: "Translation updated successfully", book });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Library system is started on http://localhost:${port}`);
});
