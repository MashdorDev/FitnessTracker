import express from 'express';
const app = express();
const port = 3000;
import methodOverride from 'method-override';
import {MongoClient} from 'mongodb';

app.use(express.urlencoded());
app.use(express.json());
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));

const uri = "mongodb://localhost:27017/"

let db;

(async function(){
    try{
        const client = await MongoClient.connect(uri,{useUnifiedTopology: true});
        console.log("Connected to MongoDB");
        db = client.db('fitnessTracker');

    } catch(err){
        console.error('Error occurred while connecting to MongoDB:', err);
    }
})();

app.use((req,res,next) =>{
console.log(`${req.method} request for ${req.url}`);
next()
})

app.get('/', (req, res) =>{
    res.send(`<button ><a href="/api/workouts""> workouts </a> </button> <button ><a href="/api/workouts/add""> add workouts </a> </button> `)
})

app.get('/api/workouts', async (req,res) =>{
    try{
        const collection = db.collection('workouts');
        const workouts = await collection.find({}).toArray();
        res.render('workouts', {workouts})
    } catch(err){
        console.error(err);
        res.status(500).send('Error fetching from database');
    }
})

app.get('/api/workouts/add', (req,res) =>{
    res.render('workoutForm.ejs');
})

// we will continue this on thusday
app.get('/api/workouts/add/:id', (req,res) =>{
    res.render('updateWorkout.ejs');
})

app.post('/api/workouts', (req, res)=>{
    const {name} = req.body;

    const newWorkout = {
        name
    }

    const collection = db.collection('workouts');

    collection.insertOne(newWorkout, (err, result) =>{
        if(err){
            console.error(err);
            res.status(500).send('Error saving to database');
            return
        }
        console.log("Saved to database");

    })
    res.redirect('/api/workouts')
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