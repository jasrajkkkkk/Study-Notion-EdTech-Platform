from rest_framework import serializers
from .models import Enrollment
from courses.serializers import CourseListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    course_detail = CourseListSerializer(source="course", read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id", "student", "course", "course_detail",
            "enrolled_at", "has_paid", "progress_percent",
        ]
        read_only_fields = ["student", "has_paid"]
