import './App.css';
import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import io from 'socket.io-client';
import Chat from './pages/chat';

const socket = io.connect('http://localhost:4000');

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    //Check if username and room are stored in localStorage
    const storedUsername = localStorage.getItem('username');
    const storedRoom = localStorage.getItem('room');
    if(storedUsername && storedRoom){
      setUsername(storedUsername);
      setRoom(storedRoom);
    }
  },[]);

  return (
    <Router>
      <div className='App'>
        <Routes>
          
          <Route path='/'
                element={
                  <Home 
                    username={username}
                    setUsername={setUsername}
                    room={room}
                    setRoom={setRoom}
                    socket={socket}
                  />
                }
          />

          <Route path='/chat'
                element={
                  <Chat 
                      username={username}
                      room={room}
                      socket={socket}
                  />
                }
          />

        </Routes>

        


      </div>
    </Router>
  );
}

export default App;
