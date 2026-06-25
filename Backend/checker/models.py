from django.db import models

class File(models.Model):
    hash = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    extension = models.CharField(max_length=10)
    size = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ScanResult(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='scans')
    scan_date = models.DateTimeField(auto_now_add=True)
    is_safe = models.BooleanField()
    risk_level = models.CharField(max_length=10)
    details = models.JSONField()

    def __str__(self):
        return f"{self.file.name} - {self.scan_date}"