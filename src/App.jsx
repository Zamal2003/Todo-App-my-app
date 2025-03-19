import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Function to generate a random color
const getRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState(''); // Changed inputValue to input for consistency
  const [editIndex, setEditIndex] = useState(null);
  const [bgColor, setBgColor] = useState(getRandomColor());

//fetch task from backend
useEffect(() => {
  fetchTasks();

  
}, [])


  // Automatically change background color every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgColor(getRandomColor());
    }, 3000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, []);

  //fetch task from backend
  const fetchTasks= async ()=>{
    try {
      const response= await fetch("https://todo-app-backend-murex.vercel.app/api/todos");
      const data= await response.json();
      if (Array.isArray(data)) {
        setTasks(data); // Set tasks only if it's an array
      } else {
        console.error("Invalid response format:", data);
        setTasks([]); // Set empty array to prevent crashes
      }
     
    } catch (error) {
      console.log('error fetching tasks');
      setTasks([]);
    }
  }

  const addTodo =async () => {
    if (input.trim() === '') return;
    if (editIndex) {
      //updated task
      await updateTask(editIndex, input);
      
    } else {
      try {
        const response= await fetch('https://todo-app-backend-murex.vercel.app/api/todos', {
          method:'POST',
          headers:{'Content-Type': 'application/json'},
          body:JSON.stringify({task:input}),
        });
        if(response.ok){
          fetchTasks();
        }
      } catch (error) {
        console.log('error adding task:', error);
        
      }
    }
    setInput('');
    setEditIndex(null);
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`https://todo-app-backend-murex.vercel.app/api/todos/${id}`,{
        method:'DELETE',
      });
      fetchTasks();
    } catch (error) {
      console.log('error in deleting task');
      
    }
  };

  const editTask = (id, task) => {
    setInput(task);
    setEditIndex(id);
  };

  //update a task
  const updateTask= async (id, updatedTask)=>{
  try {
    await fetch(`https://todo-app-backend-murex.vercel.app/api/todos/${id}`, {
      method:'PUT',
      headers:{'Content-Type': 'application/json'},
      body:JSON.stringify({task:updatedTask}),
    });
    fetchTasks();
  } catch (error) {
    console.log('error updating task:', error);
    
  }
  }

  return (
    <div
      className="App"
      style={{
        backgroundColor: bgColor,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 2s ease-in-out',
      }}
    >
      <div className="todo-container">
        <h2>Todo List</h2>
        <div className="input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter Tasks"
          />
          <FaPlus
            className="icon add-icon"
            onClick={addTodo}
            title={editIndex !== null ? 'Update Task' : 'Add Task'}
          />
        </div>
        <ul>
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.li
                key={task._id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {task.task}
                <div className="icons">
                  <FaEdit
                    className="icon edit-icon"
                    onClick={() => editTask(task._id, task.task)}
                    title="Edit Task"
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => deleteTask(task._id)}
                    title="Delete Task"
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

export default App;