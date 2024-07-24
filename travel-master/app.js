let express =  require('express');
let app = express();
let mongoose = require('mongoose');
let multer = require('multer');
let cookieParser = require('cookie-parser');
let postsRouter = require('./routes/posts');
let callbackRequestsRouter = require('./routes/callback-requests');
let emailsRouter = require('./routes/emails');
let usersRouter = require('./routes/users');
let Post = require('./models/posts').Post;
let auth = require('./controllers/auth');

app.set('view engine', 'ejs');

//console.log(uniqid());

mongoose.connect('mongodb://localhost/travels', {useUnifiedTopology: true , useNewUrlParser: true});

app.use(express.json());

let imageStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/images'),
    filename: (req, file, cb) => cb(null, file.originalname)
})
//app.use(multer({dest: 'public/images'}).single('imageFile'));
app.use(multer({storage: imageStorage}).single('imageFile'));
app.use(express.static('public'));
app.use(cookieParser()); //so that cookies are automatically generated for every request.

app.use('/posts', postsRouter);
app.use('/callback-requests', callbackRequestsRouter);
/*That means that when the request is made on the route path which starts with /callback-requests,
then it will be redirected callback-requests.js*/
app.use('/emails', emailsRouter);
app.use('/users', usersRouter);


function formatContentText(text) {
  // Convert the markdown-like image syntax to HTML
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const paragraphs = text.split('\n').filter(paragraph => paragraph.trim() !== '');
  
  return paragraphs
      .map(paragraph => {
          // Replace image syntax with <img> tag
          const formattedParagraph = paragraph.replace(imageRegex, '<img src="$1" alt="Image">');
          return `<p>${formattedParagraph}</p>`;
      })
      .join('');
}

// Route to render the sight data
app.get('/sight', async (req, res) => {
    let id = req.query.id;
    let post = await Post.findOne({id: id});
    if (post) {
        res.render('sight', {
            title: post.title,
            imageUrl: post.imageUrl,
            date: post.date, // Format date for rendering
            text: formatContentText(post.text) // Format text for rendering
        });
    } else {
        res.status(404).send('Post not found');
    }
});



app.get('/admin', (req,res) =>{
    /*to read the cookie */
    let token = req.cookies['auth_token'];
    if(token && auth.checkToken(token)){ //token should not be empty!
        res.render('admin');
    }else{
        res.redirect('/login'); //redirecting sign-in page!
    }
})

app.get('/login', (req, res) =>{
    res.render('login');
})


app.listen(3000, () => console.log('Listening 3000...'));