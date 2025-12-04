"""
config.py - Hyperparameter Configuration

This file contains hyperparameters for the Bayesian spaced repetition algorithm.
Adjust these values to tune the learning and scheduling behavior.
"""

PRIOR_ALPHA = 1.0  # Prior successes
PRIOR_BETA = 1.0   # Prior failures

# for now, we can update 
M_decay = 3

# UNCERTAINTY_FACTOR: controls the balance between expectation and uncertainty 
# when selecting the next card to review.
# - 0.0 = only consider expectation (cards likely to get wrong)
# - 1.0 = only consider uncertainty (cards with fewer observations)
# - 0.5 = equal weighting between both terms
UNCERTAINTY_FACTOR = 0.5
