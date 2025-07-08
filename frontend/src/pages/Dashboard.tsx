import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotesCard from '../components/NotesCard';

// Types
interface UserData {
  id: string;
  email: string;
  name: string;
  dob?: string;
  isOAuth?: boolean;
}

interface Note {
  id: string;
  title: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUserAndNotes();
  }, [navigate]);

  const fetchUserAndNotes = async () => {
    try {
      // Check if user is logged in 
      const authResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/is-loggedin`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!authResponse.ok) {
        throw new Error('Authentication check failed');
      }

      const authData = await authResponse.json();
      
      if (authData.isLoggedIn && authData.user) {
        setUser(authData.user);
        
        // Fetch notes for the authenticated user
        const notesResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!notesResponse.ok) {
          const errorData = await notesResponse.json();
          console.error('Notes fetch failed:', errorData);
          throw new Error(`Notes fetch failed: ${errorData.error || 'Unknown error'}`);
        }

        const notesData = await notesResponse.json();
        console.log('Notes data received:', notesData);  
        
        const notesArray = notesData.notes || notesData || [];
        setNotes(notesArray);
      } else {
        throw new Error('User not logged in');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      navigate('/signin', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // Sign out: call logout endpoint 
  const handleSignOut = async () => {
    try {
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/signin', { replace: true });
    }
  };

  // Handle create note
  const handleCreateNote = () => {
    navigate('/notes/create');
  };

  // Handle edit note
  const handleEditNote = (noteId: string) => {
    navigate(`/notes/edit/${noteId}`);
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    setDeleteLoading(noteId);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-2 py-4 sm:px-0">
      <nav className="w-full max-w-2xl flex flex-row justify-between items-center p-4 mb-8 gap-4 bg-transparent shadow-none rounded-none">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-12 h-12" />
        </div>
        <h2
          className="font-medium text-xl flex-1 text-center"
          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-4%' }}
        >
          Dashboard
        </h2>
        <div>
          <a className="text-[#367AFF] underline text-lg cursor-pointer" onClick={handleSignOut}>Sign Out</a>
        </div>
      </nav>
      
      <div
        className="shadow-lg rounded-lg border border-gray-200 bg-white w-full max-w-2xl mb-6 p-6 flex flex-col justify-center"
        style={{ minHeight: 140 }}
      >
        <div className="font-bold text-2xl mb-2 text-left flex items-center gap-4">
          <span>Welcome, {user?.name || ''}</span>
        </div>
        <div className="text-lg text-gray-700 text-left">Email: {user?.email}</div>
      </div>
      
      <div className="w-full max-w-2xl mb-6">
        <button 
          className="bg-[#367AFF] rounded-lg text-lg text-white py-3 w-full hover:bg-[#2a5fd1] transition-colors"
          onClick={handleCreateNote}
        >
          Create Note
        </button>
      </div>
      
      <div className="w-full max-w-2xl flex flex-col gap-4">
        {notes.length === 0 ? (
          <div className="text-gray-500 text-center">No notes found.</div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="relative">
              <NotesCard
                title={note.title}
                description={note.description}
                onEdit={() => handleEditNote(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
                fullWidth
              />
              {deleteLoading === note.id && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-gray-600">Deleting...</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;