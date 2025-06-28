from rest_framework import serializers
from .models import University

class UniversitySerializer(serializers.ModelSerializer):
    class Meta:
        model = University
        fields = [
            'id', 'name', 'short_name', 'description', 
            'logo', 'created_at'
        ]
        read_only_fields = ['created_at'] 