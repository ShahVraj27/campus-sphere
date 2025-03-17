# Campus Sphere

Campus Sphere is a comprehensive campus management and social networking platform for students. It allows students to manage courses, view hostel information, join clubs, participate in events, connect with friends, and chat with each other.

## Features

- **Authentication System**: Registration, login, and profile management
- **Courses**: Browse courses, enroll/unenroll, view details and participants
- **Hostels**: View hostel information, room details, and occupancy
- **Clubs**: Create and join clubs, manage club memberships, organize club events
- **Events**: Browse events, register for events, view event details and participants
- **Friends**: Send/accept friend requests, view friend list
- **Chat System**: Direct messaging, group chats, message history

## Technology Stack

### Backend
- **Django**: Web framework
- **Django REST Framework**: API development
- **MySQL**: Database
- **JWT Authentication**: User authentication and authorization

### Frontend
- **React**: JavaScript library for building the user interface
- **Material-UI**: React component library for consistent styling
- **Axios**: HTTP client for API communication
- **React Router**: For application navigation
- **Context API**: State management

### Deployment(optional)
- **Docker**: Containerization for consistent development and deployment
- **Docker Compose**: Multi-container application orchestration

## Project Structure

```
├── backend/                # Django backend project
│   ├── api/                # API application
│   │   ├── models/         # Data models
│   │   ├── serializers/    # DRF serializers
│   │   ├── views/          # API views
│   ├── campus_sphere/      # Django project settings
├── frontend/               # React frontend project
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
├── docker-compose.yml      # Docker compose configuration
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local frontend development)
- Python (for local backend development)

### Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/campus-sphere.git
   cd campus-sphere
   ```
### Use docker for deployment or setup backend and frontend individually
### Setup using docker
1. Start the application using Docker Compose:(Not Sure of its working)
   ```bash
   docker-compose up
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api
   - Admin interface: http://localhost:8000/admin

### Development Setup

#### Backend (Django)

1. Create a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
   Before starting, make sure you have the following files in your project:

2. Create manage.py in backend/ directory:
   ```bash
   #!/usr/bin/env python
   """Django's command-line utility for administrative tasks."""
      import os
      import sys

      def main():
         """Run administrative tasks."""
         os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_sphere.settings')
         try:
            from django.core.management import execute_from_command_line
         except ImportError as exc:
            raise ImportError(
                  "Couldn't import Django. Are you sure it's installed and "
                  "available on your PYTHONPATH environment variable? Did you "
                  "forget to activate a virtual environment?"
            ) from exc
         execute_from_command_line(sys.argv)

   if __name__ == '__main__':
      main()
   ```

3. Create wsgi.py in backend/campus_sphere/ directory:
   ```bash
   """
   WSGI config for campus_sphere project.
   """

   import os
   from django.core.wsgi import get_wsgi_application

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_sphere.settings')
   application = get_wsgi_application()
      ```
4. Create asgi.py in backend/campus_sphere/ directory:
   ```bash
   """
   ASGI config for campus_sphere project.
   """

   import os
   from django.core.asgi import get_asgi_application

   os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_sphere.settings')
   application = get_asgi_application()
      ```
5. Create .env file in backend/ directory:
   DEBUG=True
   SECRET_KEY=your-secret-development-key
   DB_NAME=campus_sphere
   DB_USER=campus_user
   DB_PASSWORD=campus_password
   DB_HOST=localhost
   DB_PORT=3306

6. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install setuptools djangorestframework-simplejwt
   ```
