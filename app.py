from flask import Flask, render_template, request, jsonify
import joblib

app = Flask(__name__)

# Load models
model = joblib.load("models/logistic_model.joblib")
vectorizer = joblib.load("models/tfidf_vectorizer.joblib")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/get_response", methods=["POST"])
def get_response():
    data = request.get_json()
    user_msg = data.get("message", "")

    # Validation
    if not user_msg.strip():
        return jsonify({"error": "Please enter some text!"})

    if len(user_msg.split()) < 20:
        return jsonify({"error": "⚠️ Minimum 20 words required for deep analysis."})

    # SAME preprocessing as training
    clean_msg = user_msg.lower().replace('\n', ' ')

    # Transform
    msg_vector = vectorizer.transform([clean_msg])

    # Predict probabilities
    proba = model.predict_proba(msg_vector)[0]

    def smooth_confidence(p):
        # Clamp extreme probabilities
        p = max(min(p, 0.95), 0.05)
        return round(p * 100, 2)

    human_conf = smooth_confidence(proba[0])
    ai_conf = smooth_confidence(proba[1])


    # ✅ FIX 3: SMART THRESHOLD (3-class logic)
    ai_prob = proba[1]

    if ai_prob >= 0.85:
        label = "AI Generated 🤖"
        is_ai = True
    elif ai_prob <= 0.15:
        label = "Human Written 👤"
        is_ai = False
    else:
        label = "⚠️ Uncertain / Mixed Text"
        is_ai = None

    return jsonify({
        "response": label,
        "human": human_conf,
        "ai": ai_conf,
        "is_ai": is_ai
    })


if __name__ == "__main__":
    app.run(debug=True)