from flask import Flask, render_template, request, jsonify
from models.software import db, Software, Project, Release, Customer
from flask_migrate import Migrate
from datetime import datetime
import os
from openpyxl import load_workbook
from werkzeug.utils import secure_filename

def create_app(config_name='development'):
    app = Flask(__name__, 
        template_folder='../frontend/templates',
        static_folder='../frontend/static')

    # Configure database path
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'software.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    if config_name == 'testing':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.config['TESTING'] = True
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Enable debugging
    app.debug = True

    # Database initialization
    db.init_app(app)
    migrate = Migrate(app, db)

    # Create tables only if they don't exist
    with app.app_context():
        db.create_all()

    # Configure upload folder
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'xlsx', 'xls'}
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.before_request
    def log_request_info():
        app.logger.debug('Headers: %s', request.headers)
        app.logger.debug('Body: %s', request.get_data())

    @app.after_request
    def after_request(response):
        # Add CORS headers
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
        
        # Only log response data for non-static files
        if not request.path.startswith('/static/'):
            try:
                app.logger.debug('Response: %s', response.get_data())
            except RuntimeError:
                app.logger.debug('Response: [Binary content]')
        
        return response

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

    @app.route('/api/software/<int:id>', methods=['GET'])
    def get_software_by_id(id):
        software = Software.query.get_or_404(id)
        return jsonify(software.to_dict())

    @app.route('/api/software', methods=['POST'])
    def add_software():
        try:
            data = request.json
            print("Received software data:", data)  # Debug log
            
            required_fields = ['name', 'software_type', 'latest_version']
            for field in required_fields:
                if field not in data or not data[field]:
                    print(f"Missing required field: {field}")  # Debug log
                    return jsonify({'error': f'Missing required field: {field}'}), 400

            # Check for duplicate name first
            existing = Software.query.filter_by(name=data['name']).first()
            if existing:
                print(f"Duplicate software name: {data['name']}")  # Debug log
                return jsonify({'error': 'Software with this name already exists'}), 400

            new_software = Software(
                name=data['name'],
                software_type=data['software_type'],
                latest_version=data['latest_version'],
                check_url=data.get('check_url', ''),
                last_updated=datetime.utcnow()
            )
            db.session.add(new_software)
            db.session.commit()
            print("Successfully added software:", new_software.to_dict())  # Debug log
            return jsonify(new_software.to_dict()), 201
            
        except Exception as e:
            print("Error adding software:", str(e))  # Debug log
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

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
        return jsonify({'message': 'Software deleted successfully'}), 200

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
                
                # Map Excel columns to database fields - updated mapping
                software_data = {
                    'name': row_data.get('name', row_data.get('Software')),  # Try both column names
                    'software_type': row_data.get('software_type', row_data.get('Type')),
                    'latest_version': row_data.get('latest_version', row_data.get('Latest Version')),
                    'check_url': row_data.get('check_url', row_data.get('URL'))
                }
                
                # Only process row if required fields are present
                if software_data['name'] and software_data['software_type'] and software_data['latest_version']:
                    try:
                        new_software = Software(
                            name=software_data['name'],
                            software_type=software_data['software_type'],
                            latest_version=software_data['latest_version'],
                            check_url=software_data['check_url'],
                            last_updated=datetime.utcnow()
                        )
                        db.session.add(new_software)
                        db.session.commit()
                        imported_count += 1
                    except:
                        db.session.rollback()  # Roll back on duplicate name
                
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

    @app.route('/api/software/search', methods=['GET'])
    def search_software():
        q = request.args.get('q', '')
        software_list = Software.query.filter(
            Software.name.ilike(f'%{q}%')
        ).all()
        return jsonify([s.to_dict() for s in software_list])

    # Project routes
    @app.route('/api/projects', methods=['GET'])
    def get_projects():
        projects = Project.query.all()
        return jsonify([p.to_dict() for p in projects])

    @app.route('/api/projects/<int:id>', methods=['GET'])
    def get_project_by_id(id):
        project = Project.query.get_or_404(id)
        return jsonify(project.to_dict())

    @app.route('/api/projects', methods=['POST'])
    def add_project():
        try:
            data = request.json
            print("Received project data:", data)  # Debug log
            
            if 'name' not in data or not data['name']:
                return jsonify({'error': 'Name is required'}), 400

            # Check for duplicate name first
            existing = Project.query.filter_by(name=data['name']).first()
            if existing:
                return jsonify({'error': 'Project with this name already exists'}), 400

            new_project = Project(
                name=data['name'],
                description=data.get('description', ''),
                software_id=data.get('software_id'),
                software_version=data.get('software_version')
            )
            
            db.session.add(new_project)
            db.session.commit()
            print("Successfully added project:", new_project.to_dict())  # Debug log
            return jsonify(new_project.to_dict()), 201
            
        except Exception as e:
            print("Error adding project:", str(e))  # Debug log
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/projects/<int:id>', methods=['PUT'])
    def update_project(id):
        try:
            project = Project.query.get_or_404(id)
            data = request.json
            
            project.name = data.get('name', project.name)
            project.description = data.get('description', project.description)
            if 'software_id' in data:
                project.software_id = data['software_id']
            if 'software_version' in data:
                project.software_version = data['software_version']
            
            db.session.commit()
            return jsonify(project.to_dict())
            
        except Exception as e:
            print("Error updating project:", str(e))
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    @app.route('/api/projects/<int:id>', methods=['DELETE'])
    def delete_project(id):
        project = Project.query.get_or_404(id)
        db.session.delete(project)
        db.session.commit()
        return jsonify({'message': 'Project deleted successfully'}), 200

    @app.route('/api/projects/search', methods=['GET'])
    def search_projects():
        q = request.args.get('q', '')
        projects = Project.query.filter(
            Project.name.ilike(f'%{q}%')
        ).all()
        return jsonify([p.to_dict() for p in projects])

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

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
else:
    app = create_app('testing')