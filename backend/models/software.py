from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Software(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    software_type = db.Column(db.String(50), nullable=False)
    latest_version = db.Column(db.String(50))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    check_url = db.Column(db.String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'software_type': self.software_type,
            'latest_version': self.latest_version,
            'last_updated': self.last_updated.isoformat(),
            'check_url': self.check_url
        }

# Association table for project-customer relationship
project_customer = db.Table('project_customer',
    db.Column('project_id', db.Integer, db.ForeignKey('project.id'), primary_key=True),
    db.Column('customer_id', db.Integer, db.ForeignKey('customer.id'), primary_key=True)
)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    releases = db.relationship('Release', backref='project', lazy=True)
    customers = db.relationship('Customer', secondary=project_customer, lazy='subquery',
        backref=db.backref('projects', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat(),
            'releases': [release.to_dict() for release in self.releases],
            'customers': [customer.to_dict() for customer in self.customers]
        }

class Release(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    version = db.Column(db.String(50), nullable=False)
    release_date = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'version': self.version,
            'release_date': self.release_date.isoformat(),
            'notes': self.notes,
            'project_id': self.project_id
        }

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    contact_person = db.Column(db.String(100))
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'contact_person': self.contact_person
        }