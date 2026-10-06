from django.urls import path
from .views import RegisterView, RoleTokenObtainPairView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", RoleTokenObtainPairView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
]
