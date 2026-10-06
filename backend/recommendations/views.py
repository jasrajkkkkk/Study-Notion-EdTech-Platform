from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import hybrid_recommendations
from courses.serializers import CourseListSerializer


class RecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        courses = hybrid_recommendations(request.user, limit=10)
        return Response(CourseListSerializer(courses, many=True).data)
