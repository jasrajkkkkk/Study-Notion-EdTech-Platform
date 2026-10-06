from django.db import transaction
from django.db.models import Avg, Count
from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Rating
from .serializers import RatingSerializer
from courses.models import Course
from enrollments.models import Enrollment


def _refresh_course_aggregate(course_id):
    """Recompute average_rating/rating_count under a row lock so two
    concurrent rating submissions can't read-modify-write over each other."""
    with transaction.atomic():
        course = Course.objects.select_for_update().get(pk=course_id)
        agg = Rating.objects.filter(course=course).aggregate(avg=Avg("score"), n=Count("id"))
        course.average_rating = round(agg["avg"] or 0, 2)
        course.rating_count = agg["n"] or 0
        course.save(update_fields=["average_rating", "rating_count"])


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        qs = Rating.objects.select_related("student", "course")
        course_id = self.request.query_params.get("course")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def perform_create(self, serializer):
        course = serializer.validated_data["course"]
        enrolled = Enrollment.objects.filter(
            student=self.request.user, course=course, has_paid=True
        ).exists()
        if not enrolled:
            raise PermissionDenied("Enroll in (and pay for) this course before rating it.")
        serializer.save(student=self.request.user)
        _refresh_course_aggregate(course.id)

    def perform_update(self, serializer):
        rating = serializer.save()
        _refresh_course_aggregate(rating.course_id)

    def perform_destroy(self, instance):
        course_id = instance.course_id
        instance.delete()
        _refresh_course_aggregate(course_id)
