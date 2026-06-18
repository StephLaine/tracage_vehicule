from flask import Flask, Response, render_template_string, request, jsonify
from flask_cors import CORS
from datetime import datetime
import time
import os

app = Flask(__name__)
CORS(app)

# Dictionary to hold the latest frame bytes for each camera
# Example: {"CAM_01": b'...'}
cameras = {}

# List to store received AI detection events
detections = []


@app.route('/upload/<camera_id>', methods=['POST'])
def upload(camera_id):
    global cameras

    # Store or overwrite the latest frame for this camera ID
    cameras[camera_id] = request.data

    return jsonify({
        "status": "success",
        "message": "Frame received",
        "camera_id": camera_id
    }), 200


def generate_frames(camera_id):
    global cameras

    while True:
        if camera_id in cameras and cameras[camera_id] is not None:
            yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + cameras[camera_id] + b'\r\n'
            )
        time.sleep(0.05)  # Limit stream to ~20 FPS and prevent CPU-bound infinite loop


@app.route('/video_feed/<camera_id>')
def video_feed(camera_id):
    response = Response(
        generate_frames(camera_id),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )
    # Disable proxy buffering (e.g. Nginx on Render) so frames are sent immediately
    response.headers['X-Accel-Buffering'] = 'no'
    # Prevent caching
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response


@app.route('/view/<camera_id>')
def view_camera(camera_id):
    html_page = """
    <html>
      <head><title>Camera {{ camera_id }}</title></head>
      <body style="background: #111; color: white; text-align: center; font-family: sans-serif;">
        <h1>Live Feed: {{ camera_id }}</h1>
        <img src="{{ url_for('video_feed', camera_id=camera_id) }}" style="max-width: 100%; border: 2px solid #333;" />
        <br><br><a href="/" style="color: #00bcd4;">Back to Dashboard</a>
      </body>
    </html>
    """
    return render_template_string(html_page, camera_id=camera_id)


@app.route('/api/detections', methods=['POST'])
def receive_detection():
    """
    Receive one AI detection payload from a Jetson/Edge node.
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON payload received"
        }), 400

    required_fields = [
        "camera_id",
        "node_id",
        "license_number",
        "license_number_score",
        "status"
    ]

    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({
            "status": "error",
            "message": "Missing required fields",
            "missing_fields": missing_fields
        }), 400

    # Add server reception timestamp
    data["received_at"] = datetime.utcnow().isoformat()

    # Store detection in memory
    detections.append(data)

    print("Detection received:", data)

    return jsonify({
        "status": "success",
        "message": "Detection received",
        "total_detections": len(detections)
    }), 201


@app.route('/api/detections/batch/', methods=['POST'])
def receive_detection_batch():
    """
    Receive multiple AI detection payloads in this format:
    {
        "detections": [
            { "frame_nmr": 137, "car_id": 1, ... },
            { "frame_nmr": 18, "car_id": 3, ... }
        ]
    }
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No JSON payload received"
        }), 400

    if "detections" not in data:
        return jsonify({
            "status": "error",
            "message": "Missing 'detections' field"
        }), 400

    if not isinstance(data["detections"], list):
        return jsonify({
            "status": "error",
            "message": "'detections' must be a list"
        }), 400

    received_at = datetime.utcnow().isoformat()
    valid_detections = []

    required_fields = [
        "camera_id",
        "license_number",
        "license_number_score",
        "status"
    ]

    for item in data["detections"]:
        missing_fields = [field for field in required_fields if field not in item]

        if missing_fields:
            return jsonify({
                "status": "error",
                "message": "One detection is missing required fields",
                "missing_fields": missing_fields,
                "invalid_detection": item
            }), 400

        item["received_at"] = received_at
        valid_detections.append(item)

    detections.extend(valid_detections)

    print(f"Batch received: {len(valid_detections)} detections")

    return jsonify({
        "status": "success",
        "message": "Batch detections received",
        "received_count": len(valid_detections),
        "total_detections": len(detections)
    }), 201
@app.route('/api/detections', methods=['GET'])
def list_detections():
    """
    Return all received detections.
    Useful for testing.
    """

    return jsonify({
        "status": "success",
        "count": len(detections),
        "detections": detections
    }), 200


@app.route('/api/cameras', methods=['GET'])
def list_cameras():
    """
    Return all active cameras.
    """
    global cameras
    return jsonify({
        "status": "success",
        "cameras": list(cameras.keys())
    }), 200



@app.route('/')
def index():
    html_page = """
    <html>
      <head>
        <title>JeLarIA Dashboard</title>
        <meta http-equiv="refresh" content="5">
        <style>
            body { font-family: sans-serif; background: #1e1e24; color: #fff; padding: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
            .card { background: #2a2a35; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
            .card img { width: 100%; height: auto; border-radius: 4px; background: #000; }
            a { color: #4caf50; text-decoration: none; font-weight: bold; }
            .section { margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #2a2a35; }
            th, td { border: 1px solid #444; padding: 8px; text-align: left; }
            th { background: #333344; }
        </style>
      </head>
      <body>
        <h1>JeLarIA — Jetson Fleet Dashboard</h1>

        <div class="section">
          <h2>Live Camera Streams</h2>
          {% if not cameras %}
              <p>No active camera streams detected yet. Connect a Jetson client to begin.</p>
          {% else %}
              <div class="grid">
              {% for cam_id in cameras.keys() %}
                  <div class="card">
                      <h3>Device: {{ cam_id }}</h3>
                      <img src="{{ url_for('video_feed', camera_id=cam_id) }}" />
                      <p><a href="{{ url_for('view_camera', camera_id=cam_id) }}">Full Screen</a></p>
                  </div>
              {% endfor %}
              </div>
          {% endif %}
        </div>

        <div class="section">
          <h2>Latest AI Detections</h2>
          {% if not detections %}
              <p>No AI detections received yet.</p>
          {% else %}
              <table>
                <tr>
                  <th>Camera</th>
                  <th>Node</th>
                  <th>Plate</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Received At</th>
                </tr>
                {% for detection in detections[-10:] %}
                <tr>
                  <td>{{ detection.get("camera_id", "") }}</td>
                  <td>{{ detection.get("node_id", "") }}</td>
                  <td>{{ detection.get("license_number", "") }}</td>
                  <td>{{ detection.get("license_number_score", "") }}</td>
                  <td>{{ detection.get("status", "") }}</td>
                  <td>{{ detection.get("received_at", "") }}</td>
                </tr>
                {% endfor %}
              </table>
          {% endif %}
        </div>

      </body>
    </html>
    """
    return render_template_string(
        html_page,
        cameras=cameras,
        detections=detections
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, threaded=True)