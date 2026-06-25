from django.urls import path
from .views import CheckFileView, HistoryView, StatisticsView

urlpatterns = [
    path('api/check-file/', CheckFileView.as_view(), name='check_file'),
    path('api/history/', HistoryView.as_view(), name='history'),
    path('api/statistics/', StatisticsView.as_view(), name='statistics'),
]