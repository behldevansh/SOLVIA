import datetime

from mongoengine import Document, StringField, EmailField, DateTimeField, ReferenceField, ListField, UUIDField, ObjectIdField, DictField

class Predict(Document):
    coginto_id = UUIDField(required=True)
    name = StringField(required=True)
    start_date = DateTimeField(required=True)
    end_date = DateTimeField(required=True)
    created_at = DateTimeField(default=datetime.datetime.now)
    data = ListField(
        DictField(
            fields={
                'ac_power': StringField(),
                'metric_date': StringField()
            }
        )
    )
    meta = {
        'collection': 'predicts',
        'indexes': [
            'user',
        ]
    }
    