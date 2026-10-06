from django.db.models import Q
from rest_framework import viewsets, filters, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Course, Lesson, Category
from .serializers import (
    CourseListSerializer, CourseDetailSerializer, LessonSerializer, CategorySerializer,
)
from .permissions import IsInstructor, IsCourseOwnerOrReadOnly


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class CourseViewSet(viewsets.ModelViewSet):
    """
    - Students (and anyone browsing) see only published courses.
    - Instructors additionally see their own unpublished drafts.
    - Only the owning instructor can update/delete.
    """
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "tags", "description"]
    permission_classes = [permissions.IsAuthenticated, IsInstructor, IsCourseOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CourseDetailSerializer
        return CourseListSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Course.objects.select_related("instructor", "category")
        if user.is_authenticated and user.is_instructor:
            return qs.filter(Q(is_published=True) | Q(instructor=user)).distinct()
        return qs.filter(is_published=True)

    def perform_create(self, serializer):
        if not self.request.user.is_instructor:
            raise PermissionDenied("Only instructors can create courses.")
        serializer.save(instructor=self.request.user)


class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated, IsInstructor]

    def get_queryset(self):
        return Lesson.objects.filter(course_id=self.kwargs["course_pk"])

    def perform_create(self, serializer):
        course = Course.objects.get(pk=self.kwargs["course_pk"])
        if course.instructor_id != self.request.user.id:
            raise PermissionDenied("You can only add lessons to your own course.")
        serializer.save(course=course)
