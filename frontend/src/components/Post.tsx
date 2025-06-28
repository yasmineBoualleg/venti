import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Comment {
  id: string;
  user: {
    name: string;
    photoURL: string;
  };
  text: string;
  timestamp: Date;
}

interface PostProps {
  id: string;
  user: {
    name: string;
    photoURL: string;
  };
  content: string;
  image?: string;
  imageClassName?: string;
  likes: number;
  shares: number;
  comments: Comment[];
  timestamp: Date;
  isPublic: boolean;
  onDelete?: () => void;
}

const Post = ({
  id,
  user,
  content,
  image,
  imageClassName,
  likes,
  shares,
  comments,
  timestamp,
  isPublic,
  onDelete
}: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post on Venti',
        text: content,
        url: `${window.location.origin}/post/${id}`
      });
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-lg p-6 mb-6"
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={user.photoURL}
            alt={user.name}
            className="h-10 w-10 rounded-full border-2 border-primary"
            loading="lazy"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-600">{format(timestamp, 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isPublic ? (
            <span className="text-sm text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
              Public
            </span>
          ) : (
            <span className="text-sm text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private
            </span>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-gray-600 hover:text-red-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-900 mb-4 whitespace-pre-wrap">{content}</p>
      {image && (
        <img
          src={image}
          alt="Post content"
          className={`rounded-xl object-cover mb-4 ${imageClassName || 'w-full'}`}
          loading="lazy"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t border-white/30 pt-4">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex items-center space-x-2 ${
            isLiked ? 'text-primary' : 'text-gray-600'
          } hover:text-primary transition-colors`}
        >
          <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{likes} likes</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{comments.length} comments</span>
        </button>
        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>{shares} shares</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-white/30 pt-4">
          <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <img
                  src={comment.user.photoURL}
                  alt={comment.user.name}
                  className="h-8 w-8 rounded-full"
                  loading="lazy"
                />
                <div className="flex-1 bg-white/10 rounded-xl p-3">
                  <h5 className="font-semibold text-gray-900">{comment.user.name}</h5>
                  <p className="text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(comment.timestamp, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm mx-4"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Post?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to delete this post?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Post; 