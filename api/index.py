"""
api/index.py - Vercel Serverless Function Entry Point

This file serves as the entry point for Vercel's Python serverless functions.
It imports the Flask app from the backend and exposes it for Vercel to use.

Vercel expects Flask apps to have an 'app' variable that is the Flask instance.
This file re-exports the Flask app from backend/app.py.

Note: For local development, run the backend/app.py directly.
      For Vercel deployment, this file is used as the serverless function entry point.
"""

import sys
import os

# Add the project root to the Python path so we can import from backend
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app from the backend
from backend.app import app

# Vercel expects 'app' to be the WSGI application
# This is already satisfied since we imported 'app' from backend.app

