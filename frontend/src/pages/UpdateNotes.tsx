import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
 

interface UserData {
  id: string;
  email: string;
  name: string;
  dob?: string;
  isOAuth?: boolean;
}

const UpdateNotes: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [, setUser] = useState<UserData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    checkAuthAndInitialize();
  }, [id, navigate]);

  const checkAuthAndInitialize = async () => {
    try {
      // Check if user is logged in using the is-loggedin route
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/is-loggedin`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Authentication check failed');
      }

      const data = await response.json();
      
      if (data.isLoggedIn && data.user) {
        setUser(data.user);
        
        // If id is present, we're editing an existing note
        if (id) {
          setIsEditing(true);
          await fetchNote(id);
        }
      } else {
        // User not logged in, redirect to signin
        navigate('/signin', { replace: true });
        return;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/signin', { replace: true });
      return;
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchNote = async (noteId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/notes/${noteId}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Note not found');
        }
        throw new Error('Failed to fetch note');
      }
      
      const data = await response.json();
      
      // Handle different response structures
      const note = data.note || data;
      if (note && note.title !== undefined && note.description !== undefined) {
        setTitle(note.title);
        setDescription(note.description);
      } else {
        throw new Error('Invalid note data received');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      setError(error instanceof Error ? error.message : 'Failed to load note');
      if (error instanceof Error && error.message === 'Note not found') {
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = isEditing 
        ? `${import.meta.env.VITE_BACKEND_URL}/api/notes/${id}`
        : `${import.meta.env.VITE_BACKEND_URL}/api/notes`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} note`);
      }

      navigate('/', { replace: true });
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} note:`, error);
      setError(`Failed to ${isEditing ? 'update' : 'create'} note`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/', { replace: true });
  };

  if (initialLoading) {
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
          {isEditing ? 'Edit Note' : 'Create Note'}
        </h2>
        <div>
          <a 
            className="text-[#367AFF] underline text-lg cursor-pointer" 
            onClick={handleCancel}
          >
            Cancel
          </a>
        </div>
      </nav>

      <div className="shadow-lg rounded-lg border border-gray-200 bg-white w-full max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
              {error === 'Note not found' && (
                <div className="mt-2 text-sm">Redirecting to dashboard...</div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-lg font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#367AFF] focus:border-transparent"
              placeholder="Enter note title"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-lg font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="border border-gray-300 rounded-lg px-3 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-[#367AFF] focus:border-transparent resize-vertical"
              placeholder="Enter note description"
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#367AFF] rounded-lg text-lg text-white py-3 px-6 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Note' : 'Create Note')}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 rounded-lg text-lg text-white py-3 px-6 flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateNotes;