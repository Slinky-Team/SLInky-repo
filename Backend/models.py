from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationship to SearchHistory
    search_history = db.relationship('SearchHistory', backref='user', lazy=True)
    
    def get_id(self):
        return str(self.id)

class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    query = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now)
    status = db.Column(db.String(50), default='Completed')
    result_data = db.Column(db.JSON, nullable=True)
    
    # the kind of data returned by the search
    def to_dict(self):
        # Get the associated user
        user = User.query.get(self.user_id)
        username = user.username if user else "Unknown"
        
        return {
            'id': self.id,
            'username': username,
            'query': self.query,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'status': self.status,
            'data': self.result_data
        }
