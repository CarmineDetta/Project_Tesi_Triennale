from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor

# Inizializza l'app Flask con il nome 'trainingServer'
trainingServer = Flask(__name__)

# Configura CORS per accettare richieste da origini specifiche
CORS(trainingServer) # Assumi che React sia in esecuzione sulla porta 3000

# Inizializza il modello come MultiOutputRegressor con RandomForestRegressor come regressore base
base_regressor = RandomForestRegressor(n_estimators=100, random_state=42)
model = MultiOutputRegressor(base_regressor)

@trainingServer.route('/train', methods=['POST'])
def train():
    try:
        # Ricevi i dati dal client
        data = request.json
        
        if not data or 'features' not in data:
            return jsonify({'error': 'Invalid data format'}), 400
        
        df = pd.DataFrame(data['features'])
        
        # Verifica che tutte le colonne dei target siano presenti
        target_labels = [
            'Insulina al Risveglio (07:00)', 'Insulina alle 09:30',
            'Insulina alle 13:00', 'Insulina alle 15:00',
            'Insulina alle 18:00', 'Insulina alle 23:00'
        ]
        
        if not all(label in df.columns for label in target_labels):
            return jsonify({'error': 'Missing one or more target columns in data'}), 400
        
        # Separa le caratteristiche dai target
        X = df.drop(columns=target_labels)
        y = df[target_labels]
        
        # Addestra il modello
        model.fit(X, y)
        
        # Salva il modello aggiornato
        joblib.dump(model, 'all_column_model.pkl')
        
        return jsonify({'message': 'Model trained successfully!'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Esegui il server Flask
    trainingServer.run(port=5000, debug=True)  # Assicurati che il server ascolti sulla porta 5000
