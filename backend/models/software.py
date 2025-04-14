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
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    software_id = db.Column(db.Integer, db.ForeignKey('software.id'))
    software_version = db.Column(db.String(50))
    software = db.relationship('Software', backref='projects')
    releases = db.relationship('Release', backref='project', lazy=True)
    customers = db.relationship('Customer', secondary=project_customer, lazy='subquery',
        backref=db.backref('projects', lazy=True))
    
    __table_args__ = (
        db.UniqueConstraint('name', 'software_version', name='unique_project_version'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'software': self.software.to_dict() if self.software else None,
            'software_version': self.software_version,
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

class ITHCSoftware(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    software_id = db.Column(db.Integer, db.ForeignKey('software.id'), nullable=False)
    project_version = db.Column(db.String(50), nullable=False)
    current_software_version = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = db.relationship('Project', backref='ithc_software')
    software = db.relationship('Software', backref='ithc_instances')
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'project_version': self.project_version,
            'software_id': self.software_id,
            'current_software_version': self.current_software_version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'project': self.project.to_dict() if self.project else None,
            'software': self.software.to_dict() if self.software else None
        }