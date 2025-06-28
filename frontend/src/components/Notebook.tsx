import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '../context/UserDataContext';
import { useProgress } from '../context/ProgressContext';
import Canvas from './Canvas';

// Comment: Define the Attachment interface before Note so it can be referenced
interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  uploadedAt: Date;
}

interface NotebookProps {
  subject: string;
  onClose?: () => void;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  color: string;
  type: 'text' | 'list' | 'mindmap' | 'flashcard';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  attachments?: Attachment[];
  isPinned: boolean;
  studyMode?: {
    lastReviewed?: Date;
    reviewCount: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

interface Slide {
  id: string;
  title: string;
  content: string;
  elements: any[];
  createdAt: Date;
  updatedAt: Date;
  order: number;
}

const NotebookComponent: React.FC<NotebookProps> = ({ subject, onClose }) => {
  // Comment: Remove addNote, updateNote, and deleteNote from useUserData destructure
  const { userData, updateNotebook } = useUserData();
  const { addXp } = useProgress();
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNoteOverview, setShowNoteOverview] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority'>('date');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSlideOverview, setShowSlideOverview] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const notebook = userData.notebooks.find(n => n.id === subject);
  if (!notebook) return null;

  const colors = [
    '#ffffff', '#fef3c7', '#dbeafe', '#d1fae5', '#f3e8ff', '#fee2e2'
  ];

  const noteTemplates = {
    lecture: {
      title: 'Lecture Notes',
      content: '## Key Points\n\n## Important Concepts\n\n## Questions\n\n## Summary',
      type: 'text' as const,
      tags: ['lecture', 'notes']
    },
    assignment: {
      title: 'Assignment',
      content: '## Task\n\n## Requirements\n\n## Progress\n\n## Due Date',
      type: 'list' as const,
      tags: ['assignment', 'todo']
    },
    flashcard: {
      title: 'Flashcards',
      content: 'Front: \nBack: ',
      type: 'flashcard' as const,
      tags: ['study', 'flashcards']
    },
    mindmap: {
      title: 'Mind Map',
      content: 'Central Concept:\n\nMain Branches:\n- \n- \n- ',
      type: 'mindmap' as const,
      tags: ['study', 'mindmap']
    }
  };

  const handleNewNote = (template?: keyof typeof noteTemplates) => {
    const baseNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = template
      ? {
          ...noteTemplates[template],
          color: selectedColor,
          priority: 'medium',
          isPinned: false,
          studyMode: { reviewCount: 0, difficulty: 'medium' },
          attachments: [],
        }
      : {
          title: 'Untitled Note',
          content: '',
          tags: [],
          color: selectedColor,
          type: 'text',
          priority: 'medium',
          isPinned: false,
          studyMode: { reviewCount: 0, difficulty: 'medium' },
          attachments: [],
        };
    setEditingNote({ ...baseNote, id: '', createdAt: new Date(), updatedAt: new Date() } as Note);
    setShowNoteModal(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (!editingNote) return;
    if (editingNote.id) {
      updateNotebook(notebook.id, {
        notes: notebook.notes.map(note =>
          note.id === editingNote.id ? { ...editingNote, updatedAt: new Date() } : note
        ),
      });
    } else {
      updateNotebook(notebook.id, {
        notes: [
          ...notebook.notes,
          { ...editingNote, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() },
        ],
      });
    }
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleCancelNote = () => {
    setShowNoteModal(false);
    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    updateNotebook(notebook.id, {
      notes: notebook.notes.filter(note => note.id !== noteId)
    });
    if (selectedNote === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const togglePinNote = (noteId: string) => {
    const note = notebook.notes.find(n => n.id === noteId);
    if (note) {
      updateNotebook(notebook.id, {
        notes: notebook.notes.map(n =>
          n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
        )
      });
    }
  };

  const updateStudyProgress = (noteId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const note = notebook.notes.find(n => n.id === noteId);
    if (note) {
      updateNotebook(notebook.id, {
        notes: notebook.notes.map(n =>
          n.id === noteId ? {
            ...n,
        studyMode: {
              ...n.studyMode,
          lastReviewed: new Date(),
              reviewCount: (n.studyMode?.reviewCount || 0) + 1,
          difficulty
        }
          } : n
        )
      });
      addXp(5); // XP for reviewing a note
    }
  };

  const filteredNotes = notebook.notes
    .filter(note =>
      (filterTags.length === 0 || filterTags.every(tag => note.tags.includes(tag)))
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    });

  const allTags = Array.from(new Set(notebook.notes.flatMap(note => note.tags)));

  const currentSlide = (notebook.slides && notebook.slides.length > 0)
    ? notebook.slides[currentSlideIndex]
    : null;

  const handleElementsChange = (elements: any[]) => {
    const updatedSlides = [...notebook.slides];
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements
    } as Slide;
    updateNotebook(notebook.id, { slides: updatedSlides });
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${notebook.slides.length + 1}`,
      content: '',
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      order: notebook.slides.length
    };
    updateNotebook(notebook.id, {
      slides: [...notebook.slides, newSlide]
    });
  };

  const handleSlideClick = (index: number) => {
    setCurrentSlideIndex(index);
    setShowSlideOverview(false);
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
      <button
        className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors z-20"
        onClick={onClose}
      >
        <i className="fas fa-times"></i>
      </button>
      <div className="overflow-y-auto max-h-[80vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">{notebook.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className={`fas fa-${viewMode === 'grid' ? 'list' : 'th-large'}`}></i>
          </button>
          <button
            onClick={() => setStudyMode(!studyMode)}
            className={`p-2 rounded-lg transition-colors ${
              studyMode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className="fas fa-graduation-cap"></i>
          </button>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
        <button
          onClick={() => setShowTemplates(true)}
              className="w-full px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          New Note
        </button>
          </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'priority')}
          className="px-4 py-2 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="priority">Sort by Priority</option>
        </select>
        <div className="flex space-x-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilterTags(prev =>
                prev.includes(tag)
                  ? prev.filter(t => t !== tag)
                  : [...prev, tag]
              )}
              className={`px-3 py-1 rounded-full text-sm ${
                filterTags.includes(tag)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {studyMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              style={{ backgroundColor: note.color }}
            >
              <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
                <span className="text-sm text-gray-500">
                  Last reviewed: {note.studyMode?.lastReviewed
                    ? new Date(note.studyMode.lastReviewed).toLocaleDateString()
                    : 'Never'}
                </span>
              </div>
                <p className="text-sm text-gray-600 line-clamp-1 mb-4">{note.content}</p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateStudyProgress(note.id, 'easy')}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm hover:bg-green-200"
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => updateStudyProgress(note.id, 'medium')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-sm hover:bg-yellow-200"
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => updateStudyProgress(note.id, 'hard')}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm hover:bg-red-200"
                  >
                    Hard
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  Reviews: {note.studyMode?.reviewCount || 0}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
          {filteredNotes.map(note => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer max-w-xs overflow-hidden ${
                selectedNote === note.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ backgroundColor: note.color }}
              onClick={() => {
                setSelectedNote(note.id);
                  setShowNoteOverview(true);
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {note.isPinned && (
                    <i className="fas fa-thumbtack text-primary"></i>
                  )}
                    <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    note.priority === 'high' ? 'bg-red-100 text-red-600' :
                    note.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {note.priority}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePinNote(note.id);
                    }}
                    className="p-1 text-gray-400 hover:text-primary"
                  >
                    <i className={`fas fa-thumbtack ${note.isPinned ? 'text-primary' : ''}`}></i>
                  </button>
                </div>
              </div>
                <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  {note.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/50 rounded-full text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showTemplates && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Template</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(noteTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => {
                    handleNewNote(key as keyof typeof noteTemplates);
                    setShowTemplates(false);
                  }}
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-800 mb-2">{template.title}</h4>
                  <p className="text-sm text-gray-600">{template.tags.join(', ')}</p>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

        {showNoteOverview && selectedNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  {notebook.notes.find(n => n.id === selectedNote)?.title}
                </h3>
                <button
                  onClick={() => {
                    setShowNoteOverview(false);
                    setSelectedNote(null);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {notebook.notes.find(n => n.id === selectedNote)?.content}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNoteOverview(false);
                    handleEditNote(notebook.notes.find(n => n.id === selectedNote) as Note);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Note
                </button>
                <button
                  onClick={() => {
                    handleDeleteNote(selectedNote);
                    setShowNoteOverview(false);
                  }}
                  className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Delete Note
                </button>
            </div>
            </motion.div>
          </motion.div>
        )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="backdrop-blur-lg bg-white/30 border border-blue-200 shadow-2xl rounded-2xl p-8 w-full max-w-lg relative animate-scale-in max-h-[90vh] flex flex-col" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
            <button
              className="absolute top-4 right-4 text-blue-600 bg-white/40 hover:bg-blue-100 rounded-full p-2 z-10 shadow"
              onClick={handleCancelNote}
              aria-label="Close note modal"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-bold text-blue-700 mb-4">{editingNote?.id ? 'Edit Note' : 'New Note'}</h2>
            <input
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-blue-200 mb-3 bg-white/60 focus:ring-2 focus:ring-blue-400"
              placeholder="Title"
              value={editingNote?.title || ''}
              onChange={e => setEditingNote(editingNote ? { ...editingNote, title: e.target.value } : null)}
            />
              <textarea
              className="w-full h-32 px-4 py-2 rounded-xl border border-blue-200 mb-3 bg-white/60 focus:ring-2 focus:ring-blue-400"
              placeholder="Content"
              value={editingNote?.content || ''}
              onChange={e => setEditingNote(editingNote ? { ...editingNote, content: e.target.value } : null)}
            />
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="flex-1 px-4 py-2 rounded-xl border border-blue-200 bg-white/60"
                placeholder="Tags (comma separated)"
                value={editingNote?.tags.join(', ') || ''}
                onChange={e => setEditingNote(editingNote ? { ...editingNote, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : null)}
              />
              <select
                className="px-3 py-2 rounded-xl border border-blue-200 bg-white/60"
                value={editingNote?.priority || 'medium'}
                onChange={e => setEditingNote(editingNote ? { ...editingNote, priority: e.target.value as any } : null)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-4">
                      <button
                className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors shadow"
                onClick={handleCancelNote}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow"
                onClick={handleSaveNote}
              >
                {editingNote?.id ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

        <AnimatePresence>
          {showSlideOverview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white z-10"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="text-lg font-semibold">Slides</h3>
                <button
                  onClick={() => setShowSlideOverview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-4 grid grid-cols-4 gap-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
                {notebook.slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => handleSlideClick(index)}
                    className={`aspect-video bg-gray-100 rounded-lg cursor-pointer hover:ring-2 hover:ring-primary transition-all ${
                      index === currentSlideIndex ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <div className="p-2 text-sm font-medium">{slide.title}</div>
                  </div>
                ))}
          </div>
        </motion.div>
      )}
        </AnimatePresence>

        {currentSlide === null ? (
          <div className="text-center text-gray-500 my-8">
            No slides yet. <br />
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              onClick={handleAddSlide}
            >
              Add your first slide
            </button>
          </div>
        ) : (
          <div className="my-8">
            <Canvas
              elements={currentSlide.elements}
              onElementsChange={handleElementsChange}
              onAddElement={() => {}}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="text-lg font-semibold">{currentSlide.title}</div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-gray-100 rounded-lg"
                  onClick={() => setShowSlideOverview(true)}
                >
                  View All Slides
                </button>
                <button
                  className="px-3 py-1 bg-primary text-white rounded-lg"
                  onClick={handleAddSlide}
                >
                  Add Slide
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotebookComponent; 