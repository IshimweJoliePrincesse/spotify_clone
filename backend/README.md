# Spotify Clone Backend

This is the backend server for the Spotify Clone application. It provides a RESTful API for managing users, songs, albums, and playlists.

## Features

- User authentication and authorization
- Song management (upload, play, like)
- Album management
- Playlist management
- User profiles and following system
- Search functionality
- File upload support for songs and images

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for file storage
- Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for file storage)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/spotify_clone
   JWT_SECRET=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Songs

- `GET /api/songs` - Get all songs
- `POST /api/songs` - Create a new song (Artist only)
- `GET /api/songs/:id` - Get song by ID
- `PUT /api/songs/:id` - Update song (Artist only)
- `DELETE /api/songs/:id` - Delete song (Artist only)
- `PUT /api/songs/:id/like` - Like/Unlike song

### Albums

- `GET /api/albums` - Get all albums
- `POST /api/albums` - Create a new album (Artist only)
- `GET /api/albums/:id` - Get album by ID
- `PUT /api/albums/:id` - Update album (Artist only)
- `DELETE /api/albums/:id` - Delete album (Artist only)
- `PUT /api/albums/:id/like` - Like/Unlike album
- `PUT /api/albums/:id/songs` - Add song to album
- `DELETE /api/albums/:id/songs/:songId` - Remove song from album

### Playlists

- `GET /api/playlists` - Get all public playlists
- `POST /api/playlists` - Create a new playlist
- `GET /api/playlists/user` - Get user's playlists
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `PUT /api/playlists/:id/follow` - Follow/Unfollow playlist
- `PUT /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist

## Error Handling

The API uses a consistent error response format:

```json
{
  "message": "Error message",
  "stack": "Error stack trace (only in development)"
}
```

## Authentication

Most endpoints require authentication using JWT. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## File Upload

The API supports file uploads for songs and images using Cloudinary. Files should be sent as multipart/form-data.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
