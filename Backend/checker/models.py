from django.db import models

class CheckResult(models.Model):
    hash = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    extension = models.CharField(max_length=10)
    size = models.IntegerField()
    
    scan_date = models.DateTimeField(auto_now_add=True)
    is_safe = models.BooleanField()
    risk_level = models.CharField(max_length=10)
    details = models.JSONField()

    def __str__(self):
        return f"{self.name} - {self.risk_level}"