# venti
all in one platform for university, students, teachers and brands
# Venti - Academic Social Platform

Venti is a comprehensive academic social platform that combines social networking, communication, and educational resources in one place. Built with React, Django, and Firebase, it provides a seamless experience for students and educators.

## Features

- **Social Connect**: Share moments and stay connected with your academic community
- **Instant Messaging**: Direct communication with classmates and professors
- **Virtual Classroom**: Manage assignments, discussions, and course materials
- **Teacher Courses**: Access specialized courses and materials
- **Clubs Management**: Create, join, and manage academic and social clubs
- **Study Groups**: Collaborate with peers in study groups
- **XP Rewards**: Earn achievements for academic progress
- **Event Calendar**: Stay updated with academic events
- **Brands Hub**: Connect with educational brands
- **Institutions**: Access resources from educational institutions

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Django, Django REST Framework
- **Authentication**: Firebase (Google Sign-In)
- **Database**: PostgreSQL
- **Deployment**: TBD

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/venti.git
cd venti
```

2. Set up the frontend:
```bash
cd frontend
npm install
```

3. Set up the backend:
```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Configure environment variables:
- Create `.env` files in both frontend and backend directories
- Add Firebase configuration
- Set up database credentials

5. Run the development servers:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
python manage.py runserver
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all contributors
- Special thanks to the open-source community
