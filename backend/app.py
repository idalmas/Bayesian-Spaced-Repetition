"""
app.py - Flask Application Entry Point

This is the main Flask application for the Bayesian Spaced Repetition API.
Run this file directly to start the development server.

Usage:
    python app.py

The server will start at http://localhost:5000
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from numpy import dot, linalg, ndarray
from sentence_transformers import SentenceTransformer
import math


# Import hyperparameters (available for use in routes)
import config


app = Flask(__name__)
# Enable CORS for all routes - allows frontend (localhost:3000) to call backend (localhost:5001)
CORS(app)
model = SentenceTransformer("all-MiniLM-L6-v2")

# for now, these exist locally in a dict/arrays, but would be nice to be in a database
# the schema of the all cards dict is: 
#    { 
#        "card_id": {
#            "question": "string",
#            "answer": "string",
#            "alpha": "float",
#            "beta": "float",
#            "embedding": "list of floats",
#        }
#    }
all_cards = {}

# similarity_matrix[card_id_1, card_id_2] is the similarity score between card i and card j (note the grammar)
similarity_matrix = {}

@app.route("/api/health", methods=["GET"])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with status "ok" and HTTP 200
    
    Example response:
        {"status": "ok"}
    """
    return jsonify({"status": "ok"})

@app.route("/api/add_cards", methods=["POST"])
def add_cards():
    """
    Add cards to the database (local for now). Compute the similarity score between each new card and all existing cards.
    """
    data = request.get_json()
    cards = data["cards"]

    for card in cards:
        # add card to all_cards dict
        card_id = len(all_cards)
        card_front = card["front"]
        card_back = card["back"]
        card_embedding = get_embedding(card_front + card_back)
        all_cards[card_id] = {
            "question": card_front,
            "answer": card_back,
            "alpha": config.PRIOR_ALPHA,
            "beta": config.PRIOR_BETA,
            "embedding": card_embedding
        }

        # compute the similarity score between the new card and all existing cards
        # update the similarity matrix
        for existing_card_id, existing_card in all_cards.items():
            similarity_score = compute_similarity(card_embedding, existing_card["embedding"])
            similarity_matrix[card_id, existing_card_id] = similarity_score
            similarity_matrix[existing_card_id, card_id] = similarity_score


    return jsonify({"status": "ok"})


# returns the embedding of the text
def get_embedding(text):
    return model.encode(text)

# compute the cosine similarity between two embeddings
def compute_similarity(embedding1, embedding2):
    return dot(embedding1, embedding2) / (linalg.norm(embedding1) * linalg.norm(embedding2))

@app.route("/api/answer", methods=["POST"])
def answer():
    """
    Given an answer to a card, (given as the card id and true/false), update both the card's alpha and beta
    parameters, as well as all other cards alpha and beta parameters based on similarity scores.
    """
    data = request.get_json()
    card_id = data["card_id"]
    is_correct = data["is_correct"]
   
    for other_id in all_cards:
        similarity_score = similarity_matrix[card_id, other_id]
        update = compute_update(similarity_score)  
        if is_correct:
            all_cards[other_id]["alpha"] += update
        else:
            all_cards[other_id]["beta"] += update

    return jsonify({"status": "ok"})

# get the card that we think are most likely to get wrong 
# to do this, we use the pdf of the beta distribution for each card
# this gets the card id of the card that we think are most likely to get wrong 
def get_next_card_id():
    """
    Select the next card to review based on a combined score of:
    - Low expected mastery (more likely to get wrong)
    - High uncertainty (haven't reviewed much)
    
    Returns:
        int: The card_id of the card with the lowest combined score,
             or None if there are no cards.
    """
    if not all_cards:
        return None

    def score(cid):
        alpha = all_cards[cid]["alpha"]
        beta = all_cards[cid]["beta"]

        # Expectation: lower means more likely to get wrong (want to review)
        expectation = alpha / (alpha + beta)

        # Uncertainty: variance of Beta distribution
        uncertainty = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1))
        
        # Combined score: minimize this
        # Subtract uncertainty so that higher uncertainty leads to lower scores (more likely to be selected)
        return (1 - config.UNCERTAINTY_FACTOR) * expectation - config.UNCERTAINTY_FACTOR * uncertainty

    # Return the card_id with the minimum score (most in need of review)
    return min(all_cards.keys(), key=score)

# this is the exponential decay function that we use to update the alpha and beta parameters
def compute_update(similarity_score):
    return  math.exp(-config.M_decay * (1 - similarity_score))

@app.route("/api/next", methods=["GET"])
def get_next_card():

    if not all_cards:
        return jsonify({"error": "No cards in the database"}), 400
    
    next_card_id = get_next_card_id()
    question = all_cards[next_card_id]["question"]
    answer = all_cards[next_card_id]["answer"]
    return jsonify({"question": question, "answer": answer, "id": next_card_id})

@app.route("/api/all_cards", methods=["GET"])
def get_all_cards():
    """
    Get all cards with their mastery levels.
    
    Mastery is calculated as alpha / (alpha + beta), representing
    the expected probability of getting the card correct.
    
    Returns:
        JSON array of cards with id, question, and mastery (0-1)
    
    Example response:
        [
            {"id": 0, "question": "What is 2+2?", "mastery": 0.75},
            {"id": 1, "question": "Capital of France?", "mastery": 0.5}
        ]
    """
    cards_response = []
    for card_id, card in all_cards.items():
        cards_response.append({
            "id": card_id,
            "question": card["question"],
            "mastery": card["alpha"] / (card["alpha"] + card["beta"])
        })
    return jsonify(cards_response)

if __name__ == "__main__":
    # Run the development server
    # Debug mode enabled for auto-reload and detailed error messages
    # Using port 5001 to avoid conflict with macOS AirPlay Receiver on port 5000
    app.run(debug=True, host="0.0.0.0", port=5001)