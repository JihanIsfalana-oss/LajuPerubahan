from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI DATABASE ---
MONGO_URI = "mongodb+srv://falan:Isfalana22_*@cluster0.d4yrajq.mongodb.net/?appName=Cluster0"
DB_NAME = "LajuPerubahanDB"
COLLECTION_NAME = "personil_python_v1"

MOCK_DATA = [
    {
        "name": "Liam", "role": "Lead Vocal", "description": "The Gallagherr",
        "instagram": "https://www.instagram.com/gallaaagherr", "image": "/foto1.jpg"
    },
    {
        "name": "Ernest", "role": "Gitaris", "description": "Ernest Maarteens",
        "instagram": "https://www.instagram.com/ernesstwn", "image": "/foto2.jpg"
    },
    {
        "name": "Falan", "role": "Drummer", "description": "Mr. JayBeat",
        "instagram": "https://www.instagram.com/flnisfalana", "image": "/foto3.jpg"
    },
    {
        "name": "Yurika", "role": "Bassist & Vocal 2", "description": "The Angel Of Laju Perubahan",
        "instagram": "https://www.instagram.com/yurikarmdhni", "image": "/foto1.jpg"
    }
]

# --- CEK KONEKSI DATABASE ---
db_active = False
collection = None

try:
    print("⏳ Menghubungkan ke MongoDB...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
    
    client.server_info() 
    
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    db_active = True
    print("✅ BERHASIL: Terkoneksi ke MongoDB Local.")
    
    try:
        if collection.count_documents({}) == 0:
            collection.insert_many(MOCK_DATA)
            print("🌱 Seeding data awal ke MongoDB berhasil.")
    except Exception as e:
        print(f"⚠️ Gagal Seeding (tapi koneksi ok): {e}")

except ServerSelectionTimeoutError:
    print("⚠️ PERINGATAN: MongoDB Mati/Tidak Ditemukan.")
    print("🚀 Mengaktifkan MODE DEMO (Menggunakan Data Cadangan).")
    db_active = False
except Exception as e:
    print(f"⚠️ Error Lain: {e}")
    print("🚀 Mengaktifkan MODE DEMO.")
    db_active = False

# --- ROUTE UTAMA ---
@app.route('/graphql', methods=['POST'])
def graphql_handler():
    try:
        data = request.get_json()
        query = data.get('query', '')

        if 'getAllMembers' in query:
            members_list = []

            if db_active:
                try:
                    cursor = collection.find({}, {'_id': 0})
                    df = pd.DataFrame(list(cursor))
                    
                    if not df.empty:
                        df = df.replace({np.nan: ""})
                        members_list = df.to_dict(orient='records')
                    else:
                        members_list = MOCK_DATA 
                except Exception as e:
                    print(f"Error baca DB: {e}, switch ke Mock Data.")
                    members_list = MOCK_DATA
            else:
                members_list = MOCK_DATA

            response = {
                "data": {
                    "getAllMembers": members_list
                }
            }
            return jsonify(response), 200

        else:
            return jsonify({"error": "Query tidak dikenal. Gunakan 'getAllMembers'"}), 400

    except Exception as e:
        print(f"Error Server: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Server Python Flask berjalan di port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)