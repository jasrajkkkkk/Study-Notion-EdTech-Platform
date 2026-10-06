from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.username", read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "student", "student_name", "course", "score", "comment", "created_at"]
        read_only_fields = ["student"]
