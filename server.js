require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const path = require('path');
const mongoose = require('mongoose');
const Book = require('./models/Book'); // Import your Book model

const app = express();
const port = process.env.PORT || 5000; // Use PORT from environment variables or default to 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdatabase';

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const multer = require('multer');

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Bookstore API');
});

// API endpoint to add a book
app.post('/addBook', async (req, res) => {
  const { bookname, author, quantity, price } = req.body;
  const book = new Book({ bookname, author, quantity, price });

  try {
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// API endpoint to delete a book by ID
app.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// API endpoint to edit a book by ID
app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { bookname, author, quantity, price } = req.body;

  try {
    // Ensure `id` is a valid ObjectId before proceeding
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID' });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, {
      bookname,
      author,
      quantity,
      price,
    }, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// API endpoint to list all books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Configure multer storage options
const storage = multer.diskStorage({
  //destination store where the files will be loaded 
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  //filename is the way the file that we want to store will be named timestamp concatened with file original name 
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
//initializing multer
const upload = multer({ storage });

// API endpoint to upload a file
//uplod.silngle(file) means that the the variable name should be named file in the request so the request passes succefully
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({
      message: 'File uploaded successfully',
      file: req.file,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'File upload failed',
      error,
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
