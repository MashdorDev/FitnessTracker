import React, {useState} from 'react';

function App() {

  const [exercises, setExercises] = useState([]);
  const [newExercise, setNewExercise] = useState('');

  const handleSumbit = (e) =>{
    e.preventDefault();
    setExercises([...exercises, newExercise]);
    setNewExercise('');
  }

  return(
    <div>
      <h1>Fitness Tracker</h1>

      <form onSubmit={handleSumbit}>
        <input type='text'
        placeholder='type an exercise'
        value={newExercise}
        onChange={(e)=>setNewExercise(e.target.value)}></input>

        <button type='submit'>Add Exercise</button>
      </form>
      <ul>
        {exercises.map((exercise,index)=> (
          <li key={index}>{exercise}</li>
        ))}
      </ul>
    </div>
  )

}


export default App;
