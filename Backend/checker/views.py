from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.file_type_detector import is_allowed_extension
from .services.analyzer import analyze_file
from .models import ScanResult, File
from django.db.models import Count
from datetime import datetime, timedelta

class CheckFileView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        
        if not file:
            return Response(
                {"error": "файл не загружен"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not is_allowed_extension(file.name):
            return Response(
                {"error": "неподдерживаемый формат файла"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = analyze_file(file)
        return Response(result)


class HistoryView(APIView):
    def get(self, request):
        results = ScanResult.objects.select_related('file').order_by('-scan_date')[:50]
        data = [{
            'filename': r.file.name,
            'extension': r.file.extension,
            'date': r.scan_date,
            'is_safe': r.is_safe,
            'risk_level': r.risk_level,
            'details': r.details
        } for r in results]
        return Response(data)


class StatisticsView(APIView):
    def get(self, request):
        total = ScanResult.objects.count()
        safe = ScanResult.objects.filter(is_safe=True).count()
        dangerous = ScanResult.objects.filter(is_safe=False).count()
        
        by_extension = ScanResult.objects.values('file__extension').annotate(
            count=Count('id')
        ).order_by('-count')
        
        week_ago = datetime.now() - timedelta(days=7)
        by_day = ScanResult.objects.filter(scan_date__gte=week_ago).values('scan_date__date').annotate(
            count=Count('id')
        ).order_by('scan_date__date')
        
        return Response({
            'total': total,
            'safe': safe,
            'dangerous': dangerous,
            'by_extension': list(by_extension),
            'by_day': list(by_day)
        })