7. create database using mysql(example):
   ```bash
   CREATE DATABASE campus_sphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'campus_user'@'localhost' IDENTIFIED BY 'campus_password';
   GRANT ALL PRIVILEGES ON campus_sphere.* TO 'campus_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
8. Run migrations and create a superuser:
   ```bash
   python manage.py migrate
   python manage.py makemigrations api
   python manage.py createsuperuser
   ```

5. Start the development backend server:
   ```bash
   python manage.py runserver
   ```

#### Frontend (React)

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Set up environment variables (create .env.local file in the frontend/ directory):
   ```
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/`: Register a new user
- `POST /api/auth/token/`: Obtain JWT tokens
- `POST /api/auth/token/refresh/`: Refresh JWT tokens

### Users
- `GET /api/users/`: List all users
- `GET /api/users/me/`: Get current user's profile
- `PUT /api/users/update_me/`: Update current user's profile

### Courses
- `GET /api/courses/`: List all courses
- `GET /api/courses/<id>/`: Get course details
- `GET /api/courses/<id>/students/`: Get course students
- `POST /api/courses/<id>/enroll/`: Enroll in a course
- `POST /api/courses/<id>/unenroll/`: Unenroll from a course

### Hostels
- `GET /api/hostels/`: List all hostels
- `GET /api/hostels/<id>/`: Get hostel details
- `GET /api/hostels/<id>/rooms/`: Get hostel rooms
- `GET /api/rooms/<id>/occupants/`: Get room occupants

### Clubs
- `GET /api/clubs/`: List all clubs
- `GET /api/clubs/<name>/`: Get club details
- `GET /api/clubs/<name>/members/`: Get club members
- `POST /api/clubs/<name>/join/`: Join a club
- `POST /api/clubs/<name>/leave/`: Leave a club

### Events
- `GET /api/events/`: List all events
- `GET /api/events/<id>/`: Get event details
- `GET /api/events/<id>/participants/`: Get event participants
- `POST /api/events/<id>/register/`: Register for an event
- `POST /api/events/<id>/unregister/`: Unregister from an event

### Friends
- `GET /api/friends/my_friends/`: Get current user's friends
- `GET /api/friend-requests/sent/`: Get sent friend requests
- `GET /api/friend-requests/received/`: Get received friend requests
- `POST /api/friend-requests/`: Send a friend request
- `POST /api/friend-requests/<id>/accept/`: Accept a friend request
- `POST /api/friend-requests/<id>/reject/`: Reject a friend request

### Chat
- `GET /api/chats/`: Get user's chats
- `GET /api/chats/<id>/`: Get chat details
- `GET /api/chats/<id>/messages/`: Get chat messages
- `POST /api/chats/`: Create a new chat
- `POST /api/messages/`: Send a message
- `POST /api/messages/mark_read/`: Mark messages as read

## User Roles and Permissions

Campus Sphere has three user types with different permission levels:

1. **Developer**: Has the highest level of permissions
   - Can access and modify all data
   - Can add/remove users, courses, hostels, etc.
   - Has direct database access

2. **Maintainer**: Administrative role with limited permissions
   - Can manage most data through the application interface
   - Cannot directly access the database
   - Can create/edit courses, hostels, clubs, etc.

3. **Regular User**: Standard student account
   - Can only modify their own profile
   - Can join/leave courses, clubs, events
   - Can send friend requests and chat with friends

## Database Schema

The database is designed with the following main entities:

- **User**: Student information including ID, name, email, password
- **Course**: Academic course information
- **Enrollment**: Relationship between users and courses
- **Hostel**: Student accommodation information
- **Room**: Rooms within hostels
- **Occupancy**: Assignment of users to rooms
- **Club**: Student organizations and clubs
- **ClubMembership**: Relationship between users and clubs
- **Event**: Events organized by clubs
- **EventParticipation**: Users participating in events
- **Friend**: Friendship connections between users
- **FriendRequest**: Pending friendship requests
- **Chat**: Conversations between users
- **Message**: Individual messages within chats
- **GroupChat**: Information for group conversations

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Using Docker (Recommended)

1. Build and run the containers:
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. Run migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
   ```

3. Create a superuser:
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
   ```

### Manual Deployment

#### Backend
1. Set up a production database (MySQL)
2. Configure environment variables for production
3. Collect static files: `python manage.py collectstatic`
4. Run via WSGI/ASGI server like Gunicorn or Daphne
5. Set up Nginx as a reverse proxy

#### Frontend
1. Build the React application: `npm run build`
2. Serve the static files using Nginx or a similar web server

## Acknowledgements

- All contributors who helped build this project
  - Arnav Adivi (2023A7PS0466G)
  - Siddhant Kedia (2023A7PS0375G)
  - Jayant Choudhary (2023A7PS0404G)
  - Vraj Shah (2023A7PS0478G)
  - Tejas Singh Sodhi (2023A7PS0363G)
  - Swayam Lakhotia (2023A7PS0368G)