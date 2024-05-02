const express = require('express');
require('dotenv').config();
const connectToDatabase = require('./config/db');
const app = express();
const PORT = process.env.PORT || 3000;
const SALT = Number(process.env.SALT);
const SECRET_KEY = process.env.JWT_SECRET;
const morgan = require('morgan');
const AuthMiddleware = require('./middleware/Auth');
const Book = require('./modals/Book');
const User = require('./modals/User');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const RBAC = require('./middleware/Roles');
app.use(morgan('dev'));
app.use(express.json());
connectToDatabase();

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('Hello World');
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
    
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ msg: "Please create your account first." });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        console.log(isPasswordCorrect);
        if (!isPasswordCorrect) {
            return res.status(400).json({ msg: "Incorrect password." });
        }

        const accessToken = jwt.sign({ userId: existingUser._id }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ accessToken });

    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
});

app.post('/signup', async(req, res) => {
    try {
        const { username, email, password,roles } = req.body;
        if (!username || !email || !password || !roles) {
            return res.status(400).json({ message: "Please provide username, email, and password" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT);
        console.log(hashedPassword);

        const newUser = new User({
            username,
            email,
            password : hashedPassword,
            roles,
        });

        await newUser.save();

        res.status(200).send('Successfully registered');
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.post('/book', RBAC(['CREATOR']), AuthMiddleware, async (req, res) => {
    try {
        const { title, author, createdBy } = req.body;
        const newBook = await Book.create({ title, author, createdBy });
        res.status(201).json({ msg: "Book created successfully", book: newBook });
    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
});

app.get('/book', RBAC(['VIEWER', 'VIEW_ALL']), AuthMiddleware, async (req, res) => {
    try {
        if (req.query.old === '1') {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const oldBooks = await Book.find({ createdAt: { $lte: tenMinutesAgo } });
            return res.json(oldBooks);
        }

        if (req.query.new === '1') {
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const newBooks = await Book.find({ createdAt: { $gt: tenMinutesAgo } });
            return res.json(newBooks);
        }

        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
});

app.put('/update/:id', RBAC(['CREATOR']), AuthMiddleware, async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBook) {
            return res.status(404).json({ msg: "Book not found" });
        }
        res.status(200).json({ msg: "Book updated successfully", book: updatedBook });
    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
});

app.delete('/delete/:id', RBAC(['CREATOR']), AuthMiddleware, async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (!deletedBook) {
            return res.status(404).json({ msg: "Book not found" });
        }
        res.status(200).json({ msg: "Book deleted successfully", deletedBook });
    } catch (error) {
        res.status(500).json({ msg: "Server error." });
    }
});

app.listen(PORT, () => {
    console.log("Localhost is Working " + PORT);
});
