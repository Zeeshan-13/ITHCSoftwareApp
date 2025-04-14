from flask import Flask, render_template, request, jsonify
from models.software import db, Software
from datetime import datetime
import os

app = Flask(__name__, 
    template_folder='../frontend/templates',
    static_folder='../frontend/static')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///software.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/software', methods=['GET'])
def get_software():
    software_list = Software.query.all()
    return jsonify([s.to_dict() for s in software_list])

@app.route('/api/software', methods=['POST'])
def add_software():
    data = request.json
    new_software = Software(
        name=data['name'],
        software_type=data['software_type'],
        latest_version=data['latest_version'],
        check_url=data['check_url']
    )
    db.session.add(new_software)
    db.session.commit()
    return jsonify(new_software.to_dict()), 201

@app.route('/api/software/<int:id>', methods=['PUT'])
def update_software(id):
    software = Software.query.get_or_404(id)
    data = request.json
    software.name = data.get('name', software.name)
    software.software_type = data.get('software_type', software.software_type)
    software.latest_version = data.get('latest_version', software.latest_version)
    software.check_url = data.get('check_url', software.check_url)
    software.last_updated = datetime.utcnow()
    db.session.commit()
    return jsonify(software.to_dict())

@app.route('/api/software/<int:id>', methods=['DELETE'])
def delete_software(id):
    software = Software.query.get_or_404(id)
    db.session.delete(software)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)