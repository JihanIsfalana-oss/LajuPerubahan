import time
import psutil
import pandas as pd
import librosa
import numpy as np
import os
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'  
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import scipy.signal

if not hasattr(scipy.signal, 'hann'):
    scipy.signal.hann = scipy.signal.windows.hann

# --- IMPORT LIBRARY AI ---
print("\n⚙️  [AI ENGINE] MEMUAT SYSTEM 'GOD MODE'...")
print("   [1/4] Loading TensorFlow & Keras...")
import tensorflow as tf
from tensorflow import keras

print("   [2/4] Loading PyTorch & TorchVision...")
import torch
import torch.nn as nn
import torch.nn.functional as F

print("   [3/4] Loading Scikit-Learn...")
from sklearn.ensemble import RandomForestClassifier

print("   [4/4] Loading LangChain & Transformers...")
from langchain_huggingface import HuggingFacePipeline
from langchain_core.prompts import PromptTemplate
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

global_tokenizer = None
global_model = None

# ==========================================
# 1. ARSITEKTUR PYTORCH (Giga Brain)
# ==========================================
class GigaBandBrain(nn.Module):
    def __init__(self):
        super(GigaBandBrain, self).__init__()
        # Input Layer
        self.input_layer = nn.Linear(100, 6400)
        # HIDDEN LAYERS (OTAK UTAMA)
        self.hidden1 = nn.Linear(6400, 6400)       
        self.hidden2 = nn.Linear(6400, 6400)       
        self.hidden3 = nn.Linear(6400, 6400)       
        self.hidden4 = nn.Linear(6400, 6400)       
        self.hidden5 = nn.Linear(6400, 6400)     
        # Output
        self.output_layer = nn.Linear(6400, 10)  

    def forward(self, x):
        x = F.relu(self.input_layer(x))
        x = F.relu(self.hidden1(x))
        x = F.relu(self.hidden2(x)) 
        x = F.relu(self.hidden3(x))
        x = F.relu(self.hidden4(x)) 
        x = F.relu(self.hidden5(x)) 
        x = self.output_layer(x)
        return x

# ==========================================
# 2. TENSORFLOW & SKLEARN HELPER
# ==========================================
def build_keras_helper():
    model = keras.Sequential([
        keras.layers.Dense(2048, activation='relu', input_shape=(100,)), 
        keras.layers.Dense(1024, activation='relu'),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    return model

def build_sklearn_logic():
    clf = RandomForestClassifier(n_estimators=100, max_depth=20)
    X_mock = np.random.rand(100, 10)
    y_mock = np.random.randint(0, 2, 100)
    clf.fit(X_mock, y_mock)
    return clf

# ==========================================
# 3. LANGCHAIN (GPT-2 MEDIUM)
# ==========================================
def build_langchain_songwriter():
    global global_tokenizer, global_model
    print("   -> Mendownload/Loading Model 'GPT-2'...")
    model_id = "Qwen/Qwen2.5-1.5B-Instruct" 
    
    global_tokenizer = AutoTokenizer.from_pretrained(model_id)
    global_tokenizer.pad_token = global_tokenizer.eos_token
    
    global_model = AutoModelForCausalLM.from_pretrained(model_id)

    pipe = pipeline(
        "text-generation", 
        model=global_model, 
        tokenizer=global_tokenizer, 
        max_new_tokens=200,       
        do_sample=True,           
        top_k=50,                 
        top_p=0.92,               
        temperature=0.85,         
        repetition_penalty=1.2,   
        no_repeat_ngram_size=2    
    )
    
    llm = HuggingFacePipeline(pipeline=pipe)

    template = """
Song Database:

Title: Tears in Rain
Genre: Rock
Lyrics:
(Lyrics)
Walking down the street alone
Thinking about the love we've known
The rain is falling on my face
Hiding tears in this lonely place

---

Title: {topic}
Genre: {genre}
Lyrics:
(Lyrics)
"""
    
    prompt = PromptTemplate(template=template, input_variables=["topic", "genre"])
    chain = prompt | llm
    return chain

# ==========================================
# INISIALISASI OTOMATIS SAAT DI-IMPORT
# ==========================================
print("\n🔥 MENYALAKAN ENGINE AI (INI AKAN MEMAKAN WAKTU)...")
start_time = time.time()

# Load Models
giga_brain = GigaBandBrain()
keras_engine = build_keras_helper()
sklearn_model = build_sklearn_logic()

# Load LangChain
songwriter_chain = None
try:
    songwriter_chain = build_langchain_songwriter()
    langchain_status = "ONLINE (GPT-2)"
except Exception as e:
    print(f"⚠️ Gagal Load LangChain: {e}")
    langchain_status = "OFFLINE"

end_time = time.time()

print(f"\n✅ AI SYSTEM READY ({end_time - start_time:.2f}s)")
print(f"🧠 Engine Status        : ONLINE")
print(f"🎤 LangChain Status     : {langchain_status}")
print("-" * 50)

# ==========================================
# FUNGSI YANG BISA DIPANGGIL DARI APP.PY
# ==========================================
def analyze_audio_file(file_path):
    try:
        print(f"🎧 Sedang mendengarkan file: {file_path}...")

        y, sr = librosa.load(file_path, duration=100)

        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        tempo = float(tempo[0]) if isinstance(tempo, np.ndarray) else float(tempo)
        rms = librosa.feature.rms(y=y)[0]
        energy_level = np.mean(rms)

        mood = "Unknown"
        if tempo > 120 and energy_level > 0.1:
            mood = "Energetic, High Spirit, Rocking, Attractive"
        elif tempo < 90 and energy_level < 0.05:
            mood = "Sad, Melancholic, Slow, Emotional"
        elif energy_level > 0.2:
            mood = "Aggressive, Loud, Heavy"
        else:
            mood = "Chilled, Relaxed, Pop"

        print(f"   -> Terdeteksi: BPM={tempo:.0f}, Energy={energy_level:.3f}, Mood={mood}")

        prompt_text = f"""
        Analyze this song based on technical data:
        Tempo: {tempo:.0f} BPM
        Energy Level: {energy_level:.3f} (Scale 0-1)
        Detected Vibe: {mood}
        
        Write a short review about how this song feels to the listener.
        Review:
        """

        inputs = global_tokenizer.encode(prompt_text, return_tensors='pt')
        outputs = global_model.generate(inputs, max_new_tokens=100, do_sample=True, temperature=0.8)
        review_text = global_tokenizer.decode(outputs[0], skip_special_tokens=True)

        final_review = review_text.split("Review:")[-1].strip()

        return {
            "status": "success",
            "bpm": f"{tempo:.0f}",
            "mood": mood,
            "review": final_review
        }

    except Exception as e:
        return {"status": "error", "message": f"Gagal analisis audio: {str(e)}"}
def generate_lyrics(topic, genre):
    if not songwriter_chain:
        return {"status": "error", "message": "LangChain Offline"}
    
    try:
        print(f"✍️ AI sedang menulis lirik: {topic}...")

        raw_result = songwriter_chain.invoke({"topic": topic, "genre": genre})

        parts = raw_result.split("(Lyrics)")
        
        if len(parts) > 1:
            clean_lyrics = parts[-1].strip()
        else:
            clean_lyrics = raw_result.strip()

        clean_lyrics = clean_lyrics.split("---")[0].strip()

        return {
            "status": "success",
            "topic": topic,
            "lyrics": "(Lyrics)\n" + clean_lyrics,
            "model": "GPT-2 Medium (Few-Shot)"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}