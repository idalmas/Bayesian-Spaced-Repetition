# Bayesian Spaced Repetition

A flashcard learning system that uses Bayesian inference and semantic embeddings to optimize your study sessions. Cards with similar content influence each other's mastery scores, so learning one concept helps reinforce related ones.

## Project Structure

```
├── backend/           # Flask API server
│   ├── app.py         # Main Flask application with API routes
│   ├── config.py      # Hyperparameters for the Bayesian model
│   └── requirements.txt
├── frontend/          # Next.js frontend
│   └── app/
│       ├── components/  # React components
│       ├── lib/         # Shared utilities (API config)
│       └── page.tsx     # Main page
├── api/               # Vercel serverless function entry point
│   └── index.py       # Imports Flask app for Vercel deployment
├── vercel.json        # Vercel deployment configuration
├── pyproject.toml     # Python project configuration
└── requirements.txt   # Root-level dependencies for Vercel
```

## Local Development

### Backend

**Option A: With OpenAI embeddings (lightweight, recommended)**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
export OPENAI_API_KEY=your-openai-api-key
python app.py  # Runs on http://localhost:5001
```

**Option B: With local sentence-transformers (no API key needed, but ~800MB)**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements-local.txt
export EMBEDDING_PROVIDER=local
python app.py  # Runs on http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

## Vercel Deployment

This project is configured for Vercel deployment with both the Next.js frontend and Flask backend:

### How it works:
- **Frontend**: Next.js app in `/frontend` is built and served as the main application
- **Backend**: Flask app is deployed as a Python serverless function via `/api/index.py`
- **Routing**: API requests to `/api/*` are handled by the Flask backend

### Deployment Steps:
1. Push to GitHub
2. Import the repository in Vercel
3. **Add Environment Variable**: In Vercel project settings, add:
   - `OPENAI_API_KEY` = your OpenAI API key
4. Vercel will automatically detect the configuration from `vercel.json`

### Embedding Cost
Uses OpenAI's `text-embedding-3-small` at **~$0.02 per 1 million tokens** - essentially free for a flashcard app. A typical card (question + answer) is ~50-100 tokens, so 10,000 cards = ~$0.02.

### ⚠️ Important Limitations

**Serverless State**: The current backend uses in-memory storage (`all_cards`, `similarity_matrix`). In a serverless environment:
- Data will NOT persist between requests (each request may hit a different instance)
- You'll need to add a database (e.g., Vercel Postgres, Supabase, MongoDB Atlas) for production use

### Alternative: Separate Deployments

For production, consider deploying frontend and backend separately:
1. **Frontend on Vercel**: Point the root directory to `/frontend`
2. **Backend on Railway/Render**: Deploy the Flask backend
3. Update `API_BASE_URL` in `/frontend/app/lib/api.ts` to point to your backend URL

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/add_cards` | POST | Add new flashcards |
| `/api/next` | GET | Get next card to review |
| `/api/answer` | POST | Submit answer (correct/incorrect) |
| `/api/all_cards` | GET | Get all cards with mastery levels |

## How the Algorithm Works

1. **Bayesian Priors**: Each card starts with Beta distribution parameters (α, β)
2. **Semantic Embeddings**: Card content is embedded using sentence-transformers
3. **Similarity-Based Updates**: When you answer a card, related cards are also updated based on cosine similarity
4. **Card Selection**: Prioritizes cards with low mastery and high uncertainty
