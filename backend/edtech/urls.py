from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("users.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/enrollments/", include("enrollments.urls")),
    path("api/ratings/", include("ratings.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
