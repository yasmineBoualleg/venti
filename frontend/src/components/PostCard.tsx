import React from 'react';

interface PostCardProps {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  createdAt: string;
  image?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  content,
  author,
  likes,
  comments,
  createdAt,
  image,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        <img
          src={author.avatar}
          alt={author.name}
          className="w-10 h-10 rounded-full mr-3"
          loading='lazy'
        />
        <div>
          <h3 className="font-semibold">{author.name}</h3>
          <p className="text-gray-500 text-sm">{createdAt}</p>
        </div>
      </div>
      <p className="mb-4">{content}</p>
      {image && (
        <img
          src={image}
          alt="Post image"
          className="w-full h-64 object-cover rounded-lg mb-4"
        />
      )}
      <div className="flex items-center space-x-4">
        <button className="flex items-center text-gray-500 hover:text-blue-500">
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {likes}
        </button>
        <button className="flex items-center text-gray-500 hover:text-blue-500">
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {comments}
        </button>
      </div>
    </div>
  );
};

export default PostCard; 