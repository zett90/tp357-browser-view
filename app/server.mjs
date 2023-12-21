import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Serve static files from the 'build' directory
app.use(express.static('./build'));

// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join('./build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
