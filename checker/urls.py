from django.urls import path
from .views import CheckFileView

urlpatterns = [
    path('api/check-file/', CheckFileView.as_view()),
]