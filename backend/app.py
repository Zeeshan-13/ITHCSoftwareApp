from flask import Flask, render_template, request, jsonify
from models.software import db, Software, Project, Release, Customer
from flask_migrate import Migrate
from datetime import datetime
import os
from openpyxl import load_workbook
from werkzeug.utils import secure_filename

app = Flask(__name__, 
    template_folder='../frontend/templates',
    static_folder='../frontend/static')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///software.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
migrate = Migrate(app, db)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/projects')
def projects():
    return render_template('projects.html')

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

@app.route('/api/software/import', methods=['POST'])
def import_software():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Please upload an Excel file (.xlsx, .xls)'}), 400

    try:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        workbook = load_workbook(filename=filepath)
        sheet = workbook.active
        
        # Get headers from first row
        headers = [cell.value for cell in sheet[1]]
        
        imported_count = 0
        for row in sheet.iter_rows(min_row=2):
            row_data = {headers[i]: cell.value for i, cell in enumerate(row) if cell.value is not None}
            
            # Map Excel columns to database fields
            software_data = {
                'name': row_data.get('Software'),
                'software_type': row_data.get('Type'),
                'latest_version': row_data.get('Latest Version'),
                'check_url': row_data.get('URL')
            }
            
            # Set last_updated if provided, otherwise use current time
            last_updated = row_data.get('Last Updated')
            if last_updated:
                if isinstance(last_updated, str):
                    try:
                        last_updated = datetime.strptime(last_updated, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        last_updated = datetime.utcnow()
            else:
                last_updated = datetime.utcnow()
            
            # Only process row if required fields are present
            if software_data['name'] and software_data['software_type']:
                new_software = Software(
                    name=software_data['name'],
                    software_type=software_data['software_type'],
                    latest_version=software_data['latest_version'],
                    check_url=software_data['check_url'],
                    last_updated=last_updated
                )
                db.session.add(new_software)
                imported_count += 1
        
        db.session.commit()
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'message': 'Import successful',
            'imported': imported_count
        })

    except Exception as e:
        # Clean up file if it exists
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

# Project routes
@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([p.to_dict() for p in projects])

@app.route('/api/projects', methods=['POST'])
def add_project():
    data = request.json
    new_project = Project(
        name=data['name'],
        description=data.get('description', '')
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify(new_project.to_dict()), 201

@app.route('/api/projects/<int:id>', methods=['PUT'])
def update_project(id):
    project = Project.query.get_or_404(id)
    data = request.json
    project.name = data.get('name', project.name)
    project.description = data.get('description', project.description)
    db.session.commit()
    return jsonify(project.to_dict())

@app.route('/api/projects/<int:id>', methods=['DELETE'])
def delete_project(id):
    project = Project.query.get_or_404(id)
    db.session.delete(project)
    db.session.commit()
    return '', 204

# Release routes
@app.route('/api/projects/<int:project_id>/releases', methods=['POST'])
def add_release(project_id):
    data = request.json
    new_release = Release(
        version=data['version'],
        notes=data.get('notes', ''),
        project_id=project_id
    )
    db.session.add(new_release)
    db.session.commit()
    return jsonify(new_release.to_dict()), 201

@app.route('/api/releases/<int:id>', methods=['DELETE'])
def delete_release(id):
    release = Release.query.get_or_404(id)
    db.session.delete(release)
    db.session.commit()
    return '', 204

# Customer routes
@app.route('/api/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([c.to_dict() for c in customers])

@app.route('/api/customers', methods=['POST'])
def add_customer():
    data = request.json
    new_customer = Customer(
        name=data['name'],
        email=data.get('email', ''),
        contact_person=data.get('contact_person', '')
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify(new_customer.to_dict()), 201

@app.route('/api/projects/<int:project_id>/customers/<int:customer_id>', methods=['POST'])
def add_customer_to_project(project_id, customer_id):
    project = Project.query.get_or_404(project_id)
    customer = Customer.query.get_or_404(customer_id)
    project.customers.append(customer)
    db.session.commit()
    return jsonify(project.to_dict())

@app.route('/api/projects/<int:project_id>/customers/<int:customer_id>', methods=['DELETE'])
def remove_customer_from_project(project_id, customer_id):
    project = Project.query.get_or_404(project_id)
    customer = Customer.query.get_or_404(customer_id)
    project.customers.remove(customer)
    db.session.commit()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)