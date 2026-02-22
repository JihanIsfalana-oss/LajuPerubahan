import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import pandas as pd
import numpy as np

# --- IMPORT AI ENGINE ---
try:
    import ai_engine
    print("✅ AI Engine berhasil diintegrasikan.")
    ai_available = True
except ImportError as e:
    print(f"⚠️ PERINGATAN: ai_engine.py error/tidak ditemukan. {e}")
    ai_available = False
except Exception as e:
    print(f"⚠️ ERROR LAIN MEMUAT AI: {e}")
    ai_available = False

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI DATABASE ---
MONGO_URI = "mongodb+srv://falan:Isfalana22_*@cluster0.d4yrajq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DB_NAME = "LajuPerubahanDB"
COLLECTION_PERSONIL = "personil_python_v1"
COLLECTION_REPERTOIRE = "repertoire" 

# --- MOCK DATA PERSONIL ---
MOCK_DATA = [
    { "name": "Liam", "role": "Lead Vocal", "description": "The Gallagherr", "instagram": "https://www.instagram.com/gallaaagherr", "image": "/foto1.jpg" },
    { "name": "Ernest", "role": "Gitaris", "description": "Ernest Maarteens", "instagram": "https://www.instagram.com/ernesstwn", "image": "/foto2.jpg" },
    { "name": "Falan", "role": "Drummer", "description": "Mr. JayBeat", "instagram": "https://www.instagram.com/flnisfalana", "image": "/foto3.jpg" },
    { "name": "Yurika", "role": "Bassist & Vocal 2", "description": "The Angel Of Laju Perubahan", "instagram": "https://www.instagram.com/yurikarmdhni", "image": "/foto1.jpg" }
]

# --- MOCK DATA REPERTOIRE (Cadangan kalau DB kosong) ---
MOCK_REPERTOIRE = [
    {
        "title": "Top 40 & Hits",
        "icon": "ListMusic",
        "songs": ["Beautiful Things - Benson Boone", "Lose Control - Teddy Swims", "Espresso - Sabrina Carpenter", "Too Sweet - Hozier"]
    },
    {
        "title": "Other Songs",
        "icon": "Guitar",
        "songs": ["I Don't Love You - My Chemical Romance", "Helena - My Chemical Romance", "Green Tinted Sixties Mind - Mr. Big", "Just Take My Heart - Mr. Big"]
    },
    {
        "title": "Indonesian Songs",
        "icon": "Music",
        "songs": ["Cukup Siti Nurbaya - Dewa 19", "Hidup Untukmu Mati Tanpamu - Noah", "Jadi yang Kuinginkan - Vierratale", "Biarlah - Killing Me Inside"]
    }
]

# --- KONEKSI DATABASE ---
db_active = False
db = None

try:
    print("⏳ Menghubungkan ke MongoDB Atlas...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.server_info() 
    
    db = client[DB_NAME]
    db_active = True
    print("✅ BERHASIL: Terkoneksi ke Cloud Database.")
except Exception as e:
    print(f"⚠️ Gagal koneksi DB: {e}")
    print("🚀 Mengaktifkan MODE DEMO (Mock Data).")
    db_active = False

@app.route('/', methods=['GET'])
def home():
    return "<h1>🚀 SERVER LAJU PERUBAHAN IS ONLINE!</h1><p>Gunakan endpoint /create_lyrics atau /analyze_music di Postman.</p>"

# --- ROUTE 1: GRAPHQL HANDLER (Personil & Repertoire) ---
@app.route('/graphql', methods=['POST'])
def graphql_handler():
    try:
        data = request.get_json()
        query = data.get('query', '')

        # 1. HANDLE REQUEST PERSONIL
        if 'getAllMembers' in query:
            members_list = []
            if db_active:
                try:
                    collection = db[COLLECTION_PERSONIL]
                    cursor = collection.find({}, {'_id': 0})
                    df = pd.DataFrame(list(cursor))
                    if not df.empty:
                        df = df.replace({np.nan: ""})
                        members_list = df.to_dict(orient='records')
                    else:
                        members_list = MOCK_DATA 
                except Exception:
                    members_list = MOCK_DATA
            else:
                members_list = MOCK_DATA

            return jsonify({"data": {"getAllMembers": members_list}}), 200

        # 2. HANDLE REQUEST REPERTOIRE (LAGU)
        elif 'getRepertoire' in query:
            repertoire_list = []
            if db_active:
                try:
                    rep_collection = db[COLLECTION_REPERTOIRE]
                    cursor = rep_collection.find({}, {'_id': 0})
                    repertoire_list = list(cursor)
                    if not repertoire_list: 
                        repertoire_list = MOCK_REPERTOIRE
                except Exception:
                    repertoire_list = MOCK_REPERTOIRE
            else:
                repertoire_list = MOCK_REPERTOIRE

            return jsonify({"data": {"getRepertoire": repertoire_list}}), 200

        else:
            return jsonify({"error": "Query tidak valid"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTE 2: ANALISA MUSIK ---
@app.route('/analyze_audio', methods=['POST'])
def analyze_audio():
    if not ai_available:
        return jsonify({"status": "error", "message": "AI Engine Offline"}), 503

    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Mana filenya?"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Nama file kosong"}), 400

    if file:
        filename = "temp_song.mp3"
        file.save(filename)
        result = ai_engine.analyze_audio_file(filename) 
        os.remove(filename)
        return jsonify(result)
    
# --- ROUTE 3: BUAT LIRIK ---
@app.route('/create_lyrics', methods=['POST'])
def create_lyrics():
    if not ai_available:
        return jsonify({"error": "AI Engine Offline"}), 503
    
    data = request.get_json()
    topic = data.get('topic', 'Love')
    genre = data.get('genre', 'Pop')

    result = ai_engine.generate_lyrics(topic, genre)
    
    if result['status'] == 'success':
        return jsonify(result), 200
    else:
        return jsonify(result), 500

if __name__ == '__main__':
    print("🚀 Server Laju Perubahan berjalan di http://0.0.0.0:7860")
    app.run(host='0.0.0.0', port=7860, debug=False)