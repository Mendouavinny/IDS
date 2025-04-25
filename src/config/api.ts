// Configuration pour les API et modèles
export const CONFIG = {
  // Clé API pour Mistral (sécurisé en production)
  HF_API_KEY: "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",
  HF_MODEL: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  
  // Configuration pour le modèle IBM
  IBM_ANOMALY_DETECTION: {
    MODEL_ID: "ibm/tsfm-anomaly-detection",
    API_ENDPOINT: "https://api-inference.huggingface.co/models/ibm/tsfm-anomaly-detection",
    INPUT_COLUMNS: ["latency", "bandwidth", "packet_loss"]
  },
  
  PROMPT_TEMPLATE: "[INST] Tu es un expert en cybersécurité. Réponds en français de manière concise et technique à : {QUESTION} [/INST]",
  MAX_TOKENS: 300,
  TEMPERATURE: 0.5
};

// Note: En production, ces clés devraient être dans des variables d'environnement