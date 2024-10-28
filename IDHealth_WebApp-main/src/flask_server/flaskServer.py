from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging

# Configura il logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

flaskServer = Flask(__name__)
CORS(flaskServer)  # Abilita CORS per tutte le origini


model_path = 'all_column_model_.pkl'
scaler_path = 'scaler_all_column.pkl'

try:
    logger.info("Loading model and scaler...")
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    logger.info("Model and scaler loaded successfully.")
except Exception as e:
    logger.error(f"Error loading model or scaler: {e}")
    raise

@flaskServer.route('/predict', methods=['POST'])
def predict():
    logger.info("Received a request for prediction.")
    try:
        
        data = request.json
        logger.debug(f"Request data: {data}")

        
        features = np.array([
            data.get('ID', 0),  
            data.get('settimana', 0),
            data.get('giornoSettimana', 0),
            data.get('Glucosio al Risveglio (07:00)', 0),
            data.get('Glucosio alle 09:30', 0),
            data.get('Glucosio alle 13:00', 0),
            data.get('Glucosio alle 15:00', 0),
            data.get('Glucosio alle 18:00', 0),
            data.get('Glucosio alle 20:00', 0)
        ])

        logger.debug(f"Features before reshaping: {features}")

       
        if len(features) != len(scaler.feature_names_in_):
            raise ValueError(f"Il numero di caratteristiche non è corretto. Deve essere {len(scaler.feature_names_in_)}.")

        features = features.reshape(1, -1)  
        logger.debug(f"Features reshaped: {features}")

        features_scaled = scaler.transform(features)
        logger.debug(f"Features after scaling: {features_scaled}")

        # Predizione
        predictions = model.predict(features_scaled)
        logger.debug(f"Predictions made: {predictions}")

        
        target_labels = [
            'Insulina al Risveglio (07:00)', 'Insulina alle 09:30',
            'Insulina alle 13:00', 'Insulina alle 15:00',
            'Insulina alle 18:00', 'Insulina alle 23:00'
        ]

       
        target_label = 'Insulina al Risveglio (07:00)'
        target_index = target_labels.index(target_label)
        prediction_for_target = predictions[0][target_index]

        logger.debug(f"Prediction for target '{target_label}': {prediction_for_target}")

        return jsonify({'prediction': prediction_for_target})
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting Flask server...")
    flaskServer.run(port=5001)
