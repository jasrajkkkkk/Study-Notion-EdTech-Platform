from rest_framework import permissions


class IsInstructor(permissions.BasePermission):
    """Only users with role=INSTRUCTOR may create/modify courses."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_instructor)


class IsCourseOwnerOrReadOnly(permissions.BasePermission):
    """Instructors can only edit their own courses; everyone can read
    published courses."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor_id == request.user.id
