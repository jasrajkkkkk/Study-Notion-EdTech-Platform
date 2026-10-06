from django.conf import settings
from django.db import models


class Enrollment(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(
        "courses.Course", on_delete=models.CASCADE, related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    has_paid = models.BooleanField(default=False)  # set True once payment verified
    progress_percent = models.PositiveSmallIntegerField(default=0)

    class Meta:
        # The DB itself refuses a duplicate row even if two requests race
        # past the application-level check at the same instant — this is
        # the real safety net for "concurrent access" correctness.
        constraints = [
            models.UniqueConstraint(fields=["student", "course"], name="unique_enrollment")
        ]

    def __str__(self):
        return f"{self.student} -> {self.course}"
