import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import UpdateNotes from '../pages/UpdateNotes';
import SignIn from '../pages/SignIn'; 
import SignUp from '../pages/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/notes/create" element={<UpdateNotes />} />
        <Route path="/notes/edit/:id" element={<UpdateNotes />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;