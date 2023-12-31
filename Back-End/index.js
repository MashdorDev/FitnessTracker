import express from 'express';
import methodOverride from 'method-override';
import mongoose from 'mongoose';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import 'dotenv/config'
const app = express();
const port = 3000;

app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
console.log(process.env.SECRET);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

app.use(passport.initialize());
app.use(passport.session())

const uri = "mongodb://localhost:27017/fitnessTracker"

mongoose
.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> console.log("connected to MongoDB using Mongoose"))
.catch(err => console.log("Could not connect to MongoDB", err));

passport.use(new LocalStrategy(
    async(username, password, done) =>{
         const user = await User.findOne({ username: username })
         console.log(user);
        if(!user || !bcrypt.compareSync(password, user.password)){
            return done(null, false, { message: 'Incorrect username or password.' })
        }
        return done(null, user);
    }
))

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    }).catch(err => {
        done(err);
    });
});


const userSchema = new mongoose.Schema({
    username: String,
    password: String
  });
const User = mongoose.model('User', userSchema);

const workoutSchema = new mongoose.Schema({
    name: String
})

const Workout = mongoose.model('workout', workoutSchema)


app.use((req,res,next) =>{
console.log(`${req.method} request for ${req.url}`);
next()
})

app.get('/', (req, res) =>{
res.render('index',{user: req.user})
})

app.get('/register', (req, res)=>{
    res.render('register');
})

app.post('/register', async(req,res)=>{
    try{
        const hashedPassword = bcrypt.hashSync(req.body.password, 10);

        const newUser = new User({username:req.body.username, password: hashedPassword});
        await newUser.save()
        res.redirect('/login');
    }catch(error){
        console.error(error, "Error has accrued while registering");
        res.redirect('/register')
    }
})

app.get('/login', (req, res)=>{
    res.render('login')
});

app.post('/login', passport.authenticate('local', {failureRedirect:'/login',failureMessage: true, successMessage:true} ), (req, res)=>{
    console.log(req.user);
    res.redirect('/' );
})

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.get('/api/workouts', async (req,res) =>{
    try {
        const workouts = await Workout.find();
        console.log(workouts);
        res.render('workouts', {workouts})
    } catch (error) {
        console.log(error);
        res.status(500).send('Error fetching from database')
    }
})

app.get('/api/workouts/add', (req,res) =>{
    res.render('workoutForm.ejs');
})

app.get('/api/workouts/add/:id', (req,res) =>{
    res.render('updateWorkout.ejs');
})

app.post('/api/workouts', async (req, res)=>{
    const {name} = req.body;

    const workout = new Workout({
        name
    });

    try {
        const result = await workout.save();
        console.log("saved to the database", result);
        res.redirect('/api/workouts');
    } catch (err) {
        console.log(err);
        res.status(500).send('Error saving to database');
    }
})


app.post('/api/workouts/delete/:id', (req,res)=>{

const workoutId = parseInt(req.params.id);

const index = workouts.findIndex(w => w.id === workoutId);

if(index !==-1){
    workouts.splice(index,1);
    // res.status(200).send(`Workout with ID ${workoutId} deleted.`)
    res.redirect('/api/workouts/')
}else{
    res.status(404).send(`Workout with ID ${workoutId} not found.`)
}
})

app.post('/api/workouts/update/:id', (req,res) => {
const workoutId = parseInt(req.params.id);
const updateName = req.body.name

const workout = workouts.find(w => w.id === workoutId);
console.log(workout);
if(workout){
    workout.name = updateName;
    // res.status(200).send(`Workout with ID ${workoutId} updated.`);
	res.redirect('/api/workouts')
}else{
    res.status(404).send(`Workout with ID ${workoutId} not found.`);

}

})


app.listen(port, ()=>{
    console.log(`Server running at http://localhost:${port}/`);
})