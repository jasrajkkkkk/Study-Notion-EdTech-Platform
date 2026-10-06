from django.db import IntegrityError, transaction
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Enrollment
from .serializers import EnrollmentSerializer
from courses.models import Course


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related("course")

    def create(self, request, *args, **kwargs):
        course_id = request.data.get("course")
        course = Course.objects.filter(pk=course_id, is_published=True).first()
        if course is None:
            return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)

        # Free courses enroll immediately; paid ones start unpaid and are
        # flipped to has_paid=True by payments.views after Razorpay verifies
        # the signature. select_for_update + the DB UniqueConstraint on
        # (student, course) together make this safe if the same student
        # double-clicks "Enroll" from two tabs at once.
        try:
            with transaction.atomic():
                enrollment, created = Enrollment.objects.select_for_update().get_or_create(
                    student=request.user,
                    course=course,
                    defaults={"has_paid": course.price == 0},
                )
        except IntegrityError:
            enrollment = Enrollment.objects.get(student=request.user, course=course)
            created = False

        serializer = self.get_serializer(enrollment)
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=code)
