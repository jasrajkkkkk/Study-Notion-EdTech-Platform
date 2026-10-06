from rest_framework import serializers
from .models import Course, Lesson, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "course", "title", "content", "video_url", "order"]
        read_only_fields = ["course"]


class CourseListSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source="instructor.username", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "description", "category", "tags", "price",
            "is_published", "average_rating", "rating_count",
            "instructor", "instructor_name", "created_at",
        ]
        read_only_fields = ["instructor", "average_rating", "rating_count"]


class CourseDetailSerializer(CourseListSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta(CourseListSerializer.Meta):
        fields = CourseListSerializer.Meta.fields + ["lessons"]
