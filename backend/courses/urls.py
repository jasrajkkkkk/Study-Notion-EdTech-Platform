from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet, CategoryViewSet

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("", CourseViewSet, basename="course")

lesson_list = LessonViewSet.as_view({"get": "list", "post": "create"})
lesson_detail = LessonViewSet.as_view(
    {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
)

urlpatterns = [
    path("<int:course_pk>/lessons/", lesson_list, name="course-lessons"),
    path("<int:course_pk>/lessons/<int:pk>/", lesson_detail, name="course-lesson-detail"),
] + router.urls
