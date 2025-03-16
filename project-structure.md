# Campus Sphere Project Structure

## Backend (Django)

```
backend/
├── campus_sphere/             # Main Django project folder
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py            # Project settings
│   ├── urls.py                # Main URL routing
│   └── wsgi.py
├── api/                       # API app
│   ├── __init__.py
│   ├── admin.py               # Admin panel configuration
│   ├── apps.py
│   ├── middleware.py
│   ├── migrations/            # Database migrations
│   ├── models/                # Data models (split by entity)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── hostel.py
│   │   ├── club.py
│   │   ├── event.py
│   │   ├── chat.py
│   │   └── friend.py
│   ├── serializers/           # DRF serializers
│   │   ├── __init__.py
│   │   ├── user_serializers.py
│   │   ├── course_serializers.py
│   │   ├── hostel_serializers.py
│   │   ├── club_serializers.py
│   │   ├── event_serializers.py
│   │   ├── chat_serializers.py
│   │   └── friend_serializers.py
│   ├── urls.py                # API URL routing
│   ├── views/                 # API views
│   │   ├── __init__.py
│   │   ├── user_views.py
│   │   ├── course_views.py
│   │   ├── hostel_views.py
│   │   ├── club_views.py
│   │   ├── event_views.py
│   │   ├── chat_views.py
│   │   └── friend_views.py
│   └── tests.py
├── manage.py                  # Django management script
└── requirements.txt           # Python dependencies
```

## Frontend (React)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── App.js                 # Main application component
│   ├── index.js               # Application entry point
│   ├── assets/                # Static assets
│   │   ├── images/
│   │   └── styles/
│   ├── components/            # Reusable UI components
│   │   ├── common/
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── user/
│   │   ├── courses/
│   │   ├── hostels/
│   │   ├── clubs/
│   │   ├── events/
│   │   ├── chats/
│   │   └── friends/
│   ├── context/               # React context for state management
│   │   └── AuthContext.js
│   ├── pages/                 # Page components
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Profile.js
│   │   ├── Courses.js
│   │   ├── Hostels.js
│   │   ├── Clubs.js
│   │   ├── Events.js
│   │   ├── Chats.js
│   │   └── Friends.js
│   ├── services/              # API service functions
│   │   ├── api.js             # API configuration
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── course.service.js
│   │   ├── hostel.service.js
│   │   ├── club.service.js
│   │   ├── event.service.js
│   │   ├── chat.service.js
│   │   └── friend.service.js
│   └── utils/                 # Utility functions
│       ├── constants.js
│       ├── formatters.js
│       └── validators.js
├── package.json               # npm dependencies
└── README.md                  # Frontend documentation
```

## Additional Files
- `docker-compose.yml` - Docker configuration for development
- `.env.example` - Example environment variables
- `README.md` - Project documentation
