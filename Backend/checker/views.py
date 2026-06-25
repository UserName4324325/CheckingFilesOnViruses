from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.file_type_detector import is_allowed_extension
from .services.analyzer import analyze_file
from .models import CheckResult
from django.db.models import Count

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
        results = CheckResult.objects.order_by('-scan_date')[:50]
        data = [{
            'filename': r.name,
            'extension': r.extension,
            'date': r.scan_date,
            'is_safe': r.is_safe,
            'risk_level': r.risk_level,
            'details': r.details
        } for r in results]
        return Response(data)


class StatisticsFilesView(APIView):
    def get(self, request):
        stats = CheckResult.objects.values('risk_level').annotate(count=Count('id'))
        
        result = {"low": 0, "medium": 0, "high": 0}
        for entry in stats:
            risk = entry['risk_level']
            if risk in result:
                result[risk] = entry['count']
        
        return Response(result)