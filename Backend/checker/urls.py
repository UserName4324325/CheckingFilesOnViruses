from django.urls import path
from .views import CheckFileView, HistoryView, StatisticsFilesView

urlpatterns = [
    path('api/check-file/', CheckFileView.as_view(), name='check_file'),
    path('api/history/', HistoryView.as_view(), name='history'),
    path('api/statisticsFiles/', StatisticsFilesView.as_view(), name='statistics_files'),
]