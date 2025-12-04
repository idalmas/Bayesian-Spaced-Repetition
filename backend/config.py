"""
config.py - Hyperparameter Configuration

This file contains hyperparameters for the Bayesian spaced repetition algorithm.
Adjust these values to tune the learning and scheduling behavior.
"""

PRIOR_ALPHA = 1.0  # Prior successes
PRIOR_BETA = 1.0   # Prior failures

# for now, we can update 
M_decay = 2.501

# Uncertainty factor for selecting next card
UNCERTAINTY_FACTOR = 0.5