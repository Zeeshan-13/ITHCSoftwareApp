from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Software(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
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