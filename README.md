# Audiovisual Archive Search - Frontend

A modern React frontend for searching through an audiovisual archive using AI-powered semantic search and object detection.

## Features

- **Text Search**: Search videos using natural language descriptions with CLIP embeddings
- **Image Search**: Upload an image to find visually similar content
- **Frame Analysis**: Search through individual video frames for precise results
- **Object Detection**: Find videos containing specific objects using YOLO
- **Real-time Results**: Fast, responsive search with thumbnail previews

## Tech Stack

- React 19.2.0
- Vite 4.5.14 (build tool)
- Axios (API communication)
- React Router DOM 7.11.0

## Prerequisites

- Node.js v16.15.1 or higher
- npm 8.11.0 or higher
- Backend API running at `http://localhost:8000` (see [backend repo](https://github.com/ceciliamaas/audiovisual-archive-filter-backend))

## Installation

```bash
# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env
```

## Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── SearchBar.jsx   # Text search interface
│   ├── ImageUpload.jsx # Image upload/search
│   └── ResultsDisplay.jsx # Search results grid
├── services/           # API service layer
│   └── api.js         # Axios API client
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

## API Integration

The frontend connects to the backend API with the following endpoints:

- `GET /status` - Health check
- `POST /search/text` - Text-based search
- `POST /search/image` - Image-based search
- `GET /videos` - Get video metadata
- `GET /storage/info` - Storage information

See [backend API documentation](https://github.com/ceciliamaas/audiovisual-archive-filter-backend/blob/main/docs/BACKEND_API.md) for details.

## Configuration

Environment variables in `.env`:

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
