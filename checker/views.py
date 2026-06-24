from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.file_type_detector import is_allowed_extension
from .services.analyzer import analyze_file

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